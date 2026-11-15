-- name: GetAndLockSeries :one
SELECT id, doc_type_code, series, current_correlative, is_active
FROM document_series
WHERE series = $1 AND is_active = true
FOR UPDATE;

-- name: IncrementSeriesCorrelative :exec
UPDATE document_series
SET current_correlative = current_correlative + 1
WHERE series = $1;

-- name: CreateSale :one
INSERT INTO sales (
    customer_id, vehicle_id, doc_type_code, series, correlative, full_number,
    issue_date, currency_code, total_gravadas, total_exoneradas, total_inafectas,
    total_igv, total_discount, total_amount, amount_in_words, payment_method,
    payment_condition, created_by
) VALUES (
    $1, $2, $3, $4, $5, $6,
    $7, $8, $9, $10, $11,
    $12, $13, $14, $15, $16,
    $17, $18
)
RETURNING *;

-- name: CreateSaleItem :one
INSERT INTO sale_items (
    sale_id, product_id, description, unit_code, quantity,
    unit_value, unit_price, tax_affectation_code, igv_amount, subtotal, total
) VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9, $10, $11
)
RETURNING *;

-- name: CreateSunatTransmission :one
INSERT INTO sunat_transmissions (
    sale_id, hash_cpe, qr_string, sunat_status, retry_count
) VALUES (
    $1, $2, $3, 'PENDING', 0
)
RETURNING *;

-- name: LockProductForUpdate :one
SELECT id, sku, name, stock_current, sale_price, purchase_price, technical_specs
FROM products
WHERE id = $1 AND is_active = true
FOR UPDATE;

-- name: DeductProductStock :exec
UPDATE products
SET stock_current = stock_current - $2,
    updated_at = NOW()
WHERE id = $1;

-- name: InsertInventoryMovement :exec
INSERT INTO inventory_movements (
    product_id, movement_type, quantity, stock_before, stock_after,
    unit_cost, reference_doc, created_by
) VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8
);
