package repository

import (
	"context"

	"lubricentro-estrada-core/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresVehicleRepo struct {
	db *pgxpool.Pool
}

func NewPostgresVehicleRepo(db *pgxpool.Pool) *PostgresVehicleRepo {
	return &PostgresVehicleRepo{db: db}
}

func (r *PostgresVehicleRepo) Upsert(ctx context.Context, v *domain.Vehicle) (uuid.UUID, error) {
	query := `
		INSERT INTO vehicles (
			customer_id, license_plate, brand, model, year, engine_fuel, usage_profile, daily_avg_km
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (license_plate) DO UPDATE SET
			customer_id = EXCLUDED.customer_id,
			brand = COALESCE(NULLIF(EXCLUDED.brand, ''), vehicles.brand),
			model = COALESCE(NULLIF(EXCLUDED.model, ''), vehicles.model),
			year = COALESCE(EXCLUDED.year, vehicles.year),
			engine_fuel = COALESCE(EXCLUDED.engine_fuel, vehicles.engine_fuel),
			usage_profile = EXCLUDED.usage_profile,
			daily_avg_km = EXCLUDED.daily_avg_km
		RETURNING id`

	var id uuid.UUID
	err := r.db.QueryRow(ctx, query,
		v.CustomerID, v.LicensePlate, v.Brand, v.Model,
		v.Year, v.EngineFuel, v.UsageProfile, v.DailyAvgKM,
	).Scan(&id)
	return id, err
}

func (r *PostgresVehicleRepo) GetByPlate(ctx context.Context, plate string) (*domain.Vehicle, error) {
	query := `
		SELECT id, customer_id, license_plate, brand, model, year, engine_fuel, usage_profile, daily_avg_km, created_at
		FROM vehicles
		WHERE UPPER(REPLACE(license_plate, '-', '')) = UPPER(REPLACE($1, '-', ''))
		LIMIT 1`

	var v domain.Vehicle
	var year *int16
	var fuel *string
	err := r.db.QueryRow(ctx, query, plate).Scan(
		&v.ID, &v.CustomerID, &v.LicensePlate, &v.Brand, &v.Model,
		&year, &fuel, &v.UsageProfile, &v.DailyAvgKM, &v.CreatedAt,
	)
	if err != nil {
		return nil, domain.ErrVehicleNotFound
	}
	if year != nil {
		v.Year = *year
	}
	if fuel != nil {
		v.EngineFuel = *fuel
	}
	return &v, nil
}
