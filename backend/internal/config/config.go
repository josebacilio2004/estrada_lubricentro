package config

import (
	"os"
)

type Config struct {
	AppEnv            string
	Port              string
	DBURL             string
	RedisAddr         string
	S3Endpoint        string
	N8NWebhookURL     string
	WebhookHMACSecret string
	SUNATRUC          string
	JWTSecret         string
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func LoadConfig() *Config {
	return &Config{
		AppEnv:            getEnv("APP_ENV", "development"),
		Port:              getEnv("PORT", "8080"),
		DBURL:             getEnv("DB_URL", "postgres://estrada_admin:estrada_secure_pass_2026@postgres:5432/lubricentro_estrada?sslmode=disable"),
		RedisAddr:         getEnv("REDIS_ADDR", "redis:6379"),
		S3Endpoint:        getEnv("S3_ENDPOINT", "http://minio:9000"),
		N8NWebhookURL:     getEnv("N8N_WEBHOOK_URL", "http://n8n:5678/webhook/lubricentro-notifications"),
		WebhookHMACSecret: getEnv("WEBHOOK_HMAC_SECRET", "super_secret_hmac_sha256_key_estrada_2026"),
		SUNATRUC:          getEnv("SUNAT_RUC", "20601234567"),
		JWTSecret:         getEnv("JWT_SECRET", "estrada_jwt_secret_token_ultra_secure_2026_xyz"),
	}
}
