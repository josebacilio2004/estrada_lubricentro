-- name: UpsertCustomer :one
INSERT INTO customers (
    doc_type_code, doc_number, full_name_or_business_name, fiscal_address, ubigeo, phone_whatsapp, email
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
)
ON CONFLICT (doc_number) DO UPDATE SET
    full_name_or_business_name = EXCLUDED.full_name_or_business_name,
    fiscal_address = COALESCE(EXCLUDED.fiscal_address, customers.fiscal_address),
    phone_whatsapp = COALESCE(EXCLUDED.phone_whatsapp, customers.phone_whatsapp),
    email = COALESCE(EXCLUDED.email, customers.email),
    updated_at = NOW()
RETURNING *;

-- name: GetCustomerByDoc :one
SELECT * FROM customers WHERE doc_number = $1 LIMIT 1;

-- name: UpsertVehicle :one
INSERT INTO vehicles (
    customer_id, license_plate, brand, model, year, engine_fuel, usage_profile, daily_avg_km
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
)
ON CONFLICT (license_plate) DO UPDATE SET
    customer_id = EXCLUDED.customer_id,
    brand = EXCLUDED.brand,
    model = EXCLUDED.model,
    year = EXCLUDED.year,
    engine_fuel = EXCLUDED.engine_fuel,
    usage_profile = EXCLUDED.usage_profile,
    daily_avg_km = EXCLUDED.daily_avg_km
RETURNING *;

-- name: GetVehicleByPlate :one
SELECT v.*, c.full_name_or_business_name, c.phone_whatsapp, c.doc_number
FROM vehicles v
JOIN customers c ON v.customer_id = c.id
WHERE v.license_plate = $1 LIMIT 1;
