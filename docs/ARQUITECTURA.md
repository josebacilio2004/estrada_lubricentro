# 📘 Plan de Arquitectura e Implementación v2.0 (High-Performance Cloud-Native)
## Ecosistema Digital "Lubricentros Estrada" — Golang + PostgreSQL + Next.js + Docker

**Rol:** Principal Full-Stack Software Architect & Senior UI/UX Product Designer  
**Cliente:** Lubricentros Estrada (Perú)  
**Enfoque del Sistema:** E-Commerce / Landing Page + ERP/POS de Ultra-Baja Latencia (Inventario Automotriz, Facturación Electrónica SUNAT UBL 2.1 y CRM de Fidelización Predictiva).  
**Infraestructura:** 100% Contenerizada con Docker (Multi-Stage Builds, Distroless/Alpine, Red Aislada y Alta Concurrencia).

---

## 1. El Stack Más Óptimo (Por qué esta combinación es imbatible)

Al migrar el núcleo transaccional y la capa de acceso a datos a **Golang (Go)** junto con **PostgreSQL**, el sistema pasa de ser un ERP tradicional a una plataforma de **alta frecuencia y mínimo consumo de recursos** (un binario compilado de Go consume ~15-25 MB de RAM frente a los >250 MB de un runtime tradicional, procesando miles de peticiones por segundo).

### 1.1. Capa de Datos y Backend Core (Golang + PostgreSQL)
*   **Lenguaje y Runtime:** **Go (Golang 1.23+)** compilado de forma estática (`CGO_ENABLED=0`) sobre contenedores **Alpine / Distroless** de menos de 20 MB.
*   **Framework HTTP:** **Fiber v2/v3** (basado en `fasthttp`, el motor HTTP más rápido en Go) o **Chi / Gin** para enrutamiento RESTful de latencia sub-milisegundo.
*   **Capa de Base de Datos (Type-Safe & Zero-Overhead):**
    *   **Driver & Pool de Conexiones:** `pgx/v5` (`pgxpool`) — conexión nativa binaria directa a PostgreSQL (mucho más rápida que `database/sql` estándar).
    *   **Generador de Consultas SQL:** **sqlc** — compilador que transforma consultas SQL puras en código Go 100% fuertemente tipado en tiempo de compilación (cero reflexión en tiempo de ejecución, velocidad de SQL puro sin el overhead de un ORM pesado).
    *   **Migraciones Versionadas:** `golang-migrate` integrado en el arranque o pipeline de Docker.
    *   **Precisión Financiera (SUNAT):** Librería `shopspring/decimal` en Go combinada con `NUMERIC(12,4)` en PostgreSQL para evitar cualquier error de redondeo de punto flotante en cálculos de IGV (18%), Valor Unitario y Precio Unitario.
*   **Concurrencia, Colas y Tareas Programadas (Workers en Go):**
    *   **Asynq (sobre Redis 7):** Librería de colas distribuidas en Go. Procesa en segundo plano (Goroutines concurrentes) el firmado/envío de comprobantes XML a SUNAT, la generación de PDFs térmicos de 80mm y el disparo de recordatorios de cambio de aceite sin bloquear jamás la venta en el POS (el cajero cobra en `< 80ms`).
    *   **Robfig/cron (v3):** Planificador nativo en Go que ejecuta todos los días a las `09:00 AM (America/Lima)` el motor predictivo de recordatorios de cambio de aceite.
*   **Facturación Electrónica SUNAT UBL 2.1:**
    *   **Arquitectura Híbrida (Adapter Pattern en Go):**
        1.  *Modo Nativo/Microservicio:* Generación de XML UBL 2.1 firmados con `crypto/x509` y `xmldsig` en Go o contenedor lateral liviano de facturación, enviando por SOAP/REST directo a SUNAT/OSE.
        2.  *Modo API OSE/PSE:* Conector HTTP concurrente en Go con *Circuit Breaker* y reintentos exponenciales (vía Asynq) para emisión inmediata de Facturas (`01`), Boletas (`03`), Notas de Crédito (`07`) y Tickets (`80`).

### 1.2. Capa de Presentación (Frontend Web + POS SPA)
*   **Framework:** **Next.js (App Router) con TypeScript** compilado en modo `output: 'standalone'` para Docker (reduce la imagen de Node de 1.2GB a ~110MB).
*   **UI & Estilos:** **Tailwind CSS + shadcn/ui + Lucide Icons**.
*   **Estado y Sincronización:** **TanStack Query v5** + **Zustand** (con persistencia local en IndexedDB para que el POS no pierda el carrito si hay un microcorte de red).

### 1.3. Capa de Automatización Omnicanal (WhatsApp + SMS)
*   **Orquestador:** Contenedor **n8n** conectado a la misma red Docker (`estrada_internal_net`), recibiendo Webhooks firmados con HMAC-SHA256 desde el backend en Go.
*   **Canales:** WhatsApp Business Cloud API / Evolution API (para envío de PDF del comprobante + cartilla de mantenimiento) + Fallback automático a **SMS (Twilio / Infobip)** si el número no tiene WhatsApp o no registra entrega.

---

## 2. Arquitectura de Contenedores Docker (Infraestructura Completa)

Toda la infraestructura corre aislada bajo una topología de red de dos capas (`frontend_net` y `backend_net`), garantizando que PostgreSQL y Redis jamás estén expuestos a Internet.

### 2.1. Diagrama de Topología de Contenedores

```text
                        [ INTERNET / CLIENTES / CAJEROS ]
                                       │
                                  (Puerto 80/443)
                                       ▼
                        ┌──────────────────────────────┐
                        │   caddy-proxy (Reverse Proxy)│ ◄── Auto SSL (Let's Encrypt) + HTTP/3
                        └──────────────┬───────────────┘
                 ┌─────────────────────┼─────────────────────┐
                 ▼                     ▼                     ▼
      ┌─────────────────────┐ ┌───────────────────┐ ┌───────────────────┐
      │   estrada-web       │ │   estrada-api     │ │   estrada-n8n     │
      │ (Next.js Standalone)│ │ (Golang Fiber API)│ │ (WhatsApp/SMS Hub)│
      │     Puerto: 3000    │ │    Puerto: 8080   │ │    Puerto: 5678   │
      └─────────────────────┘ └─────────┬─────────┘ └─────────┬─────────┘
                                        │                     │
                         ┌──────────────┼──────────────┐      │
                         ▼              ▼              ▼      ▼
               ┌─────────────────┐ ┌──────────┐ ┌───────────────────────┐
               │ estrada-worker  │ │  redis   │ │     postgres-db       │
               │ (Go Asynq +     │ │ (Alpine) │ │   (PostgreSQL 16 +    │
               │  Cron + SUNAT)  │ │  :6379   │ │    PgBouncer/Tuning)  │
               └─────────────────┘ └──────────┘ └───────────┬───────────┘
                                                            │
                                                  ┌─────────▼─────────┐
                                                  │   minio-storage   │
                                                  │ (S3 Local: XMLs,  │
                                                  │  CDRs, PDFs, Imgs)│
                                                  └───────────────────┘
```

### 2.2. Archivo `docker-compose.yml` de Producción (Optimizado)

```yaml
version: '3.9'

services:
  # 1. REVERSE PROXY & AUTO-SSL (HTTP/3 + Compresión Zstd/Gzip)
  caddy:
    image: caddy:2.8-alpine
    container_name: estrada_proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp" # Soporte HTTP/3 (QUIC)
    volumes:
      - ./docker/caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - frontend_net
    depends_on:
      - web
      - api

  # 2. FRONTEND: LANDING PAGE + ERP/POS (Next.js Standalone)
  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: estrada_web
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.lubricentrosestrada.pe/v1
    networks:
      - frontend_net
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M

  # 3. BACKEND API CORE (Golang 1.23 Compilado en Alpine)
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: api-runner
    container_name: estrada_api
    restart: unless-stopped
    env_file: .env.production
    environment:
      - APP_ENV=production
      - TZ=America/Lima
      - DB_URL=postgres://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?sslmode=disable&pool_max_conns=50
      - REDIS_ADDR=redis:6379
      - S3_ENDPOINT=http://minio:9000
      - N8N_WEBHOOK_URL=http://n8n:5678/webhook/lubricentro-notifications
    networks:
      - frontend_net
      - backend_net
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 256M # Go maneja miles de req/s en menos de 256MB

  # 4. WORKER ASÍNCRONO & CRON SCHEDULER (Golang Asynq + SUNAT + Recordatorios)
  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: worker-runner
    container_name: estrada_worker
    restart: unless-stopped
    env_file: .env.production
    environment:
      - TZ=America/Lima
      - DB_URL=postgres://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?sslmode=disable&pool_max_conns=20
      - REDIS_ADDR=redis:6379
      - S3_ENDPOINT=http://minio:9000
      - N8N_WEBHOOK_URL=http://n8n:5678/webhook/lubricentro-notifications
    networks:
      - backend_net
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 256M

  # 5. BASE DE DATOS TRANSACCIONAL (PostgreSQL 16 Optimizado)
  postgres:
    image: postgres:16-alpine
    container_name: estrada_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
      TZ: America/Lima
      PGTZ: America/Lima
    command: >
      postgres
      -c shared_buffers=512MB
      -c effective_cache_size=1536MB
      -c maintenance_work_mem=128MB
      -c work_mem=16MB
      -c max_connections=200
      -c random_page_cost=1.1
      -c timezone='America/Lima'
    volumes:
      - pg_data:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d:ro
    networks:
      - backend_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 6. COLAS EN MEMORIA Y CACHÉ DE CATÁLOGO (Redis 7)
  redis:
    image: redis:7.4-alpine
    container_name: estrada_redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy noeviction
    volumes:
      - redis_data:/data
    networks:
      - backend_net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # 7. ALMACENAMIENTO S3 COMPATIBLE (XMLs SUNAT, CDRs, PDFs 80mm/A4, Fotos Productos)
  minio:
    image: minio/minio:latest
    container_name: estrada_minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes:
      - minio_data:/data
    networks:
      - backend_net

  # 8. ORQUESTADOR DE MENSAJERÍA AUTOMÁTICA (WhatsApp + SMS Fallback)
  n8n:
    image: n8nio/n8n:latest
    container_name: estrada_n8n
    restart: unless-stopped
    environment:
      - N8N_HOST=automatizacion.lubricentrosestrada.pe
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - GENERIC_TIMEZONE=America/Lima
      - TZ=America/Lima
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - frontend_net
      - backend_net

networks:
  frontend_net:
    driver: bridge
  backend_net:
    driver: bridge
    internal: false # Permite salida a APIs de SUNAT/RENIEC/WhatsApp pero bloquea entrada directa

volumes:
  caddy_data:
  caddy_config:
  pg_data:
  redis_data:
  minio_data:
  n8n_data:
```

### 2.3. `Dockerfile` Multi-Stage para Golang (API + Worker)

```dockerfile
# Etapa 1: Compilación del binario estático en Go
FROM golang:1.23-alpine AS builder
RUN apk add --no-cache git ca-certificates tzdata
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
# Compilamos el binario de la API y el binario del Worker sin dependencias C
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /bin/estrada-api ./cmd/api/main.go
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /bin/estrada-worker ./cmd/worker/main.go

# Etapa 2: Imagen final ultra-ligera para la API (~18 MB)
FROM alpine:3.20 AS api-runner
RUN apk add --no-cache ca-certificates tzdata
COPY --from=builder /bin/estrada-api /usr/local/bin/estrada-api
EXPOSE 8080
USER nobody:nobody
ENTRYPOINT ["/usr/local/bin/estrada-api"]

# Etapa 3: Imagen final ultra-ligera para el Worker (SUNAT + Cron Recordatorios)
FROM alpine:3.20 AS worker-runner
RUN apk add --no-cache ca-certificates tzdata
COPY --from=builder /bin/estrada-worker /usr/local/bin/estrada-worker
USER nobody:nobody
ENTRYPOINT ["/usr/local/bin/estrada-worker"]
```

---

## 3. Sistema de Diseño UI/UX (Design System & Branding)

El rubro de lubricentros exige transmitir **precisión mecánica, limpieza industrial, energía y confianza técnica**. Se aplica una estética **Dark Tech Industrial con acentos Ámbar/Naranja de alto contraste y detalles Glassmorphism** en la Landing Page, combinada con un modo de alta legibilidad para el POS administrativo.

### 3.1. Paleta de Colores Oficial ("Estrada Performance Palette")

| Token / Rol | Nombre | Hexadecimal | Uso en la Interfaz |
| :--- | :--- | :--- | :--- |
| `--bg-primary` | **Deep Motor Navy** | `#060E1E` | Fondo principal de la Landing Page, Sidebar del ERP y cabeceras. |
| `--bg-surface` | **Carbon Slate** | `#0F1E36` | Tarjetas de productos, modales y contenedores con efecto Glassmorphism (`backdrop-blur-md bg-[#0F1E36]/80`). |
| `--brand-primary` | **Synthetic Amber (Oro Líquido)** | `#F59E0B` | Color inspirado en el aceite sintético puro. Botones secundarios, badges de viscosidad (`5W-30`, `10W-40`), indicadores clave. |
| `--brand-accent` | **Ignition Orange** | `#FD681A` | CTA Principal ("Agendar Cambio", "Emitir Comprobante", "Cotizar por WhatsApp"). |
| `--brand-trust` | **Precision Teal / Cyan** | `#0EA5E9` | Indicadores de conexión activa con SUNAT, estados de sincronización y enlaces técnicos. |
| `--text-main` | **Pure Titanium** | `#F8FAFC` | Títulos y textos principales sobre fondos oscuros. |
| `--text-muted` | **Steel Gray** | `#94A3B8` | Subtítulos, códigos SKU, kilometrajes y metadatos. |
| `--status-ok` | **Coolant Green** | `#10B981` | "Aceptado por SUNAT", "Stock Disponible", "WhatsApp Enviado". |
| `--status-warn` | **Additive Yellow** | `#EAB308` | "Stock Bajo (Mínimo)", "Próximo a cambio de aceite (7 días)". |
| `--status-danger` | **Brake Red** | `#EF4444` | "Stock Crítico", "Rechazado por SUNAT", "Cambio de aceite vencido". |

### 3.2. Tipografía e Iconografía
*   **Títulos y Branding (Display):** `Outfit` o `Space Grotesk` (Bold / ExtraBold) — transmite modernidad automotriz y solidez.
*   **Cuerpo y Tablas del ERP:** `Plus Jakarta Sans` o `Inter` — lectura rápida para cajeros y almaceneros.
*   **Datos Numéricos (Precios, RUC, Placas, Kilometraje, Series SUNAT):** `JetBrains Mono` (Monospace) — garantiza que los números en el POS, placas (`ABC-123`) y series (`F001-00004521`) estén perfectamente alineados.

---

## 4. Arquitectura de Base de Datos en PostgreSQL + Golang (`sqlc`)

El esquema aprovecha características avanzadas de **PostgreSQL 16**: índices `GIN` sobre columnas `JSONB` para buscar aceites por viscosidad o equivalencia de filtro en `< 1ms`, tipos `NUMERIC(12,4)` para exactitud tributaria SUNAT, y bloqueos pesimistas de fila (`SELECT ... FOR UPDATE`) gestionados desde transacciones Go (`pgx.Tx`) para los correlativos de facturación y el stock.

### 4.1. DDL SQL de Producción (`001_init_schema.up.sql`)

```sql
-- Extensiones para UUIDs y búsqueda de texto ultrarrápida (Trigramas para buscar códigos de filtros/aceites)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. CATEGORÍAS Y MARCAS
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PRODUCTOS (LUBRICANTES, FILTROS, REFRIGERANTES, ADITIVOS)
CREATE TABLE products (
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
    -- Ejemplo JSONB: {"viscosity": "5W-30", "oil_type": "Full Sintético", "api_norm": "API SP", "lifespan_km": 7500, "oem_cross_ref": ["90915-YZZD2", "PH3614"]}
    purchase_price NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    sale_price NUMERIC(12,4) NOT NULL, -- Precio público con IGV incluido
    wholesale_price NUMERIC(12,4),
    tax_affectation_code VARCHAR(2) NOT NULL DEFAULT '10', -- Catálogo 07 SUNAT: '10' Gravado, '20' Exonerado, '30' Inafecto
    stock_current NUMERIC(12,3) NOT NULL DEFAULT 0.000, -- Soporta decimales para venta de aceite a granel (ej. 4.5 litros)
    stock_min NUMERIC(12,3) NOT NULL DEFAULT 5.000,
    image_url TEXT,
    is_published_web BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de alto rendimiento para el POS y Catálogo Web
CREATE INDEX idx_products_specs_gin ON products USING GIN (technical_specs);
CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);
CREATE INDEX idx_products_sku_trgm ON products USING GIN (sku gin_trgm_ops);

-- 3. KARDEX DE INVENTARIO
CREATE TABLE inventory_movements (
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
CREATE TABLE customers (
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

CREATE TABLE vehicles (
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

CREATE INDEX idx_vehicles_plate ON vehicles(license_plate);

-- 5. SERIES Y VENTAS (FACTURACIÓN ELECTRÓNICA SUNAT UBL 2.1)
CREATE TABLE document_series (
    id SERIAL PRIMARY KEY,
    doc_type_code VARCHAR(2) NOT NULL, -- '01'=Factura, '03'=Boleta, '07'=Nota Crédito, '80'=Ticket Interno
    series VARCHAR(4) UNIQUE NOT NULL, -- 'F001', 'B001', 'NV01'
    current_correlative BIGINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE sales (
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

CREATE TABLE sale_items (
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

CREATE TABLE sunat_transmissions (
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
CREATE TABLE service_maintenance_logs (
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
    estimated_next_date DATE NOT NULL, -- Fecha calculada por el motor en Go
    lifecycle_status VARCHAR(25) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PRE_REMINDED', 'DUE_REMINDED', 'RENEWED', 'OVERDUE'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maintenance_next_date ON service_maintenance_logs(estimated_next_date, lifecycle_status);

CREATE TABLE notification_logs (
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
```

---

## 5. Flujo de Ingeniería en Golang (Transacción POS + SUNAT + CRM)

En Go, el servicio de venta (`SaleService.CreateSale`) ejecuta una transacción atómica en PostgreSQL (`pgx.BeginTx`) que tarda menos de **15 milisegundos**:

1.  **Bloqueo de Serie (`SELECT current_correlative FROM document_series WHERE series = $1 FOR UPDATE`):** Incrementa el correlativo (`F001-00000125`) garantizando que nunca existan dos comprobantes con el mismo número, incluso si 10 cajeros cobran en el mismo milisegundo.
2.  **Descuento Atómico de Stock y Kardex:** Verifica stock con `FOR UPDATE`, descuenta la cantidad y registra el movimiento en `inventory_movements`.
3.  **Cálculo Tributario Exacto (`shopspring/decimal`):**
    *   $	ext{Valor Unitario} = rac{	ext{Precio con IGV}}{1.18}$
    *   $	ext{Subtotal Gravado} = \sum (	ext{Valor Unitario} 	imes 	ext{Cantidad})$
    *   $	ext{IGV} = 	ext{Total Venta} - 	ext{Subtotal Gravado}$
4.  **Cálculo Inteligente del Próximo Cambio de Aceite:**
    *   Si la venta incluye un vehículo (`license_plate`), marca cualquier mantenimiento anterior de esa placa como `RENEWED` y calcula:
    *   $	ext{Días hasta próximo cambio} = \min\left(\left\lfloorrac{	ext{Km Vida Útil Aceite}}{	ext{Km Diarios del Vehículo}}ightfloor, 180ight)$
    *   Inserta el nuevo registro en `service_maintenance_logs` con `estimated_next_date = CURRENT_DATE + Días`.
5.  **Commit y Encolado en Redis (`Asynq`):**
    *   Hace `tx.Commit(ctx)` y responde inmediatamente al Frontend con el JSON para imprimir el Ticket de 80mm.
    *   Encola dos tareas en `Asynq`:
        *   `task:sunat:transmit` (Firma XML UBL 2.1, envía a SUNAT/OSE, guarda CDR en MinIO S3).
        *   `task:notify:whatsapp_ticket` (Envía a los 2 minutos el comprobante PDF y la cartilla digital de próximo cambio al WhatsApp del cliente).

---

## 6. Prompt Maestro de Ejecución para Gemini 3.8 Flash (Stack Golang + Docker)

> **Instrucciones de uso:** Copia y pega el siguiente bloque en **Gemini 3.8 Flash** para generar todo el código fuente de producción (estructura de directorios en Go, `sqlc`, handlers en Fiber, workers en Asynq, Dockerfiles y Frontend en Next.js).

```text
Actúa como un Principal Backend Engineer experto en Golang (Go 1.23+), Cloud-Native Solutions Architect (Docker) y Senior UI/UX Product Designer (Next.js + Tailwind CSS). Vamos a desarrollar el sistema empresarial completo y la Landing Page publicitaria para "Lubricentros Estrada" (Perú), especializado en la venta de aceites de motor, filtros (aceite, aire, cabina, combustible), refrigerantes, aditivos y servicio de cambio de aceite.

### 1. STACK TECNOLÓGICO E INFRAESTRUCTURA OBLIGATORIA (100% DOCKERIZADO)
- **Backend Core & Capa de Datos:** Golang 1.23+ siguiendo Clean/Hexagonal Architecture (`cmd/api`, `cmd/worker`, `internal/domain`, `internal/repository`, `internal/service`, `internal/delivery/http`).
  - Framework HTTP: `gofiber/fiber/v2` (o `go-chi/chi`).
  - Base de Datos: **PostgreSQL 16** accedida mediante `jackc/pgx/v5` (`pgxpool`) y consultas tipadas con `sqlc`.
  - Cálculos Financieros/Tributarios: `shopspring/decimal` para precisión exacta en IGV (18%) y precios unitarios sin errores de coma flotante.
  - Colas Asíncronas y Cron Jobs: `hibiken/asynq` (sobre **Redis 7**) + `robfig/cron/v3` para emisión electrónica SUNAT en segundo plano y barrido diario (09:00 AM America/Lima) de recordatorios de cambio de aceite.
  - Almacenamiento de Archivos: **MinIO (S3 Compatible)** para guardar XMLs firmados, CDRs de SUNAT y PDFs en formato Ticket 80mm y A4.
- **Facturación Electrónica SUNAT (Estándar UBL 2.1 Perú):**
  - Soporte para Factura Electrónica (`01` - Serie `F001`), Boleta de Venta Electrónica (`03` - Serie `B001`), Nota de Crédito (`07`) y Ticket/Nota de Venta Interna (`80` - Serie `NV01`).
  - Generación de cadena QR Oficial SUNAT (`RUC|TIPO|SERIE|NUMERO|IGV|TOTAL|FECHA|TIPO_DOC_CLIENTE|NUM_DOC_CLIENTE|HASH_CPE`), Hash CPE e importe en letras (`SON: ... CON 00/100 SOLES`).
- **Motor Predictivo de Fidelización (WhatsApp + SMS):**
  - El worker en Go evalúa diariamente `service_maintenance_logs` y dispara Webhooks firmados hacia un contenedor **n8n**, que envía mensajes automáticos por WhatsApp Business API (y SMS vía Twilio/Infobip como fallback) en 3 etapas: 7 días antes del cambio estimado, el día exacto del vencimiento y 15 días después (recuperación de clientes).
- **Frontend (Landing Page SEO + ERP/POS Dashboard):**
  - **Next.js (App Router) con TypeScript** en modo `standalone` para Docker, Tailwind CSS, shadcn/ui, Lucide Icons, TanStack Query v5 y Zustand.

### 2. SISTEMA DE DISEÑO UI/UX (PALETA "ESTRADA PERFORMANCE")
Implementa esta identidad visual con estética Dark Tech Industrial & Glassmorphism en la Landing Page y máxima ergonomía visual en el POS:
- Fondo Principal (Deep Motor Navy): `#060E1E`
- Superficies y Tarjetas (Carbon Slate con Glassmorphism): `#0F1E36` (`bg-[#0F1E36]/80 backdrop-blur-md border border-white/10`)
- Color Primario de Marca (Synthetic Amber / Oro Lubricante): `#F59E0B`
- Color de Acción / CTA (Ignition Orange): `#FD681A`
- Color de Soporte Tecnológico / SUNAT (Precision Teal): `#0EA5E9`
- Texto Principal: `#F8FAFC` | Texto Secundario: `#94A3B8`
- Tipografías: 'Outfit' para títulos, 'Plus Jakarta Sans' para cuerpo/tablas y 'JetBrains Mono' para placas (`ABC-123`), RUCs, SKUs, kilometrajes y montos.

### 3. ENTREGABLES QUE DEBES GENERAR PASO A PASO (CÓDIGO DE PRODUCCIÓN SIN OMITIR LÓGICA)
Genera el proyecto completo dividido en los siguientes bloques:

1. **Infraestructura Docker (`docker-compose.yml`, `Caddyfile`, `backend/Dockerfile` Multi-stage en Go y `frontend/Dockerfile` Next.js Standalone):** Listos para levantar con `docker compose up -d --build`.
2. **Capa de Base de Datos (`migrations/001_init.up.sql` y `sqlc.yaml` + queries SQL):** Esquema completo en PostgreSQL 16 con índices GIN sobre `JSONB` para especificaciones de aceites/filtros y bloqueo `FOR UPDATE` para correlativos SUNAT y Kardex.
3. **Backend en Golang (`internal/service/sale_service.go`, `internal/service/sunat_service.go` y `internal/worker/maintenance_reminder_worker.go`):**
   - Transacción ACID con `pgx.Tx` que procesa la venta, descuenta el stock, calcula IGV 18% con `shopspring/decimal`, calcula la fecha estimada del próximo cambio de aceite según el kilometraje del lubricante y el perfil del vehículo (`PARTICULAR`, `TAXI_COLECTIVO`, `FLOTA_COMERCIAL`), y encola el trabajo en `Asynq`.
   - Worker cron en Go que consulta los cambios de aceite próximos a vencer y dispara el Webhook de WhatsApp y SMS.
4. **Frontend Next.js (`app/page.tsx` y `app/admin/pos/page.tsx`):**
   - Landing Page publicitaria de alto impacto con buscador por viscosidad (`5W-30`, `10W-40`, `20W-50`), consulta pública de próximo cambio por Placa y descarga de comprobantes SUNAT.
   - Pantalla de Punto de Venta (POS) de alta velocidad con atajos de teclado, consulta DNI/RUC, captura rápida de Placa + Kilometraje + WhatsApp en 5 segundos e impresión térmica de 80mm.

Comienza generando el Bloque 1 (Infraestructura Docker completa) y el Bloque 2 + 3 (Estructura del Backend en Golang y transacción principal), escribiendo código limpio, idiomático en Go y listo para compilar.
```
