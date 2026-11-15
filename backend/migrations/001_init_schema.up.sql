-- Extensiones para UUIDs y búsqueda de texto ultrarrápida (Trigramas para buscar códigos de filtros/aceites)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. CATEGORÍAS Y MARCAS
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PRODUCTOS (LUBRICANTES, FILTROS, REFRIGERANTES, ADITIVOS)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(64) UNIQUE,
    sunat_unspsc_code VARCHAR(20),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES categories(id),
    brand_id UUID NOT NULL REFERENCES brands(id),
    unit_code VARCHAR(5) NOT NULL DEFAULT 'NIU', -- Catálogo 03 SUNAT: NIU (Unidad), GLN (Galón), LTR (Litro)
    presentation VARCHAR(60) NOT NULL, -- Ej: '1 Cuarto (946ml)', 'Galón (3.78L)', 'Balde 19L', 'Granel Litro'
    technical_specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    purchase_price NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    sale_price NUMERIC(12,4) NOT NULL, -- Precio público con IGV incluido
    wholesale_price NUMERIC(12,4),
    tax_affectation_code VARCHAR(2) NOT NULL DEFAULT '10', -- Catálogo 07 SUNAT: '10' Gravado, '20' Exonerado, '30' Inafecto
    stock_current NUMERIC(12,3) NOT NULL DEFAULT 0.000, -- Soporta decimales para venta a granel
    stock_min NUMERIC(12,3) NOT NULL DEFAULT 5.000,
    image_url TEXT,
    is_published_web BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de alto rendimiento para el POS y Catálogo Web
CREATE INDEX IF NOT EXISTS idx_products_specs_gin ON products USING GIN (technical_specs);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_sku_trgm ON products USING GIN (sku gin_trgm_ops);

-- 3. KARDEX DE INVENTARIO
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    movement_type VARCHAR(20) NOT NULL, -- 'IN_PURCHASE', 'OUT_SALE', 'ADJUSTMENT', 'RETURN_IN'
    quantity NUMERIC(12,3) NOT NULL,
    stock_before NUMERIC(12,3) NOT NULL,
    stock_after NUMERIC(12,3) NOT NULL,
    unit_cost NUMERIC(12,4) NOT NULL,
    reference_doc VARCHAR(50),
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CLIENTES Y VEHÍCULOS (CORE DE FIDELIZACIÓN)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_type_code VARCHAR(2) NOT NULL, -- Catálogo 06 SUNAT: '1'=DNI, '6'=RUC, '4'=CE, '0'=Sin Doc
    doc_number VARCHAR(15) UNIQUE NOT NULL,
    full_name_or_business_name VARCHAR(250) NOT NULL,
    fiscal_address TEXT,
    ubigeo VARCHAR(6),
    phone_whatsapp VARCHAR(20), -- Formato E.164: +519XXXXXXXX
    email VARCHAR(150),
    accepts_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    license_plate VARCHAR(15) UNIQUE NOT NULL, -- Ej: 'ABC-123'
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(80) NOT NULL,
    year SMALLINT,
    engine_fuel VARCHAR(30) DEFAULT 'GASOLINA', -- 'GASOLINA', 'GLP', 'GNV', 'DIESEL'
    usage_profile VARCHAR(30) NOT NULL DEFAULT 'PARTICULAR', -- 'PARTICULAR' (35 km/día), 'TAXI_COLECTIVO' (140 km/día), 'FLOTA_COMERCIAL' (160 km/día)
    daily_avg_km INTEGER NOT NULL DEFAULT 35,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(license_plate);

-- 5. SERIES Y VENTAS (FACTURACIÓN ELECTRÓNICA SUNAT UBL 2.1)
CREATE TABLE IF NOT EXISTS document_series (
    id SERIAL PRIMARY KEY,
    doc_type_code VARCHAR(2) NOT NULL, -- '01'=Factura, '03'=Boleta, '07'=Nota Crédito, '80'=Ticket Interno
    series VARCHAR(4) UNIQUE NOT NULL, -- 'F001', 'B001', 'NV01'
    current_correlative BIGINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    vehicle_id UUID REFERENCES vehicles(id),
    doc_type_code VARCHAR(2) NOT NULL, -- '01', '03', '80'
    series VARCHAR(4) NOT NULL,
    correlative BIGINT NOT NULL,
    full_number VARCHAR(20) UNIQUE NOT NULL, -- Ej: 'F001-00000125'
    issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    currency_code VARCHAR(3) NOT NULL DEFAULT 'PEN',
    total_gravadas NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_exoneradas NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_inafectas NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_igv NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_discount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12,2) NOT NULL,
    amount_in_words VARCHAR(250) NOT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'EFECTIVO', -- 'EFECTIVO', 'YAPE_PLIN', 'TARJETA', 'TRANSFERENCIA'
    payment_condition VARCHAR(20) NOT NULL DEFAULT 'CONTADO',
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    description VARCHAR(250) NOT NULL,
    unit_code VARCHAR(5) NOT NULL,
    quantity NUMERIC(12,3) NOT NULL,
    unit_value NUMERIC(12,4) NOT NULL, -- Valor Unitario SIN IGV
    unit_price NUMERIC(12,4) NOT NULL, -- Precio Unitario CON IGV
    tax_affectation_code VARCHAR(2) NOT NULL DEFAULT '10',
    igv_amount NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL, -- Cantidad * Valor Unitario
    total NUMERIC(12,2) NOT NULL     -- Cantidad * Precio Unitario
);

CREATE TABLE IF NOT EXISTS sunat_transmissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID UNIQUE NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    xml_s3_url TEXT,
    cdr_s3_url TEXT,
    pdf_ticket_s3_url TEXT,
    pdf_a4_s3_url TEXT,
    hash_cpe VARCHAR(100),
    qr_string TEXT,
    sunat_status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'OBSERVED', 'REJECTED'
    sunat_response_code VARCHAR(10),
    sunat_message TEXT,
    retry_count SMALLINT NOT NULL DEFAULT 0,
    transmitted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. MOTOR DE RECORDATORIOS Y FIDELIZACIÓN (CAMBIO DE ACEITE)
CREATE TABLE IF NOT EXISTS service_maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    service_date DATE NOT NULL DEFAULT CURRENT_DATE,
    mileage_at_service INTEGER NOT NULL, -- Ej: 85000
    next_service_mileage INTEGER NOT NULL, -- Ej: 90000
    oil_product_id UUID REFERENCES products(id),
    oil_applied_name VARCHAR(150) NOT NULL,
    oil_viscosity VARCHAR(20),
    changed_oil_filter BOOLEAN NOT NULL DEFAULT TRUE,
    changed_air_filter BOOLEAN NOT NULL DEFAULT FALSE,
    changed_cabin_filter BOOLEAN NOT NULL DEFAULT FALSE,
    estimated_next_date DATE NOT NULL, -- Calculado por el motor en Go
    lifecycle_status VARCHAR(25) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PRE_REMINDED', 'DUE_REMINDED', 'RENEWED', 'OVERDUE'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_next_date ON service_maintenance_logs(estimated_next_date, lifecycle_status);

CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_log_id UUID NOT NULL REFERENCES service_maintenance_logs(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    channel VARCHAR(15) NOT NULL, -- 'WHATSAPP', 'SMS'
    stage VARCHAR(30) NOT NULL, -- 'POST_SALE_TICKET', 'PRE_7_DAYS', 'DUE_DAY', 'WINBACK_15_DAYS'
    recipient_phone VARCHAR(20) NOT NULL,
    message_sent TEXT NOT NULL,
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'SENT', -- 'SENT', 'DELIVERED', 'FAILED_FALLBACK_SMS'
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SEED INICIAL: Series de facturación oficial
INSERT INTO document_series (doc_type_code, series, current_correlative, is_active)
VALUES 
    ('01', 'F001', 0, true),
    ('03', 'B001', 0, true),
    ('80', 'NV01', 0, true)
ON CONFLICT (series) DO NOTHING;

-- SEED INICIAL: Marcas reconocidas
INSERT INTO brands (name) VALUES 
    ('Castrol'),
    ('Mobil 1'),
    ('Motul'),
    ('Liqui Moly'),
    ('Shell Helix'),
    ('Mann Filter'),
    ('Bosch')
ON CONFLICT (name) DO NOTHING;

-- SEED INICIAL: Categorías
INSERT INTO categories (name, slug) VALUES 
    ('Aceites de Motor Sintéticos', 'aceites-sinteticos'),
    ('Aceites Semisintéticos', 'aceites-semisinteticos'),
    ('Aceites Minerales', 'aceites-minerales'),
    ('Filtros de Aceite', 'filtros-aceite'),
    ('Filtros de Aire y Cabina', 'filtros-aire-cabina'),
    ('Refrigerantes y Aditivos', 'refrigerantes-aditivos')
ON CONFLICT (slug) DO NOTHING;
