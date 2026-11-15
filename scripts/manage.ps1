# ==============================================================================
# Script de Administración DevOps - Lubricentros Estrada (PowerShell)
# ==============================================================================

param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("up", "down", "build", "restart", "logs", "status", "clean", "seed")]
    [string]$Action
)

switch ($Action) {
    "up" {
        Write-Host "Levantando servicios en segundo plano con Docker Compose..." -ForegroundColor Green
        docker compose up -d
        docker compose ps
    }
    "down" {
        Write-Host "Deteniendo contenedores..." -ForegroundColor Yellow
        docker compose down
    }
    "build" {
        Write-Host "Reconstruyendo imagenes Docker (Go API, Go Worker, Next.js Web)..." -ForegroundColor Cyan
        docker compose build
    }
    "restart" {
        Write-Host "Reiniciando ecosistema..." -ForegroundColor Yellow
        docker compose restart
    }
    "logs" {
        Write-Host "Visualizando logs de los contenedores (Ctrl+C para salir)..." -ForegroundColor Cyan
        docker compose logs -f --tail=100
    }
    "status" {
        docker compose ps
    }
    "clean" {
        Write-Host "Limpiando volumenes y contenedores huerfanos..." -ForegroundColor Red
        docker compose down -v --remove-orphans
    }
    "seed" {
        Write-Host "Insertando catalogo de prueba en PostgreSQL..." -ForegroundColor Green
        docker compose exec -T postgres psql -U estrada_admin -d lubricentro_estrada -f /docker-entrypoint-initdb.d/002_seed_sample_data.up.sql
    }
}
