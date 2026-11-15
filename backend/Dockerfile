# Etapa 1: Compilación del binario estático en Go
FROM golang:1.23-alpine AS builder
RUN apk add --no-cache git ca-certificates tzdata
WORKDIR /app

COPY go.mod ./
COPY . .
RUN go mod tidy
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
