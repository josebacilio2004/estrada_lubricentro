package repository

import (
	"context"
	"fmt"

	"lubricentro-estrada-core/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shopspring/decimal"
)

type PostgresProductRepo struct {
	db *pgxpool.Pool
}

func NewPostgresProductRepo(db *pgxpool.Pool) *PostgresProductRepo {
	return &PostgresProductRepo{db: db}
}

func (r *PostgresProductRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Product, error) {
	query := `
		SELECT p.id, p.sku, p.barcode, p.name, p.presentation, p.sale_price, 
		       p.stock_current, p.image_url, b.name as brand_name, c.name as category_name
		FROM products p
		JOIN brands b ON p.brand_id = b.id
		JOIN categories c ON p.category_id = c.id
		WHERE p.id = $1 AND p.is_active = true`

	var p domain.Product
	var barcode, img *string
	err := r.db.QueryRow(ctx, query, id).Scan(
		&p.ID, &p.SKU, &barcode, &p.Name, &p.Presentation,
		&p.SalePrice, &p.StockCurrent, &img,
		&p.BrandName, &p.CategoryName,
	)
	if err != nil {
		return nil, domain.ErrProductNotFound
	}
	if barcode != nil {
		p.Barcode = *barcode
	}
	if img != nil {
		p.ImageURL = *img
	}
	return &p, nil
}

func (r *PostgresProductRepo) LockForUpdate(ctx context.Context, id uuid.UUID) (stock decimal.Decimal, price decimal.Decimal, unitCost decimal.Decimal, unitCode string, err error) {
	query := `
		SELECT stock_current, sale_price, purchase_price, unit_code
		FROM products
		WHERE id = $1 AND is_active = true
		FOR UPDATE`

	err = r.db.QueryRow(ctx, query, id).Scan(&stock, &price, &unitCost, &unitCode)
	if err != nil {
		return decimal.Zero, decimal.Zero, decimal.Zero, "", domain.ErrProductNotFound
	}
	return stock, price, unitCost, unitCode, nil
}

func (r *PostgresProductRepo) DeductStock(ctx context.Context, id uuid.UUID, quantity decimal.Decimal) error {
	query := `UPDATE products SET stock_current = stock_current - $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.Exec(ctx, query, quantity, id)
	return err
}

func (r *PostgresProductRepo) RecordInventoryMovement(ctx context.Context, m *domain.InventoryMovement) error {
	query := `
		INSERT INTO inventory_movements (
			product_id, movement_type, quantity, stock_before, stock_after, unit_cost, reference_doc, created_by
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	_, err := r.db.Exec(ctx, query, m.ProductID, m.MovementType, m.Quantity, m.StockBefore, m.StockAfter, m.UnitCost, m.ReferenceDoc, m.CreatedBy)
	return err
}

func (r *PostgresProductRepo) Search(ctx context.Context, q string, viscosity string, limit, offset int) ([]domain.Product, error) {
	query := `
		SELECT p.id, p.sku, p.barcode, p.name, p.presentation, p.sale_price, 
		       p.stock_current, p.image_url, b.name as brand_name, c.name as category_name
		FROM products p
		JOIN brands b ON p.brand_id = b.id
		JOIN categories c ON p.category_id = c.id
		WHERE p.is_active = true`

	var args []any
	argIdx := 1

	if q != "" {
		query += fmt.Sprintf(` AND (p.name ILIKE '%%' || $%d || '%%' OR p.sku ILIKE '%%' || $%d || '%%')`, argIdx, argIdx)
		args = append(args, q)
		argIdx++
	}

	if viscosity != "" && viscosity != "TODOS" {
		query += fmt.Sprintf(` AND p.technical_specs->>'viscosity' = $%d`, argIdx)
		args = append(args, viscosity)
		argIdx++
	}

	query += fmt.Sprintf(` ORDER BY p.name ASC LIMIT $%d OFFSET $%d`, argIdx, argIdx+1)
	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []domain.Product
	for rows.Next() {
		var p domain.Product
		var barcode, img *string
		err := rows.Scan(
			&p.ID, &p.SKU, &barcode, &p.Name, &p.Presentation,
			&p.SalePrice, &p.StockCurrent, &img,
			&p.BrandName, &p.CategoryName,
		)
		if err != nil {
			continue
		}
		if barcode != nil {
			p.Barcode = *barcode
		}
		if img != nil {
			p.ImageURL = *img
		}
		products = append(products, p)
	}

	return products, nil
}
