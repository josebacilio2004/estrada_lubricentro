package worker

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"lubricentro-estrada-core/internal/config"
	"lubricentro-estrada-core/internal/service"

	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"
)

type WorkerHub struct {
	db          *pgxpool.Pool
	cfg         *config.Config
	sunatSvc    *service.SunatService
	httpClient  *http.Client
}

func NewWorkerHub(db *pgxpool.Pool, cfg *config.Config, sunatSvc *service.SunatService) *WorkerHub {
	return &WorkerHub{
		db:         db,
		cfg:        cfg,
		sunatSvc:   sunatSvc,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

// HandleSunatTransmitTask procesa la transmisión de comprobantes a SUNAT en segundo plano
func (w *WorkerHub) HandleSunatTransmitTask(ctx context.Context, t *asynq.Task) error {
	var payload struct {
		SaleID     uuid.UUID `json:"sale_id"`
		FullNumber string    `json:"full_number"`
	}
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return err
	}

	log.Printf("[ASYNQ] Transmitiendo a SUNAT comprobante %s (%s)...", payload.FullNumber, payload.SaleID)
	return w.sunatSvc.ProcessSunatTransmission(ctx, payload.SaleID, payload.FullNumber)
}

// HandleWhatsAppTicketTask notifica al cliente con su comprobante digital
func (w *WorkerHub) HandleWhatsAppTicketTask(ctx context.Context, t *asynq.Task) error {
	var payload struct {
		SaleID     uuid.UUID `json:"sale_id"`
		FullNumber string    `json:"full_number"`
	}
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return err
	}

	log.Printf("[ASYNQ] Enviando ticket digital por WhatsApp para comprobante %s...", payload.FullNumber)
	// Aquí se invoca el webhook n8n o Evolution API
	return nil
}

// ScanAndDispatchMaintenanceReminders es ejecutado por el cron a las 09:00 AM America/Lima
func (w *WorkerHub) ScanAndDispatchMaintenanceReminders(ctx context.Context) {
	log.Println("[CRON-LIMA] Iniciando barrido predictivo de cambios de aceite...")

	query := `
		SELECT 
			m.id, m.customer_id, m.estimated_next_date, m.oil_applied_name, m.oil_viscosity,
			v.license_plate, v.brand, v.model,
			c.full_name_or_business_name, c.phone_whatsapp, m.lifecycle_status
		FROM service_maintenance_logs m
		JOIN vehicles v ON m.vehicle_id = v.id
		JOIN customers c ON m.customer_id = c.id
		WHERE c.accepts_reminders = true
		  AND c.phone_whatsapp IS NOT NULL AND c.phone_whatsapp != ''
		  AND m.lifecycle_status IN ('ACTIVE', 'PRE_REMINDED', 'DUE_REMINDED')
		  AND (
		      m.estimated_next_date = CURRENT_DATE + INTERVAL '7 days'
		      OR m.estimated_next_date = CURRENT_DATE
		      OR m.estimated_next_date = CURRENT_DATE - INTERVAL '15 days'
		  )`

	rows, err := w.db.Query(ctx, query)
	if err != nil {
		log.Printf("[CRON ERROR] Fallo al consultar recordatorios: %v", err)
		return
	}
	defer rows.Close()

	now := time.Now().Truncate(24 * time.Hour)
	count := 0

	for rows.Next() {
		var logID, custID uuid.UUID
		var estDate time.Time
		var oilName, oilVisc, plate, brand, model, clientName, phone, currentStatus string

		err := rows.Scan(&logID, &custID, &estDate, &oilName, &oilVisc, &plate, &brand, &model, &clientName, &phone, &currentStatus)
		if err != nil {
			log.Printf("[CRON ERROR] Error escaneando fila: %v", err)
			continue
		}

		// Determinar etapa
		var stage string
		var newStatus string
		var templateMsg string

		diffDays := int(estDate.Sub(now).Hours() / 24)

		if diffDays == 7 && currentStatus == "ACTIVE" {
			stage = "PRE_7_DAYS"
			newStatus = "PRE_REMINDED"
			templateMsg = fmt.Sprintf("Hola %s! Tu vehiculo %s %s (Placa %s) esta proximo a su cambio de aceite en 7 dias. Agenda en Lubricentros Estrada para mantener tu motor protegido.", clientName, brand, model, plate)
		} else if diffDays == 0 && (currentStatus == "ACTIVE" || currentStatus == "PRE_REMINDED") {
			stage = "DUE_DAY"
			newStatus = "DUE_REMINDED"
			templateMsg = fmt.Sprintf("Estimado %s, hoy se cumple el kilometraje estimado para el cambio de aceite (%s) de tu auto %s. Te esperamos en nuestro local!", clientName, oilVisc, plate)
		} else if diffDays <= -15 {
			stage = "WINBACK_15_DAYS"
			newStatus = "OVERDUE"
			templateMsg = fmt.Sprintf("Atencion %s: El cambio de aceite de tu vehiculo %s registra 15 dias de vencimiento. Evita desgaste prematuro del motor. Presenta este mensaje y recibe revision gratuita de niveles.", clientName, plate)
		} else {
			continue
		}

		// Enviar Webhook a n8n
		go w.dispatchWebhook(context.Background(), logID, custID, phone, stage, templateMsg, newStatus)
		count++
	}

	log.Printf("[CRON-LIMA] Barrido finalizado. Notificaciones despachadas: %d", count)
}

func (w *WorkerHub) dispatchWebhook(ctx context.Context, logID, custID uuid.UUID, phone, stage, message, newStatus string) {
	payloadData := map[string]any{
		"maintenance_log_id": logID,
		"customer_id":        custID,
		"phone":              phone,
		"stage":              stage,
		"message":            message,
		"timestamp":          time.Now().Unix(),
	}

	body, err := json.Marshal(payloadData)
	if err != nil {
		return
	}

	// Firmado HMAC-SHA256
	mac := hmac.New(sha256.New, []byte(w.cfg.WebhookHMACSecret))
	mac.Write(body)
	signature := hex.EncodeToString(mac.Sum(nil))

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, w.cfg.N8NWebhookURL, bytes.NewBuffer(body))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Estrada-Signature", signature)

	resp, err := w.httpClient.Do(req)
	deliveryStatus := "SENT"
	if err != nil || resp.StatusCode >= 400 {
		deliveryStatus = "FAILED_FALLBACK_SMS"
	} else {
		resp.Body.Close()
	}

	// Registrar en notification_logs
	_, _ = w.db.Exec(ctx, `
		INSERT INTO notification_logs (
			maintenance_log_id, customer_id, channel, stage, recipient_phone, message_sent, delivery_status
		) VALUES ($1, $2, 'WHATSAPP', $3, $4, $5, $6)`,
		logID, custID, stage, phone, message, deliveryStatus,
	)

	// Actualizar estado del mantenimiento
	_, _ = w.db.Exec(ctx, `UPDATE service_maintenance_logs SET lifecycle_status = $1 WHERE id = $2`, newStatus, logID)
}
