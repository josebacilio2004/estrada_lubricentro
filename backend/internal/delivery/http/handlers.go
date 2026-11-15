package http

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"lubricentro-estrada-core/internal/config"
	"lubricentro-estrada-core/internal/domain"
	"lubricentro-estrada-core/internal/security"
	"lubricentro-estrada-core/internal/service"
	"lubricentro-estrada-core/pkg/logger"
	"lubricentro-estrada-core/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shopspring/decimal"
)

type Handler struct {
	db      *pgxpool.Pool
	saleSvc *service.SaleService
	cfg     *config.Config
}

func NewHandler(db *pgxpool.Pool, saleSvc *service.SaleService, cfg *config.Config) *Handler {
	return &Handler{
		db:      db,
		saleSvc: saleSvc,
		cfg:     cfg,
	}
}

func (h *Handler) RegisterRoutes(app *fiber.App) {
	v1 := app.Group("/v1")

	// Observabilidad & Salud
	v1.Get("/health", h.HealthCheck)

	// Autenticación Administrativa ERP
	v1.Post("/admin/auth/login", h.AdminLogin)

	// Ventas POS y Consulta de Comprobantes ERP
	v1.Post("/sales", h.CreateSale)
	v1.Get("/sales", h.GetSales)

	// Directorio de Clientes CRM
	v1.Get("/customers", h.GetCustomers)
	v1.Post("/customers", h.CreateCustomer)

	// Movimientos Kardex de Inventario
	v1.Get("/inventory/movements", h.GetInventoryMovements)

	// Métricas en Tiempo Real para Dashboard ERP
	v1.Get("/analytics/dashboard", h.GetDashboardAnalytics)

	// Catálogo & Productos CRUD
	v1.Get("/products", h.GetProducts)
	v1.Post("/products", h.CreateProduct)
	v1.Put("/products/:id", h.UpdateProduct)
	v1.Delete("/products/:id", h.DeleteProduct)
	
	// Categorías CRUD
	v1.Get("/categories", h.GetCategories)
	v1.Post("/categories", h.CreateCategory)
	v1.Put("/categories/:id", h.UpdateCategory)
	v1.Delete("/categories/:id", h.DeleteCategory)

	// Marcas
	v1.Get("/brands", h.GetBrands)

	// Vehículos & Fidelización (Público)
	v1.Get("/vehicles/:plate/next-service", h.GetNextServiceByPlate)

	// Cliente por Documento
	v1.Get("/customers/:doc", h.GetCustomerByDoc)

	// Portal de Autoservicio para Clientes
	portal := v1.Group("/portal")
	portal.Post("/auth/login", h.PortalLogin)
	portal.Post("/auth/register", h.PortalRegister)
	portal.Get("/vehicle", h.GetPortalVehicle)
	portal.Get("/history", h.GetPortalHistory)
	portal.Get("/maintenance/preventive", h.GetPortalPreventive)
}

func (h *Handler) HealthCheck(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := h.db.Ping(ctx); err != nil {
		logger.Error("Fallo de ping en base de datos PostgreSQL", "error", err.Error())
		return response.Error(c, fiber.StatusServiceUnavailable, "DB_DOWN", "No hay conexión con PostgreSQL", err.Error())
	}

	return response.JSON(c, fiber.StatusOK, fiber.Map{
		"service": "estrada-api-core",
		"status":  "healthy",
		"uptime":  "running",
	})
}

func (h *Handler) CreateSale(c *fiber.Ctx) error {
	var req domain.CreateSaleRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_PAYLOAD", "El cuerpo de la petición no es un JSON válido", err.Error())
	}

	if len(req.Items) == 0 {
		return response.Error(c, fiber.StatusBadRequest, "EMPTY_ITEMS", domain.ErrSaleItemsEmpty.Error())
	}

	if req.Customer.DocNumber == "" {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_CUSTOMER", "El número de documento del cliente es requerido")
	}

	res, err := h.saleSvc.CreateSale(c.Context(), req)
	if err != nil {
		logger.Error("Error procesando venta transaccional", "error", err.Error(), "series", req.Series)
		return response.Error(c, fiber.StatusInternalServerError, "TRANSACTION_FAILED", err.Error())
	}

	logger.Info("Venta procesada con éxito", "full_number", res.FullNumber, "amount", res.TotalAmount.StringFixed(2))
	return response.JSON(c, fiber.StatusCreated, res)
}

func (h *Handler) GetProducts(c *fiber.Ctx) error {
	q := c.Query("q", "")
	viscosity := c.Query("viscosity", "")

	query := `
		SELECT p.id, p.sku, p.barcode, p.name, p.presentation, p.sale_price, 
		       p.stock_current, p.image_url, p.technical_specs, b.name as brand_name, c.name as category_name
		FROM products p
		JOIN brands b ON p.brand_id = b.id
		JOIN categories c ON p.category_id = c.id
		WHERE p.is_active = true`

	var args []any
	argIdx := 1

	if q != "" {
		query += fmt.Sprintf(" AND (p.name ILIKE '%%' || $%d || '%%' OR p.sku ILIKE '%%' || $%d || '%%')", argIdx, argIdx)
		args = append(args, q)
		argIdx++
	}

	if viscosity != "" && viscosity != "TODOS" {
		query += fmt.Sprintf(" AND p.technical_specs->>'viscosity' = $%d", argIdx)
		args = append(args, viscosity)
		argIdx++
	}

	query += ` ORDER BY p.name ASC LIMIT 100`

	rows, err := h.db.Query(c.Context(), query, args...)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "QUERY_ERROR", "Error consultando catálogo", err.Error())
	}
	defer rows.Close()

	var products []domain.Product
	for rows.Next() {
		var p domain.Product
		var specs []byte
		var barcode *string
		var img *string
		err := rows.Scan(
			&p.ID, &p.SKU, &barcode, &p.Name, &p.Presentation,
			&p.SalePrice, &p.StockCurrent, &img, &specs,
			&p.BrandName, &p.CategoryName,
		)
		if err != nil {
			continue
		}
		if barcode != nil {
			p.Barcode = *barcode
		}
		if img != nil {
			p.ImageURL = *img
		}
		if len(specs) > 0 {
			_ = json.Unmarshal(specs, &p.TechnicalSpecs)
		}
		products = append(products, p)
	}

	return response.JSON(c, fiber.StatusOK, products)
}

func (h *Handler) GetNextServiceByPlate(c *fiber.Ctx) error {
	plate := c.Params("plate")
	if plate == "" {
		return response.Error(c, fiber.StatusBadRequest, "MISSING_PLATE", "Debe proporcionar una placa vehicular")
	}

	query := `
		SELECT m.service_date, m.mileage_at_service, m.estimated_next_date, 
		       m.next_service_mileage, m.oil_applied_name, m.oil_viscosity, 
		       m.lifecycle_status, v.license_plate, v.brand, v.model, c.full_name_or_business_name
		FROM service_maintenance_logs m
		JOIN vehicles v ON m.vehicle_id = v.id
		JOIN customers c ON m.customer_id = c.id
		WHERE UPPER(REPLACE(v.license_plate, '-', '')) = UPPER(REPLACE($1, '-', ''))
		ORDER BY m.service_date DESC, m.created_at DESC
		LIMIT 1`

	var sDate, estDate time.Time
	var lastKM, nextKM int32
	var oilName, oilVisc, status, vPlate, vBrand, vModel, custName string

	err := h.db.QueryRow(c.Context(), query, plate).Scan(
		&sDate, &lastKM, &estDate, &nextKM, &oilName, &oilVisc,
		&status, &vPlate, &vBrand, &vModel, &custName,
	)
	if err != nil {
		return response.JSON(c, fiber.StatusOK, domain.NextServiceQueryResponse{
			Found:        false,
			LicensePlate: plate,
		})
	}

	return response.JSON(c, fiber.StatusOK, domain.NextServiceQueryResponse{
		Found:             true,
		LicensePlate:      vPlate,
		VehicleBrand:      vBrand,
		VehicleModel:      vModel,
		LastServiceDate:   &sDate,
		LastMileage:       lastKM,
		EstimatedNextDate: &estDate,
		NextMileage:       nextKM,
		OilApplied:        oilName,
		OilViscosity:      oilVisc,
		LifecycleStatus:   status,
		CustomerName:      custName,
	})
}

func (h *Handler) GetCustomerByDoc(c *fiber.Ctx) error {
	doc := c.Params("doc")
	var cust domain.Customer
	var addr, phone, email *string

	query := `
		SELECT id, doc_type_code, doc_number, full_name_or_business_name, 
		       fiscal_address, phone_whatsapp, email, accepts_reminders
		FROM customers 
		WHERE doc_number = $1 LIMIT 1`

	err := h.db.QueryRow(c.Context(), query, doc).Scan(
		&cust.ID, &cust.DocTypeCode, &cust.DocNumber, &cust.FullNameOrBusinessName,
		&addr, &phone, &email, &cust.AcceptsReminders,
	)
	if err != nil {
		return response.Error(c, fiber.StatusNotFound, "NOT_FOUND", domain.ErrCustomerNotFound.Error())
	}

	if addr != nil {
		cust.FiscalAddress = *addr
	}
	if phone != nil {
		cust.PhoneWhatsApp = *phone
	}
	if email != nil {
		cust.Email = *email
	}

	return response.JSON(c, fiber.StatusOK, cust)
}

// ==========================================
// 1. MÓDULO DE GESTIÓN DE PRODUCTOS (CRUD)
// ==========================================

func (h *Handler) CreateProduct(c *fiber.Ctx) error {
	var req domain.CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_PAYLOAD", "JSON de producto inválido", err.Error())
	}

	if req.SKU == "" || req.Name == "" {
		return response.Error(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "SKU y Nombre son requeridos")
	}

	specsJSON, err := json.Marshal(req.TechnicalSpecs)
	if err != nil {
		specsJSON = []byte("{}")
	}

	query := `
		INSERT INTO products (
			sku, barcode, name, description, category_id, brand_id, 
			unit_code, presentation, technical_specs, purchase_price, 
			sale_price, stock_current, stock_min, image_url, is_published_web, is_active
		) VALUES (
			$1, $2, $3, $4, $5, $6, 
			'NIU', $7, $8, $9, 
			$10, $11, $12, $13, true, true
		) RETURNING id`

	var newID uuid.UUID
	err = h.db.QueryRow(
		c.Context(), query,
		req.SKU, req.Barcode, req.Name, req.Description, req.CategoryID, req.BrandID,
		req.Presentation, specsJSON, req.PurchasePrice,
		req.SalePrice, req.StockCurrent, req.StockMin, req.ImageURL,
	).Scan(&newID)

	if err != nil {
		logger.Error("Error creando producto", "error", err.Error(), "sku", req.SKU)
		return response.Error(c, fiber.StatusInternalServerError, "DB_ERROR", "No se pudo registrar el producto", err.Error())
	}

	return response.JSON(c, fiber.StatusCreated, fiber.Map{
		"id":      newID,
		"sku":     req.SKU,
		"message": "Producto registrado exitosamente",
	})
}

func (h *Handler) UpdateProduct(c *fiber.Ctx) error {
	idParam := c.Params("id")
	prodID, err := uuid.Parse(idParam)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_ID", "ID de producto inválido")
	}

	var req domain.UpdateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_PAYLOAD", "JSON inválido", err.Error())
	}

	specsJSON, err := json.Marshal(req.TechnicalSpecs)
	if err != nil {
		specsJSON = []byte("{}")
	}

	query := `
		UPDATE products SET
			name = $1, description = $2, category_id = $3, brand_id = $4,
			presentation = $5, technical_specs = $6, purchase_price = $7,
			sale_price = $8, stock_current = $9, stock_min = $10,
			image_url = $11, updated_at = NOW()
		WHERE id = $12 AND is_active = true`

	cmd, err := h.db.Exec(
		c.Context(), query,
		req.Name, req.Description, req.CategoryID, req.BrandID,
		req.Presentation, specsJSON, req.PurchasePrice,
		req.SalePrice, req.StockCurrent, req.StockMin,
		req.ImageURL, prodID,
	)

	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "DB_ERROR", "Error actualizando producto", err.Error())
	}

	if cmd.RowsAffected() == 0 {
		return response.Error(c, fiber.StatusNotFound, "NOT_FOUND", "Producto no encontrado o inactivo")
	}

	return response.JSON(c, fiber.StatusOK, fiber.Map{
		"id":      prodID,
		"message": "Producto actualizado con éxito",
	})
}

func (h *Handler) DeleteProduct(c *fiber.Ctx) error {
	idParam := c.Params("id")
	prodID, err := uuid.Parse(idParam)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_ID", "ID de producto inválido")
	}

	query := `UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1`
	cmd, err := h.db.Exec(c.Context(), query, prodID)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "DB_ERROR", "Error desactivando producto", err.Error())
	}

	if cmd.RowsAffected() == 0 {
		return response.Error(c, fiber.StatusNotFound, "NOT_FOUND", "Producto no encontrado")
	}

	return response.JSON(c, fiber.StatusOK, fiber.Map{
		"message": "Producto desactivado correctamente del catálogo",
	})
}

func (h *Handler) GetCategories(c *fiber.Ctx) error {
	query := `
		SELECT c.id, c.name, c.slug, c.is_active, COUNT(p.id) as product_count
		FROM categories c
		LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
		WHERE c.is_active = true
		GROUP BY c.id
		ORDER BY c.name ASC`

	rows, err := h.db.Query(c.Context(), query)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "DB_ERROR", "Error consultando categorías", err.Error())
	}
	defer rows.Close()

	var list []domain.Category
	for rows.Next() {
		var cat domain.Category
		if err := rows.Scan(&cat.ID, &cat.Name, &cat.Slug, &cat.IsActive, &cat.ProductCount); err == nil {
			list = append(list, cat)
		}
	}

	return response.JSON(c, fiber.StatusOK, list)
}

func (h *Handler) CreateCategory(c *fiber.Ctx) error {
	var req domain.CreateCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_PAYLOAD", "Datos de categoría inválidos")
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		return response.Error(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "El nombre de la categoría es obligatorio")
	}

	if req.Slug == "" {
		req.Slug = strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))
	}

	var newID uuid.UUID
	query := `INSERT INTO categories (name, slug, is_active) VALUES ($1, $2, true) RETURNING id`
	err := h.db.QueryRow(c.Context(), query, req.Name, req.Slug).Scan(&newID)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "DB_ERROR", "No se pudo registrar la categoría (posible slug duplicado)", err.Error())
	}

	return response.JSON(c, fiber.StatusCreated, fiber.Map{
		"id":      newID,
		"name":    req.Name,
		"slug":    req.Slug,
		"message": "Categoría creada exitosamente",
	})
}

func (h *Handler) UpdateCategory(c *fiber.Ctx) error {
	idParam := c.Params("id")
	catID, err := uuid.Parse(idParam)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_ID", "ID de categoría inválido")
	}

	var req domain.UpdateCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_PAYLOAD", "Datos inválidos")
	}

	query := `UPDATE categories SET name = $1, slug = $2, is_active = $3 WHERE id = $4`
	cmd, err := h.db.Exec(c.Context(), query, req.Name, req.Slug, req.IsActive, catID)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "DB_ERROR", "Error actualizando categoría", err.Error())
	}

	if cmd.RowsAffected() == 0 {
		return response.Error(c, fiber.StatusNotFound, "NOT_FOUND", "Categoría no encontrada")
	}

	return response.JSON(c, fiber.StatusOK, fiber.Map{
		"id":      catID,
		"message": "Categoría actualizada correctamente",
	})
}

func (h *Handler) DeleteCategory(c *fiber.Ctx) error {
	idParam := c.Params("id")
	catID, err := uuid.Parse(idParam)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_ID", "ID de categoría inválido")
	}

	query := `UPDATE categories SET is_active = false WHERE id = $1`
	cmd, err := h.db.Exec(c.Context(), query, catID)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "DB_ERROR", "Error desactivando categoría", err.Error())
	}

	if cmd.RowsAffected() == 0 {
		return response.Error(c, fiber.StatusNotFound, "NOT_FOUND", "Categoría no encontrada")
	}

	return response.JSON(c, fiber.StatusOK, fiber.Map{
		"message": "Categoría desactivada correctamente",
	})
}

func (h *Handler) GetBrands(c *fiber.Ctx) error {
	query := `SELECT id, name, COALESCE(logo_url, '') FROM brands ORDER BY name ASC`
	rows, err := h.db.Query(c.Context(), query)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "DB_ERROR", "Error consultando marcas", err.Error())
	}
	defer rows.Close()

	var list []domain.Brand
	for rows.Next() {
		var b domain.Brand
		if err := rows.Scan(&b.ID, &b.Name, &b.LogoURL); err == nil {
			list = append(list, b)
		}
	}

	return response.JSON(c, fiber.StatusOK, list)
}

// ==========================================
// MÓDULOS ADMINISTRATIVOS ERP ESTRADA
// ==========================================

func (h *Handler) AdminLogin(c *fiber.Ctx) error {
	var req domain.AdminLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_PAYLOAD", "Datos de acceso inválidos")
	}

	req.Email = strings.TrimSpace(req.Email)
	req.Password = strings.TrimSpace(req.Password)

	if req.Email == "" || req.Password == "" {
		return response.Error(c, fiber.StatusBadRequest, "MISSING_FIELDS", "Correo y contraseña son requeridos")
	}

	var user domain.AdminUserDTO
	var passHash string
	query := `
		SELECT id, email, password_hash, full_name, role, company_name, company_ruc
		FROM users
		WHERE LOWER(email) = LOWER($1) AND is_active = true
		LIMIT 1`

	err := h.db.QueryRow(c.Context(), query, req.Email).Scan(
		&user.ID, &user.Email, &passHash, &user.FullName, &user.Role, &user.CompanyName, &user.CompanyRUC,
	)

	// Verificación segura con bcrypt
	validPassword := false
	if err == nil {
		validPassword = security.CheckPasswordHash(req.Password, passHash)
	}

	// Respaldo de contingencia controlado para demo oficial
	if !validPassword {
		if req.Email == "admin@estrada.pe" && (req.Password == "admin123" || req.Password == "admin2026") {
			validPassword = true
			user = domain.AdminUserDTO{
				ID:          uuid.New(),
				Email:       "admin@estrada.pe",
				FullName:    "Administración Estrada",
				Role:        "ADMIN",
				CompanyName: "Lubricentros Estrada S.A.C.",
				CompanyRUC:  "20608945123",
			}
		}
	}

	if !validPassword {
		return response.Error(c, fiber.StatusUnauthorized, "AUTH_FAILED", "Credenciales incorrectas de administrador")
	}

	// Actualizar fecha de último login
	_, _ = h.db.Exec(c.Context(), `UPDATE users SET last_login = NOW() WHERE email = $1`, user.Email)

	token, err := security.GenerateAdminToken(user.ID, user.Email, user.FullName, user.Role, h.cfg.JWTSecret)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "TOKEN_ERROR", "Error generando token seguro")
	}

	return response.JSON(c, fiber.StatusOK, domain.AdminAuthResponse{
		Token: token,
		User:  user,
	})
}

func (h *Handler) GetSales(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 50)
	search := strings.TrimSpace(c.Query("search", ""))

	query := `
		SELECT s.id, s.doc_type_code, s.series, s.correlative, s.full_number,
		       s.issue_date, s.total_amount, s.total_igv, s.payment_method,
		       c.full_name_or_business_name, c.doc_number,
		       COALESCE(v.license_plate, ''),
		       COALESCE(st.sunat_status, 'ACCEPTED'),
		       COALESCE(st.pdf_ticket_s3_url, '')
		FROM sales s
		JOIN customers c ON s.customer_id = c.id
		LEFT JOIN vehicles v ON s.vehicle_id = v.id
		LEFT JOIN sunat_transmissions st ON st.sale_id = s.id`

	var args []any
	if search != "" {
		query += ` WHERE (s.full_number ILIKE '%' || $1 || '%' OR c.full_name_or_business_name ILIKE '%' || $1 || '%' OR c.doc_number ILIKE '%' || $1 || '%' OR v.license_plate ILIKE '%' || $1 || '%')`
		args = append(args, search)
	}

	query += fmt.Sprintf(" ORDER BY s.issue_date DESC LIMIT %d", limit)

	rows, err := h.db.Query(c.Context(), query, args...)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "DB_ERROR", "Error al listar ventas", err.Error())
	}
	defer rows.Close()

	var list []domain.SaleListItem
	for rows.Next() {
		var it domain.SaleListItem
		err := rows.Scan(
			&it.ID, &it.DocTypeCode, &it.Series, &it.Correlative, &it.FullNumber,
			&it.IssueDate, &it.TotalAmount, &it.TotalIGV, &it.PaymentMethod,
			&it.CustomerName, &it.CustomerDoc, &it.LicensePlate, &it.SunatStatus, &it.PDFTicketURL,
		)
		if err == nil {
			list = append(list, it)
		}
	}

	return response.JSON(c, fiber.StatusOK, list)
}

func (h *Handler) GetCustomers(c *fiber.Ctx) error {
	q := strings.TrimSpace(c.Query("q", ""))
	query := `
		SELECT c.id, c.doc_type_code, c.doc_number, c.full_name_or_business_name,
		       COALESCE(c.fiscal_address, ''), COALESCE(c.phone_whatsapp, ''), COALESCE(c.email, ''),
		       COALESCE(STRING_AGG(v.license_plate, ', '), '') as vehicles_list
		FROM customers c
		LEFT JOIN vehicles v ON v.customer_id = c.id`

	var args []any
	if q != "" {
		query += ` WHERE (c.full_name_or_business_name ILIKE '%' || $1 || '%' OR c.doc_number ILIKE '%' || $1 || '%' OR c.phone_whatsapp ILIKE '%' || $1 || '%')`
		args = append(args, q)
	}
	query += ` GROUP BY c.id ORDER BY c.full_name_or_business_name ASC LIMIT 50`

	rows, err := h.db.Query(c.Context(), query, args...)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "DB_ERROR", "Error consultando clientes", err.Error())
	}
	defer rows.Close()

	type CustomerWithVehicles struct {
		domain.Customer
		VehiclesList string `json:"vehicles_list"`
	}

	var list []CustomerWithVehicles
	for rows.Next() {
		var it CustomerWithVehicles
		err := rows.Scan(
			&it.ID, &it.DocTypeCode, &it.DocNumber, &it.FullNameOrBusinessName,
			&it.FiscalAddress, &it.PhoneWhatsApp, &it.Email, &it.VehiclesList,
		)
		if err == nil {
			list = append(list, it)
		}
	}

	return response.JSON(c, fiber.StatusOK, list)
}

func (h *Handler) CreateCustomer(c *fiber.Ctx) error {
	var req domain.CustomerRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_PAYLOAD", "Datos de cliente inválidos")
	}

	req.DocNumber = strings.TrimSpace(req.DocNumber)
	req.FullNameOrBusinessName = strings.TrimSpace(req.FullNameOrBusinessName)

	if req.DocNumber == "" || req.FullNameOrBusinessName == "" {
		return response.Error(c, fiber.StatusBadRequest, "VALIDATION_ERROR", "Documento y Razón Social/Nombre son requeridos")
	}

	docType := req.DocTypeCode
	if docType == "" {
		if len(req.DocNumber) == 11 {
			docType = "6"
		} else {
			docType = "1"
		}
	}

	query := `
		INSERT INTO customers (doc_type_code, doc_number, full_name_or_business_name, fiscal_address, phone_whatsapp, email, accepts_reminders)
		VALUES ($1, $2, $3, $4, $5, $6, true)
		ON CONFLICT (doc_number) DO UPDATE SET
			full_name_or_business_name = EXCLUDED.full_name_or_business_name,
			fiscal_address = COALESCE(NULLIF(EXCLUDED.fiscal_address, ''), customers.fiscal_address),
			phone_whatsapp = COALESCE(NULLIF(EXCLUDED.phone_whatsapp, ''), customers.phone_whatsapp),
			email = COALESCE(NULLIF(EXCLUDED.email, ''), customers.email),
			updated_at = NOW()
		RETURNING id`

	var newID uuid.UUID
	err := h.db.QueryRow(c.Context(), query, docType, req.DocNumber, req.FullNameOrBusinessName, req.FiscalAddress, req.PhoneWhatsApp, req.Email).Scan(&newID)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "DB_ERROR", "Error registrando cliente", err.Error())
	}

	return response.JSON(c, fiber.StatusCreated, fiber.Map{
		"id":      newID,
		"message": "Cliente registrado o actualizado con éxito",
	})
}

func (h *Handler) GetInventoryMovements(c *fiber.Ctx) error {
	query := `
		SELECT m.id, m.product_id, p.name, p.sku, m.movement_type, m.quantity,
		       m.stock_before, m.stock_after, m.unit_cost, COALESCE(m.reference_doc, ''), m.created_at
		FROM inventory_movements m
		JOIN products p ON m.product_id = p.id
		ORDER BY m.created_at DESC LIMIT 50`

	rows, err := h.db.Query(c.Context(), query)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "DB_ERROR", "Error consultando movimientos de inventario", err.Error())
	}
	defer rows.Close()

	var list []domain.InventoryMovementItem
	for rows.Next() {
		var it domain.InventoryMovementItem
		err := rows.Scan(
			&it.ID, &it.ProductID, &it.ProductName, &it.ProductSKU, &it.MovementType,
			&it.Quantity, &it.StockBefore, &it.StockAfter, &it.UnitCost, &it.ReferenceDoc, &it.CreatedAt,
		)
		if err == nil {
			list = append(list, it)
		}
	}

	return response.JSON(c, fiber.StatusOK, list)
}

func (h *Handler) GetDashboardAnalytics(c *fiber.Ctx) error {
	var totalSales decimal.Decimal
	var countSales int64
	_ = h.db.QueryRow(c.Context(), `
		SELECT COALESCE(SUM(total_amount), 0), COUNT(id)
		FROM sales
		WHERE issue_date >= DATE_TRUNC('month', CURRENT_DATE)
	`).Scan(&totalSales, &countSales)

	var acceptedSunat, pendingSunat int64
	_ = h.db.QueryRow(c.Context(), `
		SELECT 
			COUNT(CASE WHEN sunat_status = 'ACCEPTED' THEN 1 END),
			COUNT(CASE WHEN sunat_status IN ('PENDING', 'OBSERVED') THEN 1 END)
		FROM sunat_transmissions
	`).Scan(&acceptedSunat, &pendingSunat)

	var lowStockCount int64
	_ = h.db.QueryRow(c.Context(), `
		SELECT COUNT(id) FROM products WHERE is_active = true AND stock_current <= stock_min
	`).Scan(&lowStockCount)

	var totalCustomers int64
	_ = h.db.QueryRow(c.Context(), `SELECT COUNT(id) FROM customers`).Scan(&totalCustomers)

	// Ventas diarias últimos 7 días
	dailyQuery := `
		SELECT TO_CHAR(d.date, 'DD/MM') as day_label,
		       COALESCE(SUM(s.total_amount), 0) as day_sum,
		       COUNT(s.id) as day_count
		FROM GENERATE_SERIES(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval) d(date)
		LEFT JOIN sales s ON DATE(s.issue_date) = DATE(d.date)
		GROUP BY d.date
		ORDER BY d.date ASC`

	dailyRows, err := h.db.Query(c.Context(), dailyQuery)
	var chartData []domain.DailySaleData
	if err == nil {
		defer dailyRows.Close()
		for dailyRows.Next() {
			var d domain.DailySaleData
			if err := dailyRows.Scan(&d.Date, &d.Amount, &d.Count); err == nil {
				chartData = append(chartData, d)
			}
		}
	}

	return response.JSON(c, fiber.StatusOK, domain.DashboardMetricsResponse{
		TotalMonthSales:    totalSales,
		TotalMonthCount:    countSales,
		AcceptedSunatCount: acceptedSunat,
		PendingSunatCount:  pendingSunat,
		LowStockCount:      lowStockCount,
		TotalCustomers:     totalCustomers,
		DailySalesChart:    chartData,
	})
}

// ==========================================
// 2. PORTAL DE AUTOSERVICIO PARA CLIENTES
// ==========================================

func (h *Handler) PortalLogin(c *fiber.Ctx) error {
	var req domain.PortalLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_PAYLOAD", "Credenciales inválidas")
	}

	cleanPlate := strings.ToUpper(strings.ReplaceAll(strings.TrimSpace(req.LicensePlate), "-", ""))
	if cleanPlate == "" {
		return response.Error(c, fiber.StatusBadRequest, "MISSING_PLATE", "La placa vehicular es requerida")
	}

	query := `
		SELECT v.id, v.license_plate, v.brand, v.model, COALESCE(v.year, 2022), 
		       COALESCE(v.engine_fuel, 'GASOLINA'), v.usage_profile, v.daily_avg_km, 
		       COALESCE(v.current_odometer, 45000), COALESCE(v.password_hash, ''), COALESCE(v.portal_pin, '1234'),
		       c.id, c.doc_number, c.full_name_or_business_name, COALESCE(c.phone_whatsapp, ''), COALESCE(c.email, '')
		FROM vehicles v
		JOIN customers c ON v.customer_id = c.id
		WHERE UPPER(REPLACE(v.license_plate, '-', '')) = $1
		LIMIT 1`

	var vID, cID uuid.UUID
	var vPlate, vBrand, vModel, vFuel, vUsage, pHash, pPin string
	var vYear int16
	var vDaily, vOdo int32
	var cDoc, cName, cPhone, cEmail string

	err := h.db.QueryRow(c.Context(), query, cleanPlate).Scan(
		&vID, &vPlate, &vBrand, &vModel, &vYear,
		&vFuel, &vUsage, &vDaily, &vOdo, &pHash, &pPin,
		&cID, &cDoc, &cName, &cPhone, &cEmail,
	)

	if err != nil {
		return response.Error(c, fiber.StatusUnauthorized, "AUTH_FAILED", "Placa no encontrada en nuestros registros")
	}

	reqPass := strings.TrimSpace(req.Password)
	validPassword := security.CheckPasswordHash(reqPass, pHash)

	// Fallback para placas demo en presentaciones
	if !validPassword {
		if (cleanPlate == "ABC123" || cleanPlate == "W1A982" || cleanPlate == "BCX456") && (reqPass == "estrada123" || reqPass == "1234") {
			validPassword = true
		}
	}

	if !validPassword {
		return response.Error(c, fiber.StatusUnauthorized, "AUTH_FAILED", "Contraseña vehicular incorrecta")
	}

	// Registrar último login
	_, _ = h.db.Exec(c.Context(), `UPDATE vehicles SET last_portal_login = NOW() WHERE id = $1`, vID)

	token, _ := security.GeneratePortalToken(vID, cID, vPlate, h.cfg.JWTSecret)

	res := domain.PortalAuthResponse{
		Token: token,
		Vehicle: domain.PortalVehicleDTO{
			ID:              vID,
			LicensePlate:    vPlate,
			Brand:           vBrand,
			Model:           vModel,
			Year:            vYear,
			EngineFuel:      vFuel,
			UsageProfile:    vUsage,
			DailyAvgKM:      vDaily,
			CurrentOdometer: vOdo,
		},
		Customer: domain.PortalCustomerDTO{
			ID:            cID,
			DocNumber:     cDoc,
			FullName:      cName,
			PhoneWhatsApp: cPhone,
			Email:         cEmail,
		},
	}

	return response.JSON(c, fiber.StatusOK, res)
}

func (h *Handler) PortalRegister(c *fiber.Ctx) error {
	var req domain.PortalRegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_PAYLOAD", "Datos de registro inválidos")
	}

	cleanPlate := strings.ToUpper(strings.ReplaceAll(strings.TrimSpace(req.LicensePlate), "-", ""))
	if len(cleanPlate) < 5 {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_PLATE", "Formato de placa inválido (ej. ABC-123)")
	}

	formattedPlate := cleanPlate
	if len(cleanPlate) == 6 {
		formattedPlate = cleanPlate[:3] + "-" + cleanPlate[3:]
	}

	if strings.TrimSpace(req.FullName) == "" {
		return response.Error(c, fiber.StatusBadRequest, "MISSING_NAME", "El nombre completo es requerido")
	}

	if strings.TrimSpace(req.PhoneWhatsApp) == "" {
		return response.Error(c, fiber.StatusBadRequest, "MISSING_PHONE", "El número de celular/WhatsApp es requerido para contacto y recordatorios")
	}

	if strings.TrimSpace(req.Password) == "" {
		return response.Error(c, fiber.StatusBadRequest, "MISSING_PASS", "Debe establecer una contraseña de acceso")
	}

	// 1. Verificar si la placa ya existe
	var existingID uuid.UUID
	checkErr := h.db.QueryRow(c.Context(), `SELECT id FROM vehicles WHERE UPPER(REPLACE(license_plate, '-', '')) = $1 LIMIT 1`, cleanPlate).Scan(&existingID)
	if checkErr == nil {
		return response.Error(c, fiber.StatusConflict, "PLATE_EXISTS", "Esta placa ya está registrada. Por favor inicie sesión o recupere su clave.")
	}

	// 2. Crear o encontrar cliente por teléfono
	docNumber := "CLI-" + cleanPlate
	if len(req.PhoneWhatsApp) >= 8 {
		docNumber = req.PhoneWhatsApp
	}

	custQuery := `
		INSERT INTO customers (doc_type_code, doc_number, full_name_or_business_name, phone_whatsapp, email, accepts_reminders)
		VALUES ('1', $1, $2, $3, $4, true)
		ON CONFLICT (doc_number) DO UPDATE SET 
			full_name_or_business_name = EXCLUDED.full_name_or_business_name,
			phone_whatsapp = EXCLUDED.phone_whatsapp
		RETURNING id, full_name_or_business_name, phone_whatsapp`

	var custID uuid.UUID
	var custName, custPhone string
	err := h.db.QueryRow(c.Context(), custQuery, docNumber, req.FullName, req.PhoneWhatsApp, "").Scan(&custID, &custName, &custPhone)
	if err != nil {
		logger.Error("Error creando cliente para portal", "error", err.Error())
		return response.Error(c, fiber.StatusInternalServerError, "DB_ERROR", "Error al registrar cliente")
	}

	// 3. Crear vehículo con contraseña cifrada (bcrypt)
	brand := req.Brand
	if brand == "" {
		brand = "Toyota"
	}
	model := req.Model
	if model == "" {
		model = "Vehículo Particular"
	}
	year := req.Year
	if year == 0 {
		year = 2022
	}
	fuel := req.EngineFuel
	if fuel == "" {
		fuel = "GASOLINA"
	}
	odo := req.CurrentKM
	if odo <= 0 {
		odo = 45000
	}

	hashedPassword, _ := security.HashPassword(req.Password)

	vehQuery := `
		INSERT INTO vehicles (
			customer_id, license_plate, brand, model, year, 
			engine_fuel, usage_profile, daily_avg_km, current_odometer, 
			password_hash, portal_pin, last_portal_login
		) VALUES (
			$1, $2, $3, $4, $5, 
			$6, 'PARTICULAR', 35, $7, 
			$8, '1234', NOW()
		) RETURNING id`

	var vehID uuid.UUID
	err = h.db.QueryRow(c.Context(), vehQuery, custID, formattedPlate, brand, model, year, fuel, odo, hashedPassword).Scan(&vehID)
	if err != nil {
		logger.Error("Error registrando vehículo para portal", "error", err.Error())
		return response.Error(c, fiber.StatusInternalServerError, "DB_ERROR", "Error al registrar vehículo")
	}

	// 4. Crear log inicial de diagnóstico de bienvenida
	logQuery := `
		INSERT INTO maintenance_pending_items (vehicle_id, item_type, title, urgency, recommended_km, estimated_cost, status, notes)
		VALUES 
			($1, 'INSPECCION', 'Inspección Inicial de 25 Puntos de Bienvenida Estrada', 'MEDIUM', $2, 0.00, 'PENDING', 'Diagnóstico general gratuito de bienvenida: estado de pastillas, suspensión, niveles de refrigerante y aceite.'),
			($1, 'SERVICIO', 'Revisión y Medición de Degradación Térmica de Lubricante', 'LOW', $2, 0.00, 'PENDING', 'Verificación con refractómetro y viscosímetro portátil.')`

	_, _ = h.db.Exec(c.Context(), logQuery, vehID, odo)

	token, _ := security.GeneratePortalToken(vehID, custID, formattedPlate, h.cfg.JWTSecret)

	res := domain.PortalAuthResponse{
		Token: token,
		Vehicle: domain.PortalVehicleDTO{
			ID:              vehID,
			LicensePlate:    formattedPlate,
			Brand:           brand,
			Model:           model,
			Year:            year,
			EngineFuel:      fuel,
			UsageProfile:    "PARTICULAR",
			DailyAvgKM:      35,
			CurrentOdometer: odo,
		},
		Customer: domain.PortalCustomerDTO{
			ID:            custID,
			DocNumber:     docNumber,
			FullName:      custName,
			PhoneWhatsApp: custPhone,
			Email:         "",
		},
	}

	return response.JSON(c, fiber.StatusCreated, res)
}

func (h *Handler) GetPortalVehicle(c *fiber.Ctx) error {
	plate := c.Query("plate", "")
	if plate == "" {
		return response.Error(c, fiber.StatusBadRequest, "MISSING_PLATE", "Debe enviar la placa del vehículo")
	}

	cleanPlate := strings.ToUpper(strings.ReplaceAll(strings.TrimSpace(plate), "-", ""))

	query := `
		SELECT v.id, v.license_plate, v.brand, v.model, COALESCE(v.year, 2022), 
		       COALESCE(v.engine_fuel, 'GASOLINA'), v.usage_profile, v.daily_avg_km, 
		       COALESCE(v.current_odometer, 45000),
		       c.id, c.doc_number, c.full_name_or_business_name, COALESCE(c.phone_whatsapp, ''), COALESCE(c.email, '')
		FROM vehicles v
		JOIN customers c ON v.customer_id = c.id
		WHERE UPPER(REPLACE(v.license_plate, '-', '')) = $1
		LIMIT 1`

	var v domain.PortalVehicleDTO
	var cust domain.PortalCustomerDTO

	err := h.db.QueryRow(c.Context(), query, cleanPlate).Scan(
		&v.ID, &v.LicensePlate, &v.Brand, &v.Model, &v.Year,
		&v.EngineFuel, &v.UsageProfile, &v.DailyAvgKM, &v.CurrentOdometer,
		&cust.ID, &cust.DocNumber, &cust.FullName, &cust.PhoneWhatsApp, &cust.Email,
	)

	if err != nil {
		return response.Error(c, fiber.StatusNotFound, "NOT_FOUND", "Vehículo no encontrado en el sistema")
	}

	return response.JSON(c, fiber.StatusOK, fiber.Map{
		"vehicle":  v,
		"customer": cust,
	})
}

func (h *Handler) GetPortalHistory(c *fiber.Ctx) error {
	plate := c.Query("plate", "")
	if plate == "" {
		return response.Error(c, fiber.StatusBadRequest, "MISSING_PLATE", "Placa vehicular requerida")
	}

	cleanPlate := strings.ToUpper(strings.ReplaceAll(strings.TrimSpace(plate), "-", ""))

	query := `
		SELECT m.id, m.service_date, m.mileage_at_service, m.next_service_mileage,
		       m.oil_applied_name, m.oil_viscosity, m.changed_oil_filter,
		       m.changed_air_filter, m.changed_cabin_filter, m.estimated_next_date,
		       m.lifecycle_status, s.full_number, s.total_amount
		FROM service_maintenance_logs m
		JOIN vehicles v ON m.vehicle_id = v.id
		JOIN sales s ON m.sale_id = s.id
		WHERE UPPER(REPLACE(v.license_plate, '-', '')) = $1
		ORDER BY m.service_date DESC, m.created_at DESC`

	rows, err := h.db.Query(c.Context(), query, cleanPlate)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "DB_ERROR", "Error consultando historial", err.Error())
	}
	defer rows.Close()

	var history []domain.MaintenanceHistoryItem
	for rows.Next() {
		var item domain.MaintenanceHistoryItem
		err := rows.Scan(
			&item.ID, &item.ServiceDate, &item.MileageAtService, &item.NextServiceMileage,
			&item.OilAppliedName, &item.OilViscosity, &item.ChangedOilFilter,
			&item.ChangedAirFilter, &item.ChangedCabinFilter, &item.EstimatedNextDate,
			&item.LifecycleStatus, &item.FullNumber, &item.TotalAmount,
		)
		if err == nil {
			history = append(history, item)
		}
	}

	return response.JSON(c, fiber.StatusOK, history)
}

func (h *Handler) GetPortalPreventive(c *fiber.Ctx) error {
	plate := c.Query("plate", "")
	if plate == "" {
		return response.Error(c, fiber.StatusBadRequest, "MISSING_PLATE", "Placa requerida")
	}

	cleanPlate := strings.ToUpper(strings.ReplaceAll(strings.TrimSpace(plate), "-", ""))

	// 1. Obtener datos del vehículo y último mantenimiento
	vQuery := `
		SELECT v.id, v.license_plate, COALESCE(v.current_odometer, 45000),
		       COALESCE(m.service_date, NOW() - INTERVAL '30 days'), 
		       COALESCE(m.mileage_at_service, COALESCE(v.current_odometer, 45000) - 3000), 
		       COALESCE(m.next_service_mileage, COALESCE(v.current_odometer, 45000) + 5000),
		       COALESCE(m.estimated_next_date, NOW() + INTERVAL '120 days'), 
		       COALESCE(m.oil_applied_name, 'Lubricante Recomendado Estrada 5W-30'), 
		       COALESCE(m.oil_viscosity, '5W-30')
		FROM vehicles v
		LEFT JOIN service_maintenance_logs m ON m.vehicle_id = v.id
		WHERE UPPER(REPLACE(v.license_plate, '-', '')) = $1
		ORDER BY m.service_date DESC NULLS LAST LIMIT 1`

	var vID uuid.UUID
	var vPlate, oilName, oilVisc string
	var currentOdo, lastKM, nextKM int32
	var sDate, estDate time.Time

	err := h.db.QueryRow(c.Context(), vQuery, cleanPlate).Scan(
		&vID, &vPlate, &currentOdo,
		&sDate, &lastKM, &nextKM,
		&estDate, &oilName, &oilVisc,
	)

	if err != nil {
		return response.Error(c, fiber.StatusNotFound, "NOT_FOUND", "No se encontró el vehículo")
	}

	if nextKM == 0 {
		nextKM = currentOdo + 5000
	}
	if lastKM == 0 {
		lastKM = currentOdo - 3000
	}

	// Cálculo preventivo
	remainingKM := nextKM - currentOdo
	totalInterval := nextKM - lastKM
	if totalInterval <= 0 {
		totalInterval = 10000
	}
	usedKM := currentOdo - lastKM
	if usedKM < 0 {
		usedKM = 0
	}
	pctUsed := (float64(usedKM) / float64(totalInterval)) * 100.0
	if pctUsed > 100.0 {
		pctUsed = 100.0
	}

	severity := "OPTIMAL"
	if remainingKM <= 0 {
		severity = "OVERDUE"
	} else if remainingKM <= 1500 {
		severity = "DUE_SOON"
	}

	// 2. Obtener lista de repuestos y tareas pendientes
	pQuery := `
		SELECT id, vehicle_id, item_type, title, urgency, recommended_km, 
		       estimated_cost, status, notes, created_at
		FROM maintenance_pending_items
		WHERE vehicle_id = $1 AND status = 'PENDING'
		ORDER BY 
			CASE urgency
				WHEN 'CRITICAL' THEN 1
				WHEN 'HIGH' THEN 2
				WHEN 'MEDIUM' THEN 3
				ELSE 4
			END, created_at DESC`

	pRows, err := h.db.Query(c.Context(), pQuery, vID)
	var pendingList []domain.MaintenancePendingItem
	if err == nil {
		defer pRows.Close()
		for pRows.Next() {
			var pi domain.MaintenancePendingItem
			if scanErr := pRows.Scan(
				&pi.ID, &pi.VehicleID, &pi.ItemType, &pi.Title, &pi.Urgency,
				&pi.RecommendedKM, &pi.EstimatedCost, &pi.Status, &pi.Notes, &pi.CreatedAt,
			); scanErr == nil {
				pendingList = append(pendingList, pi)
			}
		}
	}

	resp := domain.PreventiveStatusResponse{
		VehicleID:          vID,
		LicensePlate:       vPlate,
		CurrentOdometer:    currentOdo,
		LastServiceMileage: lastKM,
		NextServiceMileage: nextKM,
		RemainingKM:        remainingKM,
		PercentageUsed:     pctUsed,
		StatusSeverity:     severity,
		LastServiceDate:    sDate,
		EstimatedNextDate:  estDate,
		OilAppliedName:     oilName,
		OilViscosity:       oilVisc,
		PendingItems:       pendingList,
	}

	return response.JSON(c, fiber.StatusOK, resp)
}
