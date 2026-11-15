package repository

import (
	"context"

	"lubricentro-estrada-core/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresCustomerRepo struct {
	db *pgxpool.Pool
}

func NewPostgresCustomerRepo(db *pgxpool.Pool) *PostgresCustomerRepo {
	return &PostgresCustomerRepo{db: db}
}

func (r *PostgresCustomerRepo) Upsert(ctx context.Context, c *domain.Customer) (uuid.UUID, error) {
	query := `
		INSERT INTO customers (
			doc_type_code, doc_number, full_name_or_business_name, 
			fiscal_address, phone_whatsapp, email
		) VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (doc_number) DO UPDATE SET
			full_name_or_business_name = EXCLUDED.full_name_or_business_name,
			fiscal_address = COALESCE(NULLIF(EXCLUDED.fiscal_address, ''), customers.fiscal_address),
			phone_whatsapp = COALESCE(NULLIF(EXCLUDED.phone_whatsapp, ''), customers.phone_whatsapp),
			email = COALESCE(NULLIF(EXCLUDED.email, ''), customers.email),
			updated_at = NOW()
		RETURNING id`

	var id uuid.UUID
	err := r.db.QueryRow(ctx, query,
		c.DocTypeCode, c.DocNumber, c.FullNameOrBusinessName,
		c.FiscalAddress, c.PhoneWhatsApp, c.Email,
	).Scan(&id)
	return id, err
}

func (r *PostgresCustomerRepo) GetByDoc(ctx context.Context, docNumber string) (*domain.Customer, error) {
	query := `
		SELECT id, doc_type_code, doc_number, full_name_or_business_name, 
		       fiscal_address, phone_whatsapp, email, accepts_reminders
		FROM customers 
		WHERE doc_number = $1 LIMIT 1`

	var c domain.Customer
	var addr, phone, email *string
	err := r.db.QueryRow(ctx, query, docNumber).Scan(
		&c.ID, &c.DocTypeCode, &c.DocNumber, &c.FullNameOrBusinessName,
		&addr, &phone, &email, &c.AcceptsReminders,
	)
	if err != nil {
		return nil, domain.ErrCustomerNotFound
	}

	if addr != nil {
		c.FiscalAddress = *addr
	}
	if phone != nil {
		c.PhoneWhatsApp = *phone
	}
	if email != nil {
		c.Email = *email
	}
	return &c, nil
}
