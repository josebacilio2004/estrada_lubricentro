package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"lubricentro-estrada-core/internal/config"
	delivery "lubricentro-estrada-core/internal/delivery/http"
	"lubricentro-estrada-core/internal/service"
	"lubricentro-estrada-core/pkg/logger"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	cfg := config.LoadConfig()
	logger.InitLogger(cfg.AppEnv)

	logger.Info("Iniciando Estrada API Core", "env", cfg.AppEnv, "port", cfg.Port)

	// Conexión pgxpool con reintentos
	var dbPool *pgxpool.Pool
	var err error
	for i := 0; i < 10; i++ {
		dbPool, err = pgxpool.New(context.Background(), cfg.DBURL)
		if err == nil {
			err = dbPool.Ping(context.Background())
			if err == nil {
				logger.Info("Conexión establecida con éxito a PostgreSQL 16")
				break
			}
		}
		logger.Warn("Esperando disponibilidad de PostgreSQL...", "intento", i+1, "error", err.Error())
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		logger.Error("Fallo crítico al conectar a PostgreSQL", "error", err.Error())
		os.Exit(1)
	}
	defer dbPool.Close()

	// Cliente Asynq
	asynqClient := asynq.NewClient(asynq.RedisClientOpt{Addr: cfg.RedisAddr})
	defer asynqClient.Close()

	// Servicios e Inyección de Dependencias
	saleSvc := service.NewSaleService(dbPool, asynqClient, cfg)
	handlers := delivery.NewHandler(dbPool, saleSvc, cfg)

	// Servidor HTTP Fiber
	app := fiber.New(fiber.Config{
		AppName:               "Lubricentros Estrada Core API v2.0",
		ServerHeader:          "Fiber/Estrada-Core",
		BodyLimit:             20 * 1024 * 1024, // 20 MB para fotos desde celular y web
		ReadTimeout:           15 * time.Second,
		WriteTimeout:          15 * time.Second,
		DisableStartupMessage: false,
	})

	app.Use(recover.New())
	app.Use(requestid.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-Requested-With",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	handlers.RegisterRoutes(app)

	// Canal para Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	go func() {
		addr := ":" + cfg.Port
		logger.Info("Servidor Fiber escuchando peticiones", "addr", addr)
		if err := app.Listen(addr); err != nil {
			logger.Info("Servidor Fiber detenido", "error", err.Error())
		}
	}()

	// Esperar señal de terminación del sistema operativo
	<-quit
	logger.Info("Señal de apagado recibida. Iniciando Graceful Shutdown...")

	ctxShutdown, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := app.ShutdownWithContext(ctxShutdown); err != nil {
		logger.Error("Error al forzar apagado de Fiber", "error", err.Error())
	}

	logger.Info("Servidor apagado de forma ordenada y limpia.")
}
