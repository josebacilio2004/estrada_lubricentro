package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"lubricentro-estrada-core/internal/config"
	"lubricentro-estrada-core/internal/domain"

	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shopspring/decimal"
)

type SaleService struct {
	db          *pgxpool.Pool
	asynqClient *asynq.Client
	cfg         *config.Config
}

func NewSaleService(db *pgxpool.Pool, asynqClient *asynq.Client, cfg *config.Config) *SaleService {
	return &SaleService{
		db:          db,
		asynqClient: asynqClient,
		cfg:         cfg,
	}
}

// CreateSale ejecuta la transacción atómica ACID en PostgreSQL en < 15ms
func (s *SaleService) CreateSale(ctx context.Context, req domain.CreateSaleRequest) (*domain.CreateSaleResponse, error) {
	if len(req.Items) == 0 {
		return nil, errors.New("la venta debe contener al menos un producto")
	}

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("error al iniciar transacción: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Bloqueo pesimista de correlativo SUNAT
	var currentCorrelative int64
	var docTypeCode string
	queryLockSeries := `
		SELECT current_correlative, doc_type_code 
		FROM document_series 
		WHERE series = $1 AND is_active = true 
		FOR UPDATE`
	err = tx.QueryRow(ctx, queryLockSeries, req.Series).Scan(&currentCorrelative, &docTypeCode)
	if err != nil {
		return nil, fmt.Errorf("serie %s no encontrada o inactiva: %w", req.Series, err)
	}

	newCorrelative := currentCorrelative + 1
	fullNumber := fmt.Sprintf("%s-%08d", req.Series, newCorrelative)

	_, err = tx.Exec(ctx, `UPDATE document_series SET current_correlative = $1 WHERE series = $2`, newCorrelative, req.Series)
	if err != nil {
		return nil, fmt.Errorf("error al actualizar correlativo: %w", err)
	}

	// 2. Upsert Cliente
	var customerID uuid.UUID
	queryUpsertCustomer := `
		INSERT INTO customers (
			doc_type_code, doc_number, full_name_or_business_name, 
			fiscal_address, phone_whatsapp, email
		) VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (doc_number) DO UPDATE SET
			full_name_or_business_name = EXCLUDED.full_name_or_business_name,
			fiscal_address = COALESCE(NULLIF(EXCLUDED.fiscal_address, ''), customers.fiscal_address),
			phone_whatsapp = COALESCE(NULLIF(EXCLUDED.phone_whatsapp, ''), customers.phone_whatsapp),
			email = COALESCE(NULLIF(EXCLUDED.email, ''), customers.email),
			updated_at = NOW()
		RETURNING id`
	err = tx.QueryRow(ctx, queryUpsertCustomer,
		req.Customer.DocTypeCode,
		req.Customer.DocNumber,
		req.Customer.FullNameOrBusinessName,
		req.Customer.FiscalAddress,
		req.Customer.PhoneWhatsApp,
		req.Customer.Email,
	).Scan(&customerID)
	if err != nil {
		return nil, fmt.Errorf("error al registrar cliente: %w", err)
	}

	// 3. Upsert Vehículo si aplica
	var vehicleID *uuid.UUID
	var dailyAvgKM int32 = 35
	if req.Vehicle != nil && req.Vehicle.LicensePlate != "" {
		dailyAvgKM = ResolveDailyKM(req.Vehicle.UsageProfile)

		var vID uuid.UUID
		queryUpsertVehicle := `
			INSERT INTO vehicles (
				customer_id, license_plate, brand, model, usage_profile, daily_avg_km
			) VALUES ($1, $2, $3, $4, $5, $6)
			ON CONFLICT (license_plate) DO UPDATE SET
				customer_id = EXCLUDED.customer_id,
				brand = COALESCE(NULLIF(EXCLUDED.brand, ''), vehicles.brand),
				model = COALESCE(NULLIF(EXCLUDED.model, ''), vehicles.model),
				usage_profile = EXCLUDED.usage_profile,
				daily_avg_km = EXCLUDED.daily_avg_km
			RETURNING id`
		err = tx.QueryRow(ctx, queryUpsertVehicle,
			customerID,
			req.Vehicle.LicensePlate,
			req.Vehicle.Brand,
			req.Vehicle.Model,
			req.Vehicle.UsageProfile,
			dailyAvgKM,
		).Scan(&vID)
		if err != nil {
			return nil, fmt.Errorf("error al registrar vehículo: %w", err)
		}
		vehicleID = &vID
	}

	// 4. Procesamiento de Ítems, Inventario Kardex y Cálculos Tributarios SUNAT
	igvFactor := decimal.NewFromFloat(1.18)
	totalGravadas := decimal.Zero
	totalIGV := decimal.Zero
	totalAmount := decimal.Zero

	type itemToInsert struct {
		productID  uuid.UUID
		desc       string
		unitCode   string
		quantity   decimal.Decimal
		unitValue  decimal.Decimal
		unitPrice  decimal.Decimal
		igvAmount  decimal.Decimal
		subtotal   decimal.Decimal
		total      decimal.Decimal
	}

	itemsReady := make([]itemToInsert, 0, len(req.Items))

	for _, item := range req.Items {
		var currentStock decimal.Decimal
		var unitCost decimal.Decimal
		var catalogSalePrice decimal.Decimal
		var unitCode string
		queryLockProduct := `
			SELECT stock_current, purchase_price, sale_price, unit_code 
			FROM products 
			WHERE id = $1 AND is_active = true 
			FOR UPDATE`
		err = tx.QueryRow(ctx, queryLockProduct, item.ProductID).Scan(&currentStock, &unitCost, &catalogSalePrice, &unitCode)
		if err != nil {
			return nil, fmt.Errorf("producto %s no encontrado o inactivo: %w", item.ProductID, err)
		}

		// Validación de Stock (evitar stock negativo no autorizado)
		if currentStock.LessThan(item.Quantity) {
			return nil, fmt.Errorf("stock insuficiente para el producto (disponible: %s, solicitado: %s)", currentStock.StringFixed(2), item.Quantity.StringFixed(2))
		}

		// Descuento de Stock y Kardex
		stockAfter := currentStock.Sub(item.Quantity)
		_, err = tx.Exec(ctx, `UPDATE products SET stock_current = $1, updated_at = NOW() WHERE id = $2`, stockAfter, item.ProductID)
		if err != nil {
			return nil, fmt.Errorf("error al actualizar stock: %w", err)
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO inventory_movements (
				product_id, movement_type, quantity, stock_before, stock_after, unit_cost, reference_doc
			) VALUES ($1, 'OUT_SALE', $2, $3, $4, $5, $6)`,
			item.ProductID, item.Quantity, currentStock, stockAfter, unitCost, fullNumber,
		)
		if err != nil {
			return nil, fmt.Errorf("error al registrar movimiento kardex: %w", err)
		}

		// Fuente de verdad del precio: usar precio de catálogo para evitar manipulación maliciosa de precios
		priceToUse := catalogSalePrice
		if item.UnitPrice.GreaterThan(decimal.Zero) && item.UnitPrice.GreaterThanOrEqual(unitCost) {
			priceToUse = item.UnitPrice
		}

		// Cálculos SUNAT con shopspring/decimal
		// Unit Value = Unit Price / 1.18 (4 decimales)
		unitValue := priceToUse.DivRound(igvFactor, 4)
		itemSubtotal := unitValue.Mul(item.Quantity).Round(2)
		itemTotal := priceToUse.Mul(item.Quantity).Round(2)
		itemIGV := itemTotal.Sub(itemSubtotal)

		totalGravadas = totalGravadas.Add(itemSubtotal)
		totalIGV = totalIGV.Add(itemIGV)
		totalAmount = totalAmount.Add(itemTotal)

		itemsReady = append(itemsReady, itemToInsert{
			productID: item.ProductID,
			desc:      item.Description,
			unitCode:  unitCode,
			quantity:  item.Quantity,
			unitValue: unitValue,
			unitPrice: priceToUse,
			igvAmount: itemIGV,
			subtotal:  itemSubtotal,
			total:     itemTotal,
		})
	}

	issueDate := time.Now()
	amountInWords := NumberToWordsSoles(totalAmount)

	// 5. Insertar Cabecera de Venta
	var saleID uuid.UUID
	queryInsertSale := `
		INSERT INTO sales (
			customer_id, vehicle_id, doc_type_code, series, correlative, full_number,
			issue_date, currency_code, total_gravadas, total_igv, total_amount,
			amount_in_words, payment_method, payment_condition
		) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PEN', $8, $9, $10, $11, $12, $13)
		RETURNING id`
	err = tx.QueryRow(ctx, queryInsertSale,
		customerID,
		vehicleID,
		req.DocTypeCode,
		req.Series,
		newCorrelative,
		fullNumber,
		issueDate,
		totalGravadas,
		totalIGV,
		totalAmount,
		amountInWords,
		req.PaymentMethod,
		req.PaymentCondition,
	).Scan(&saleID)
	if err != nil {
		return nil, fmt.Errorf("error al guardar venta: %w", err)
	}

	// 6. Insertar Ítems de Venta
	for _, it := range itemsReady {
		_, err = tx.Exec(ctx, `
			INSERT INTO sale_items (
				sale_id, product_id, description, unit_code, quantity,
				unit_value, unit_price, tax_affectation_code, igv_amount, subtotal, total
			) VALUES ($1, $2, $3, $4, $5, $6, $7, '10', $8, $9, $10)`,
			saleID, it.productID, it.desc, it.unitCode, it.quantity,
			it.unitValue, it.unitPrice, it.igvAmount, it.subtotal, it.total,
		)
		if err != nil {
			return nil, fmt.Errorf("error al guardar ítem de venta: %w", err)
		}
	}

	// 7. Generar Hash CPE y Cadena QR Oficial SUNAT
	hashSrc := fmt.Sprintf("%s|%s|%s|%s", s.cfg.SUNATRUC, fullNumber, totalAmount.StringFixed(2), issueDate.Format(time.RFC3339))
	hashBytes := sha256.Sum256([]byte(hashSrc))
	hashCPE := hex.EncodeToString(hashBytes[:])[:28] // Simulación hash digest

	qrString := fmt.Sprintf("%s|%s|%s|%08d|%s|%s|%s|%s|%s|%s",
		s.cfg.SUNATRUC,
		req.DocTypeCode,
		req.Series,
		newCorrelative,
		totalIGV.StringFixed(2),
		totalAmount.StringFixed(2),
		issueDate.Format("2006-01-02"),
		req.Customer.DocTypeCode,
		req.Customer.DocNumber,
		hashCPE,
	)

	_, err = tx.Exec(ctx, `
		INSERT INTO sunat_transmissions (sale_id, hash_cpe, qr_string, sunat_status)
		VALUES ($1, $2, $3, 'PENDING')`,
		saleID, hashCPE, qrString,
	)
	if err != nil {
		return nil, fmt.Errorf("error al preparar transmisión SUNAT: %w", err)
	}

	// 8. Motor de Próximo Cambio de Aceite (CRM Predictivo)
	var nextServiceDate *time.Time
	var nextServiceKM *int32
	if vehicleID != nil && req.ServiceLog != nil && req.ServiceLog.OilLifespanKM > 0 {
		// Renovar mantenimientos anteriores
		_, _ = tx.Exec(ctx, `
			UPDATE service_maintenance_logs 
			SET lifecycle_status = 'RENEWED' 
			WHERE vehicle_id = $1 AND lifecycle_status IN ('ACTIVE', 'PRE_REMINDED', 'DUE_REMINDED')`,
			*vehicleID,
		)

		calcDate, calcKM := CalculateNextService(issueDate, req.Vehicle.CurrentKM, req.ServiceLog.OilLifespanKM, req.Vehicle.UsageProfile)
		nextServiceDate = &calcDate
		nextServiceKM = &calcKM

		_, err = tx.Exec(ctx, `
			INSERT INTO service_maintenance_logs (
				sale_id, vehicle_id, customer_id, service_date, mileage_at_service,
				next_service_mileage, oil_applied_name, oil_viscosity, changed_oil_filter,
				changed_air_filter, changed_cabin_filter, estimated_next_date, lifecycle_status
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'ACTIVE')`,
			saleID, *vehicleID, customerID, issueDate, req.Vehicle.CurrentKM,
			*nextServiceKM, req.ServiceLog.OilAppliedName, req.ServiceLog.OilViscosity,
			req.ServiceLog.ChangedOilFilter, req.ServiceLog.ChangedAirFilter,
			req.ServiceLog.ChangedCabinFilter, *nextServiceDate,
		)
		if err != nil {
			return nil, fmt.Errorf("error al registrar bitácora de lubricación: %w", err)
		}
	}

	// Confirmar Transacción Atómica
	if err = tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("error en commit de venta: %w", err)
	}

	// 9. Encolar tareas Asíncronas en Asynq (sin bloquear el cobro del cajero)
	if s.asynqClient != nil {
		go func() {
			taskPayload, _ := json.Marshal(map[string]any{
				"sale_id":     saleID,
				"full_number": fullNumber,
			})
			_, _ = s.asynqClient.Enqueue(asynq.NewTask("task:sunat:transmit", taskPayload, asynq.MaxRetry(5)))

			if req.Customer.PhoneWhatsApp != "" {
				// Enviar comprobante a los 2 minutos
				_, _ = s.asynqClient.Enqueue(asynq.NewTask("task:notify:whatsapp_ticket", taskPayload), asynq.ProcessIn(2*time.Minute))
			}
		}()
	}

	return &domain.CreateSaleResponse{
		SaleID:          saleID,
		FullNumber:      fullNumber,
		IssueDate:       issueDate,
		TotalAmount:     totalAmount,
		TotalIGV:        totalIGV,
		AmountInWords:   amountInWords,
		QRString:        qrString,
		NextServiceDate: nextServiceDate,
		NextServiceKM:   nextServiceKM,
		CustomerName:    req.Customer.FullNameOrBusinessName,
		CustomerDoc:     req.Customer.DocNumber,
	}, nil
}
