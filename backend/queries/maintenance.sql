-- name: RenewPreviousMaintenanceLogs :exec
UPDATE service_maintenance_logs
SET lifecycle_status = 'RENEWED'
WHERE vehicle_id = $1 AND lifecycle_status IN ('ACTIVE', 'PRE_REMINDED', 'DUE_REMINDED');

-- name: CreateMaintenanceLog :one
INSERT INTO service_maintenance_logs (
    sale_id, vehicle_id, customer_id, service_date, mileage_at_service,
    next_service_mileage, oil_product_id, oil_applied_name, oil_viscosity,
    changed_oil_filter, changed_air_filter, changed_cabin_filter, estimated_next_date,
    lifecycle_status
) VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9,
    $10, $11, $12, $13,
    'ACTIVE'
)
RETURNING *;

-- name: GetLastMaintenanceByPlate :one
SELECT m.*, v.license_plate, v.brand as vehicle_brand, v.model as vehicle_model,
       c.full_name_or_business_name, c.phone_whatsapp
FROM service_maintenance_logs m
JOIN vehicles v ON m.vehicle_id = v.id
JOIN customers c ON m.customer_id = c.id
WHERE v.license_plate = $1
ORDER BY m.service_date DESC, m.created_at DESC
LIMIT 1;

-- name: GetMaintenanceDueForReminders :many
SELECT m.*, v.license_plate, v.brand as vehicle_brand, v.model as vehicle_model,
       c.full_name_or_business_name, c.phone_whatsapp, c.accepts_reminders
FROM service_maintenance_logs m
JOIN vehicles v ON m.vehicle_id = v.id
JOIN customers c ON m.customer_id = c.id
WHERE c.accepts_reminders = true
  AND m.lifecycle_status IN ('ACTIVE', 'PRE_REMINDED', 'DUE_REMINDED')
  AND (
      m.estimated_next_date = CURRENT_DATE + INTERVAL '7 days' -- PRE_7_DAYS
      OR m.estimated_next_date = CURRENT_DATE                 -- DUE_DAY
      OR m.estimated_next_date = CURRENT_DATE - INTERVAL '15 days' -- WINBACK_15_DAYS
  );

-- name: UpdateMaintenanceLifecycleStatus :exec
UPDATE service_maintenance_logs
SET lifecycle_status = $2
WHERE id = $1;

-- name: InsertNotificationLog :exec
INSERT INTO notification_logs (
    maintenance_log_id, customer_id, channel, stage, recipient_phone, message_sent, delivery_status
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
);
