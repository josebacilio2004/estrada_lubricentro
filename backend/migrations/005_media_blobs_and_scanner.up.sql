-- 005_media_blobs_and_scanner.up.sql: Almacenamiento de imágenes en BD y Cola de Escaneo POS en Tiempo Real

-- 1. TABLA DE IMÁGENES EN BASE DE DATOS (Soporte para fotos desde App Móvil Flutter y Web)
CREATE TABLE IF NOT EXISTS media_blobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'image/jpeg',
    data BYTEA NOT NULL,
    size_bytes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. COLA DE ESCANEO POS EN TIEMPO REAL (Sincronización App Móvil Flutter -> POS Web)
CREATE TABLE IF NOT EXISTS pos_scan_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    barcode VARCHAR(50) NOT NULL,
    quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
    session_id VARCHAR(50) NOT NULL DEFAULT 'MAIN',
    consumed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pos_scan_unconsumed ON pos_scan_queue(consumed, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_products_barcode_lookup ON products(barcode);

-- 3. NORMALIZACIÓN DE IMÁGENES POR DEFECTO Y ACENTOS EN CATÁLOGO
UPDATE products SET name = 'Liqui Moly Cera Tec Antifricción' WHERE sku = 'LIQ-CERATEC-300';
UPDATE products SET name = 'Líquido de Frenos Bosch DOT 4 HP' WHERE sku = 'BOSCH-DOT4-1L';

UPDATE products SET image_url = '/media/line-synthetic.png' WHERE (image_url IS NULL OR image_url = '') AND sku IN ('MOB-5W30-GLN', 'CAS-EDGE-5W30-QT', 'MOT-8100-5W40-5L', 'LIQ-MOLY-5W40-5L', 'SHL-ULTRA-0W20', 'LIQ-CERATEC-300', 'BOSCH-DOT4-1L');
UPDATE products SET image_url = '/media/line-semi.png' WHERE (image_url IS NULL OR image_url = '') AND sku IN ('MOT-6100-10W40-4L');
UPDATE products SET image_url = '/media/line-mineral.png' WHERE (image_url IS NULL OR image_url = '') AND sku IN ('CAS-GTX-20W50-GLN');
UPDATE products SET image_url = '/media/tech-engine.png' WHERE (image_url IS NULL OR image_url = '') AND sku IN ('FLT-BOSCH-P3300', 'FLT-MANN-W683');

