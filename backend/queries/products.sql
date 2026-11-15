-- name: SearchProducts :many
SELECT p.*, b.name as brand_name, c.name as category_name
FROM products p
JOIN brands b ON p.brand_id = b.id
JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
  AND (
      $1::text = '' 
      OR p.name ILIKE '%' || $1 || '%' 
      OR p.sku ILIKE '%' || $1 || '%' 
      OR p.barcode = $1
  )
ORDER BY p.name ASC
LIMIT $2 OFFSET $3;

-- name: FilterProductsByViscosity :many
SELECT p.*, b.name as brand_name, c.name as category_name
FROM products p
JOIN brands b ON p.brand_id = b.id
JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true 
  AND p.is_published_web = true
  AND p.technical_specs->>'viscosity' = $1
ORDER BY p.sale_price ASC;

-- name: GetProductByID :one
SELECT p.*, b.name as brand_name, c.name as category_name
FROM products p
JOIN brands b ON p.brand_id = b.id
JOIN categories c ON p.category_id = c.id
WHERE p.id = $1;
