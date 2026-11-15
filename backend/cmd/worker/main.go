package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"lubricentro-estrada-core/internal/config"
	"lubricentro-estrada-core/internal/service"
	"lubricentro-estrada-core/internal/worker"
	"lubricentro-estrada-core/pkg/logger"

	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robfig/cron/v3"
)

func main() {
	cfg := config.LoadConfig()
	logger.InitLogger(cfg.AppEnv)

	logger.Info("Iniciando Estrada Worker & Cron Hub", "env", cfg.AppEnv)

	// Conexión a PostgreSQL
	var dbPool *pgxpool.Pool
	var err error
	for i := 0; i < 10; i++ {
		dbPool, err = pgxpool.New(context.Background(), cfg.DBURL)
		if err == nil && dbPool.Ping(context.Background()) == nil {
			logger.Info("Worker conectado con éxito a PostgreSQL 16")
			break
		}
		logger.Warn("Worker esperando base de datos...", "intento", i+1)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		logger.Error("Fallo fatal conectando a base de datos en Worker", "error", err.Error())
		os.Exit(1)
	}
	defer dbPool.Close()

	sunatSvc := service.NewSunatService(dbPool, cfg)
	hub := worker.NewWorkerHub(dbPool, cfg, sunatSvc)

	// Cron Scheduler con zona horaria America/Lima
	loc, err := time.LoadLocation("America/Lima")
	if err != nil {
		loc = time.FixedZone("PET", -5*3600)
	}

	c := cron.New(cron.WithLocation(loc))
	_, err = c.AddFunc("0 9 * * *", func() {
		hub.ScanAndDispatchMaintenanceReminders(context.Background())
	})
	if err != nil {
		logger.Error("Error registrando cron de recordatorios", "error", err.Error())
	}
	c.Start()
	defer c.Stop()
	logger.Info("Cron predictivo activo (09:00 AM America/Lima)")

	// Servidor Asynq
	srv := asynq.NewServer(
		asynq.RedisClientOpt{Addr: cfg.RedisAddr},
		asynq.Config{
			Concurrency: 10,
			Queues: map[string]int{
				"critical": 6,
				"default":  3,
				"low":      1,
			},
		},
	)

	mux := asynq.NewServeMux()
	mux.HandleFunc("task:sunat:transmit", hub.HandleSunatTransmitTask)
	mux.HandleFunc("task:notify:whatsapp_ticket", hub.HandleWhatsAppTicketTask)

	// Graceful shutdown para worker
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	go func() {
		logger.Info("Servidor de colas Asynq en ejecución...")
		if err := srv.Run(mux); err != nil {
			logger.Info("Asynq server detenido", "error", err.Error())
		}
	}()

	<-quit
	logger.Info("Señal de apagado recibida en Worker. Deteniendo Asynq y Cron...")
	srv.Shutdown()
	logger.Info("Worker detenido correctamente.")
}
