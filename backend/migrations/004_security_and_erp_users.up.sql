-- 004_security_and_erp_users.up.sql: Hardening de seguridad, Usuarios Administrativos y Correcciones

-- 1. EXTENSIONES CRIPTOGRÁFICAS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA DE USUARIOS DEL SISTEMA ERP & POS (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'ADMIN', -- 'ADMIN', 'CAJERO_POS', 'MECANICO'
    company_name VARCHAR(150) NOT NULL DEFAULT 'Lubricentros Estrada S.A.C.',
    company_ruc VARCHAR(11) NOT NULL DEFAULT '20608945123',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Semilla de Usuario Administrador Oficial con contraseña encriptada (bcrypt)
-- Contraseña inicial: admin123 (generada con crypt('admin123', gen_salt('bf', 10)))
INSERT INTO users (email, password_hash, full_name, role, company_name, company_ruc)
VALUES (
    'admin@estrada.pe',
    crypt('admin123', gen_salt('bf', 10)),
    'Administración Estrada',
    'ADMIN',
    'Lubricentros Estrada S.A.C.',
    '20608945123'
)
ON CONFLICT (email) DO UPDATE SET
    full_name = 'Administración Estrada',
    company_name = 'Lubricentros Estrada S.A.C.',
    company_ruc = '20608945123';

-- 3. ACTUALIZACIÓN DE CONTRASEÑAS EN VEHÍCULOS (Hashear con bcrypt las contraseñas en texto plano)
UPDATE vehicles
SET password_hash = crypt('estrada123', gen_salt('bf', 10))
WHERE password_hash IS NULL 
   OR password_hash = 'estrada123'
   OR (password_hash NOT LIKE '$2a$%' AND password_hash NOT LIKE '$2b$%');

-- 4. ÍNDICES ADICIONALES PARA VELOCIDAD DE CONSULTAS
CREATE INDEX IF NOT EXISTS idx_sales_issue_date ON sales(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_name_trgm ON customers USING GIN (full_name_or_business_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_inventory_product_date ON inventory_movements(product_id, created_at DESC);
