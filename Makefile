# ==============================================================================
# Makefile - Ecosistema Lubricentros Estrada (DevOps Automation)
# ==============================================================================

.PHONY: help build up down restart logs status clean seed test-backend

help:
	@echo "Comandos disponibles:"
	@echo "  make up          - Inicia todos los servicios contenerizados en segundo plano"
	@echo "  make down        - Detiene todos los contenedores"
	@echo "  make build       - Reconstruye las imágenes de Docker (API, Worker, Web)"
	@echo "  make restart     - Reinicia todos los servicios"
	@echo "  make logs        - Muestra los logs en tiempo real"
	@echo "  make status      - Muestra el estado de salud de los contenedores"
	@echo "  make seed        - Aplica datos iniciales de prueba en PostgreSQL"
	@echo "  make clean       - Limpia contenedores huérfanos y volúmenes temporales"

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f --tail=100

status:
	docker compose ps

seed:
	docker compose exec -T postgres psql -U estrada_admin -d lubricentro_estrada -f /docker-entrypoint-initdb.d/002_seed_sample_data.up.sql

clean:
	docker compose down -v --remove-orphans
