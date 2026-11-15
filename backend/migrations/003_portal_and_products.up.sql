-- 003_portal_and_products.up.sql: Ampliación para Portal de Clientes y Gestión de Mantenimiento

-- 1. CREDENCIALES DE ACCESO AL PORTAL DE AUTOSERVICIO POR PLACA
ALTER TABLE vehicles 
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) DEFAULT '$2a$10$rC8GkI22s.3hN2uF2l1ZReX8/k3oQfEa93y07x.z9qH7mU/X5xV1y',
    ADD COLUMN IF NOT EXISTS portal_pin VARCHAR(10) DEFAULT '1234',
    ADD COLUMN IF NOT EXISTS current_odometer INTEGER DEFAULT 45000,
    ADD COLUMN IF NOT EXISTS last_portal_login TIMESTAMPTZ;

-- 2. TABLA DE MANTENIMIENTOS Y REPUESTOS PENDIENTES
CREATE TABLE IF NOT EXISTS maintenance_pending_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_log_id UUID REFERENCES service_maintenance_logs(id) ON DELETE SET NULL,
    item_type VARCHAR(50) NOT NULL DEFAULT 'REPUESTO', -- 'REPUESTO', 'SERVICIO', 'INSPECCION'
    title VARCHAR(150) NOT NULL,
    urgency VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    recommended_km INTEGER,
    estimated_cost NUMERIC(10,2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SCHEDULED', 'RESOLVED'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_vehicle_status ON maintenance_pending_items(vehicle_id, status);

-- 3. SEEDING ROBUSTO PARA EL PORTAL DE CLIENTES Y GESTIÓN DE PRODUCTOS
DO $$
DECLARE
    cust1_id UUID;
    cust2_id UUID;
    cust3_id UUID;

    veh1_id UUID;
    veh2_id UUID;
    veh3_id UUID;

    prod_mob5w30_id UUID;
    prod_cas_edge_id UUID;
    prod_mot_8100_id UUID;
    prod_mot_6100_id UUID;
    prod_gtx_20w50_id UUID;
    prod_flt_mann_id UUID;
    prod_flt_bosch_id UUID;

    sale1_id UUID;
    sale2_id UUID;
    sale3_id UUID;

    log1_id UUID;
    log2_id UUID;
    log3_id UUID;
BEGIN
    -- Clientes
    INSERT INTO customers (id, doc_type_code, doc_number, full_name_or_business_name, fiscal_address, phone_whatsapp, email)
    VALUES 
        (gen_random_uuid(), '1', '10458923', 'Carlos Mendoza Alarcón', 'Av. Ferrocarril 1240, El Tambo, Huancayo', '+51964123456', 'carlos.mendoza@gmail.com')
    ON CONFLICT (doc_number) DO UPDATE SET full_name_or_business_name = EXCLUDED.full_name_or_business_name
    RETURNING id INTO cust1_id;

    INSERT INTO customers (id, doc_type_code, doc_number, full_name_or_business_name, fiscal_address, phone_whatsapp, email)
    VALUES 
        (gen_random_uuid(), '1', '42891234', 'Vanessa Torres Quispe', 'Jr. Puno 530, Huancayo', '+51987654321', 'vtorres@outlook.com')
    ON CONFLICT (doc_number) DO UPDATE SET full_name_or_business_name = EXCLUDED.full_name_or_business_name
    RETURNING id INTO cust2_id;

    INSERT INTO customers (id, doc_type_code, doc_number, full_name_or_business_name, fiscal_address, phone_whatsapp, email)
    VALUES 
        (gen_random_uuid(), '6', '20601234567', 'Transportes del Centro SAC', 'Av. Mariscal Castilla 2200, Huancayo', '+51954987123', 'gerencia@transcentro.pe')
    ON CONFLICT (doc_number) DO UPDATE SET full_name_or_business_name = EXCLUDED.full_name_or_business_name
    RETURNING id INTO cust3_id;

    -- Vehículos con credenciales de acceso al Portal (Contraseña: 'estrada123', PIN: '1234')
    INSERT INTO vehicles (id, customer_id, license_plate, brand, model, year, engine_fuel, usage_profile, daily_avg_km, current_odometer, password_hash, portal_pin)
    VALUES 
        (gen_random_uuid(), cust1_id, 'ABC-123', 'Toyota', 'RAV4 2.5L AWD', 2022, 'GASOLINA', 'PARTICULAR', 35, 48800, 'estrada123', '1234')
    ON CONFLICT (license_plate) DO UPDATE SET 
        brand = EXCLUDED.brand, 
        model = EXCLUDED.model, 
        current_odometer = EXCLUDED.current_odometer,
        password_hash = 'estrada123',
        portal_pin = '1234'
    RETURNING id INTO veh1_id;

    INSERT INTO vehicles (id, customer_id, license_plate, brand, model, year, engine_fuel, usage_profile, daily_avg_km, current_odometer, password_hash, portal_pin)
    VALUES 
        (gen_random_uuid(), cust2_id, 'W1A-982', 'Hyundai', 'Tucson 2.0L SmartStream', 2021, 'GLP', 'TAXI_COLECTIVO', 140, 89400, 'estrada123', '1234')
    ON CONFLICT (license_plate) DO UPDATE SET 
        brand = EXCLUDED.brand, 
        model = EXCLUDED.model, 
        current_odometer = EXCLUDED.current_odometer,
        password_hash = 'estrada123',
        portal_pin = '1234'
    RETURNING id INTO veh2_id;

    INSERT INTO vehicles (id, customer_id, license_plate, brand, model, year, engine_fuel, usage_profile, daily_avg_km, current_odometer, password_hash, portal_pin)
    VALUES 
        (gen_random_uuid(), cust3_id, 'BCX-456', 'Nissan', 'Frontier 2.5L Turbo Diésel 4x4', 2020, 'DIESEL', 'FLOTA_COMERCIAL', 160, 134200, 'estrada123', '1234')
    ON CONFLICT (license_plate) DO UPDATE SET 
        brand = EXCLUDED.brand, 
        model = EXCLUDED.model, 
        current_odometer = EXCLUDED.current_odometer,
        password_hash = 'estrada123',
        portal_pin = '1234'
    RETURNING id INTO veh3_id;

    -- Obtener IDs de productos clave
    SELECT id INTO prod_mob5w30_id FROM products WHERE sku = 'MOB-5W30-GLN' LIMIT 1;
    SELECT id INTO prod_cas_edge_id FROM products WHERE sku = 'CAS-EDGE-5W30-QT' LIMIT 1;
    SELECT id INTO prod_mot_8100_id FROM products WHERE sku = 'MOT-8100-5W40-5L' LIMIT 1;
    SELECT id INTO prod_mot_6100_id FROM products WHERE sku = 'MOT-6100-10W40-4L' LIMIT 1;
    SELECT id INTO prod_gtx_20w50_id FROM products WHERE sku = 'CAS-GTX-20W50-GLN' LIMIT 1;
    SELECT id INTO prod_flt_mann_id FROM products WHERE sku = 'FLT-MANN-W683' LIMIT 1;
    SELECT id INTO prod_flt_bosch_id FROM products WHERE sku = 'FLT-BOSCH-P3300' LIMIT 1;

    -- Insertar más productos para robustecer el módulo de gestión de productos
    INSERT INTO products (sku, barcode, name, description, category_id, brand_id, presentation, technical_specs, purchase_price, sale_price, stock_current, stock_min)
    SELECT 'SHL-ULTRA-0W20', '7701234567891', 'Shell Helix Ultra 0W-20 PurePlus', 'Tecnología PurePlus de gas natural para máxima economía y arranques gélidos.',
           c.id, b.id, 'Bidón 4 Litros', '{"viscosity": "0W-20", "oil_type": "100% Sintético", "api_norm": "API SP / ILSAC GF-6A", "lifespan_km": 10000}'::jsonb,
           150.0000, 195.0000, 18.000, 4.000
    FROM categories c, brands b WHERE c.slug = 'aceites-sinteticos' AND b.name = 'Shell Helix'
    ON CONFLICT (sku) DO NOTHING;

    INSERT INTO products (sku, barcode, name, description, category_id, brand_id, presentation, technical_specs, purchase_price, sale_price, stock_current, stock_min)
    SELECT 'LIQ-CERATEC-300', '4100420037214', 'Liqui Moly Cera Tec Antifricción', 'Modificador cerámico de microestructura sólida para hasta 50,000 km.',
           c.id, b.id, 'Lata 300ml', '{"additive_type": "Cerámico Antifricción", "capacity": "300ml para 5L de aceite"}'::jsonb,
           58.0000, 85.0000, 24.000, 6.000
    FROM categories c, brands b WHERE c.slug = 'refrigerantes-aditivos' AND b.name = 'Liqui Moly'
    ON CONFLICT (sku) DO NOTHING;

    INSERT INTO products (sku, barcode, name, description, category_id, brand_id, presentation, technical_specs, purchase_price, sale_price, stock_current, stock_min)
    SELECT 'BOSCH-DOT4-1L', '4047024719999', 'Líquido de Frenos Bosch DOT 4 HP', 'Alto punto de ebullición húmedo 265°C para ABS y ESP modernos.',
           c.id, b.id, 'Botella 1 Litro', '{"dot_spec": "DOT 4 High Performance", "boiling_point": "265°C"}'::jsonb,
           28.0000, 42.0000, 30.000, 8.000
    FROM categories c, brands b WHERE c.slug = 'refrigerantes-aditivos' AND b.name = 'Bosch'
    ON CONFLICT (sku) DO NOTHING;

    -- Historial Clínico para Vehículo 1 (ABC-123 - Toyota RAV4)
    SELECT id INTO sale1_id FROM sales WHERE full_number = 'B001-00000101' LIMIT 1;
    IF sale1_id IS NULL THEN
        INSERT INTO sales (id, customer_id, vehicle_id, doc_type_code, series, correlative, full_number, issue_date, total_gravadas, total_igv, total_amount, amount_in_words, payment_method)
        VALUES (gen_random_uuid(), cust1_id, veh1_id, '03', 'B001', 101, 'B001-00000101', CURRENT_DATE - INTERVAL '120 days', 183.90, 33.10, 217.00, 'DOSCIENTOS DIECISIETE Y 00/100 SOLES', 'YAPE_PLIN')
        RETURNING id INTO sale1_id;
    END IF;

    SELECT id INTO log1_id FROM service_maintenance_logs WHERE vehicle_id = veh1_id LIMIT 1;
    IF log1_id IS NULL THEN
        INSERT INTO service_maintenance_logs (id, sale_id, vehicle_id, customer_id, service_date, mileage_at_service, next_service_mileage, oil_applied_name, oil_viscosity, changed_oil_filter, changed_air_filter, changed_cabin_filter, estimated_next_date, lifecycle_status)
        VALUES (gen_random_uuid(), sale1_id, veh1_id, cust1_id, CURRENT_DATE - INTERVAL '120 days', 40000, 50000, 'Mobil 1 Advanced Full Synthetic 5W-30', '5W-30', true, true, false, CURRENT_DATE + INTERVAL '45 days', 'ACTIVE')
        RETURNING id INTO log1_id;
    END IF;

    -- Historial Clínico para Vehículo 2 (W1A-982 - Hyundai Tucson GLP Colectivo)
    SELECT id INTO sale2_id FROM sales WHERE full_number = 'B001-00000102' LIMIT 1;
    IF sale2_id IS NULL THEN
        INSERT INTO sales (id, customer_id, vehicle_id, doc_type_code, series, correlative, full_number, issue_date, total_gravadas, total_igv, total_amount, amount_in_words, payment_method)
        VALUES (gen_random_uuid(), cust2_id, veh2_id, '03', 'B001', 102, 'B001-00000102', CURRENT_DATE - INTERVAL '40 days', 158.47, 28.53, 187.00, 'CIENTO OCHENTA Y SIETE Y 00/100 SOLES', 'EFECTIVO')
        RETURNING id INTO sale2_id;
    END IF;

    SELECT id INTO log2_id FROM service_maintenance_logs WHERE vehicle_id = veh2_id LIMIT 1;
    IF log2_id IS NULL THEN
        INSERT INTO service_maintenance_logs (id, sale_id, vehicle_id, customer_id, service_date, mileage_at_service, next_service_mileage, oil_applied_name, oil_viscosity, changed_oil_filter, changed_air_filter, changed_cabin_filter, estimated_next_date, lifecycle_status)
        VALUES (gen_random_uuid(), sale2_id, veh2_id, cust2_id, CURRENT_DATE - INTERVAL '40 days', 81000, 88500, 'Motul 6100 Synergie+ 10W-40', '10W-40', true, false, false, CURRENT_DATE - INTERVAL '2 days', 'OVERDUE')
        RETURNING id INTO log2_id;
    END IF;

    -- Historial Clínico para Vehículo 3 (BCX-456 - Nissan Frontier Diésel Flota)
    SELECT id INTO sale3_id FROM sales WHERE full_number = 'F001-00000103' LIMIT 1;
    IF sale3_id IS NULL THEN
        INSERT INTO sales (id, customer_id, vehicle_id, doc_type_code, series, correlative, full_number, issue_date, total_gravadas, total_igv, total_amount, amount_in_words, payment_method)
        VALUES (gen_random_uuid(), cust3_id, veh3_id, '01', 'F001', 103, 'F001-00000103', CURRENT_DATE - INTERVAL '75 days', 228.81, 41.19, 270.00, 'DOSCIENTOS SETENTA Y 00/100 SOLES', 'TRANSFERENCIA')
        RETURNING id INTO sale3_id;
    END IF;

    SELECT id INTO log3_id FROM service_maintenance_logs WHERE vehicle_id = veh3_id LIMIT 1;
    IF log3_id IS NULL THEN
        INSERT INTO service_maintenance_logs (id, sale_id, vehicle_id, customer_id, service_date, mileage_at_service, next_service_mileage, oil_applied_name, oil_viscosity, changed_oil_filter, changed_air_filter, changed_cabin_filter, estimated_next_date, lifecycle_status)
        VALUES (gen_random_uuid(), sale3_id, veh3_id, cust3_id, CURRENT_DATE - INTERVAL '75 days', 125000, 135000, 'Castrol GTX 20W-50 Alto Kilometraje', '20W-50', true, true, true, CURRENT_DATE - INTERVAL '15 days', 'DUE_REMINDED')
        RETURNING id INTO log3_id;
    END IF;

    -- MANTENIMIENTOS PENDIENTES Y REPUESTOS PROGRAMADOS
    DELETE FROM maintenance_pending_items WHERE vehicle_id = veh1_id;
    INSERT INTO maintenance_pending_items (vehicle_id, maintenance_log_id, item_type, title, urgency, recommended_km, estimated_cost, status, notes)
    VALUES 
        (veh1_id, log1_id, 'REPUESTO', 'Pastillas de freno delanteras de cerámica (Desgaste 75%)', 'HIGH', 50000, 160.00, 'PENDING', 'Inspeccionadas durante el último servicio. Quedan aproximadamente 2,000 km de vida útil.'),
        (veh1_id, log1_id, 'REPUESTO', 'Filtro de Polen y Cabina con Carbón Activado', 'MEDIUM', 50000, 45.00, 'PENDING', 'Presenta acumulación de polvo y hollín. Recomendado para mantener aire limpio en cabina.'),
        (veh1_id, log1_id, 'SERVICIO', 'Alineamiento y Balanceo Computarizado 3D', 'LOW', 50000, 60.00, 'PENDING', 'Recomendado por rotación de neumáticos a los 50,000 km.');

    DELETE FROM maintenance_pending_items WHERE vehicle_id = veh2_id;
    INSERT INTO maintenance_pending_items (vehicle_id, maintenance_log_id, item_type, title, urgency, recommended_km, estimated_cost, status, notes)
    VALUES 
        (veh2_id, log2_id, 'SERVICIO', 'Reemplazo Urgente de Líquido Refrigerante Long Life 50/50', 'CRITICAL', 88500, 85.00, 'PENDING', 'Motor GLP trabaja a mayor temperatura térmica. El coolant presenta degradación de aditivos.'),
        (veh2_id, log2_id, 'REPUESTO', 'Juego de Bujías de Iridio para Gas GLP/GNV', 'HIGH', 90000, 180.00, 'PENDING', 'Bujías actuales con 35,000 km de uso. Se detectó leve retardo en ignición.');

    DELETE FROM maintenance_pending_items WHERE vehicle_id = veh3_id;
    INSERT INTO maintenance_pending_items (vehicle_id, maintenance_log_id, item_type, title, urgency, recommended_km, estimated_cost, status, notes)
    VALUES 
        (veh3_id, log3_id, 'REPUESTO', 'Filtro Trampa de Agua Diésel Common Rail', 'CRITICAL', 135000, 95.00, 'PENDING', 'Imprescindible para proteger inyectores de alta presión de 2000 bar contra agua y sedimentos.'),
        (veh3_id, log3_id, 'SERVICIO', 'Engrase General de Crucetas de Cardán y Terminales', 'MEDIUM', 135000, 40.00, 'PENDING', 'Vehículo de carga y terreno difícil en sierra central.');

END $$;
