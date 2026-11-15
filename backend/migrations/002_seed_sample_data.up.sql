-- SEED 002: Catálogo automotriz de prueba, clientes y vehículos para pruebas de POS y Landing
DO $$
DECLARE
    brand_mobil_id UUID;
    brand_castrol_id UUID;
    brand_motul_id UUID;
    brand_liqui_id UUID;
    brand_mann_id UUID;
    brand_bosch_id UUID;
    cat_sint_id UUID;
    cat_semi_id UUID;
    cat_min_id UUID;
    cat_filtro_aceite_id UUID;
    cat_filtro_aire_id UUID;
    cat_refrig_id UUID;
BEGIN
    SELECT id INTO brand_mobil_id FROM brands WHERE name = 'Mobil 1' LIMIT 1;
    SELECT id INTO brand_castrol_id FROM brands WHERE name = 'Castrol' LIMIT 1;
    SELECT id INTO brand_motul_id FROM brands WHERE name = 'Motul' LIMIT 1;
    SELECT id INTO brand_liqui_id FROM brands WHERE name = 'Liqui Moly' LIMIT 1;
    SELECT id INTO brand_mann_id FROM brands WHERE name = 'Mann Filter' LIMIT 1;
    SELECT id INTO brand_bosch_id FROM brands WHERE name = 'Bosch' LIMIT 1;

    SELECT id INTO cat_sint_id FROM categories WHERE slug = 'aceites-sinteticos' LIMIT 1;
    SELECT id INTO cat_semi_id FROM categories WHERE slug = 'aceites-semisinteticos' LIMIT 1;
    SELECT id INTO cat_min_id FROM categories WHERE slug = 'aceites-minerales' LIMIT 1;
    SELECT id INTO cat_filtro_aceite_id FROM categories WHERE slug = 'filtros-aceite' LIMIT 1;
    SELECT id INTO cat_filtro_aire_id FROM categories WHERE slug = 'filtros-aire-cabina' LIMIT 1;
    SELECT id INTO cat_refrig_id FROM categories WHERE slug = 'refrigerantes-aditivos' LIMIT 1;

    -- Lubricantes Sintéticos
    INSERT INTO products (sku, barcode, name, description, category_id, brand_id, presentation, technical_specs, purchase_price, sale_price, stock_current, stock_min)
    VALUES 
    (
        'MOB-5W30-GLN', '7501001234567', 'Mobil 1 Advanced Full Synthetic 5W-30', 
        'Aceite 100% sintético para motores modernos a gasolina y GLP.',
        cat_sint_id, brand_mobil_id, '1 Galón (3.78L)',
        '{"viscosity": "5W-30", "oil_type": "Full Sintético", "api_norm": "API SP / ILSAC GF-6A", "lifespan_km": 10000}'::jsonb,
        140.0000, 185.0000, 35.000, 5.000
    ),
    (
        'CAS-EDGE-5W30-QT', '7501001234568', 'Castrol EDGE Titanium FST 5W-30',
        'Fuerza extrema bajo máxima presión con tecnología Titanium Fluid.',
        cat_sint_id, brand_castrol_id, '1 Cuarto (946ml)',
        '{"viscosity": "5W-30", "oil_type": "Full Sintético", "api_norm": "API SP / ACEA C3", "lifespan_km": 10000}'::jsonb,
        36.0000, 48.0000, 70.000, 10.000
    ),
    (
        'MOT-8100-5W40-5L', '7501001234569', 'Motul 8100 X-cess Gen2 5W-40',
        'Aceite de alto rendimiento 100% sintético homologado por Porsche y BMW.',
        cat_sint_id, brand_motul_id, 'Bidón 5 Litros',
        '{"viscosity": "5W-40", "oil_type": "100% Sintético", "api_norm": "API SN / ACEA A3/B4", "lifespan_km": 10000}'::jsonb,
        180.0000, 235.0000, 20.000, 4.000
    ),
    (
        'LIQ-MOLY-5W40-5L', '7501001234570', 'Liqui Moly Molygen New Generation 5W-40',
        'Protección antidesgaste verde fluorescente MFC para reducir fricción hasta un 15%.',
        cat_sint_id, brand_liqui_id, 'Bidón 5 Litros',
        '{"viscosity": "5W-40", "oil_type": "Sintético con Molygen", "api_norm": "API SP / ACEA A3/B4", "lifespan_km": 10000}'::jsonb,
        190.0000, 240.0000, 15.000, 3.000
    )
    ON CONFLICT (sku) DO NOTHING;

    -- Lubricantes Semisintéticos y Minerales
    INSERT INTO products (sku, barcode, name, description, category_id, brand_id, presentation, technical_specs, purchase_price, sale_price, stock_current, stock_min)
    VALUES 
    (
        'MOT-6100-10W40-4L', '7501001234571', 'Motul 6100 Synergie+ 10W-40',
        'Tecnología Technosynthese formulada para motores de alto kilometraje.',
        cat_semi_id, brand_motul_id, 'Galón (4 Litros)',
        '{"viscosity": "10W-40", "oil_type": "Technosynthese", "api_norm": "API SN / ACEA A3/B4", "lifespan_km": 7500}'::jsonb,
        115.0000, 155.0000, 25.000, 5.000
    ),
    (
        'CAS-GTX-20W50-GLN', '7501001234572', 'Castrol GTX 20W-50 Alto Kilometraje',
        'Protección superior contra la formación de lodos en motores de más de 100,000 km.',
        cat_min_id, brand_castrol_id, '1 Galón (3.78L)',
        '{"viscosity": "20W-50", "oil_type": "Mineral Antilodos", "api_norm": "API SP", "lifespan_km": 5000}'::jsonb,
        82.0000, 110.0000, 40.000, 8.000
    )
    ON CONFLICT (sku) DO NOTHING;

    -- Filtros
    INSERT INTO products (sku, barcode, name, description, category_id, brand_id, presentation, technical_specs, purchase_price, sale_price, stock_current, stock_min)
    VALUES 
    (
        'FLT-MANN-W683', '4011558712300', 'Filtro de Aceite Mann Filter W 68/3',
        'Elemento filtrante de alta pureza para motores Toyota Yaris, Corolla, Rush.',
        cat_filtro_aceite_id, brand_mann_id, 'Caja Unidad',
        '{"oem_cross_ref": ["90915-10003", "90915-YZZE1", "PH4967"]}'::jsonb,
        20.0000, 32.0000, 50.000, 10.000
    ),
    (
        'FLT-BOSCH-P3300', '4047024712301', 'Filtro de Aceite Bosch Premium P3300',
        'Filtración multicapa con válvula antidrenaje de silicona para Nissan y Suzuki.',
        cat_filtro_aceite_id, brand_bosch_id, 'Caja Unidad',
        '{"oem_cross_ref": ["15208-65F00", "15208-9E000"]}'::jsonb,
        18.0000, 28.0000, 45.000, 10.000
    )
    ON CONFLICT (sku) DO NOTHING;
END $$;
