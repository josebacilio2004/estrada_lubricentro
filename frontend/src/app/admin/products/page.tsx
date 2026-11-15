"use client";

import React, { useState, useEffect } from "react";
import { ErpLayout } from "@/components/admin/ErpLayout";
import {
  Edit2,
  Trash2,
  Package,
  AlertTriangle,
  RefreshCw,
  Layers,
  Barcode,
} from "lucide-react";
import { ProductModal, ProductFormData } from "@/components/admin/ProductModal";
import {
  FilaMetricas,
  Metrica,
  AyudaMetrica,
  CONTENEDOR_TABLA,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  FilaVacia,
  ChipCodigo,
  Chip,
  PillEstado,
  PieTablaSimple,
  SegmentadoControl,
  BuscadorKhipu,
  ACCION_SECUNDARIA,
} from "@/components/khipu/khipu-ui";

interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description?: string;
  category_id?: string;
  brand_id?: string;
  presentation: string;
  purchase_price?: string | number;
  sale_price: string | number;
  stock_current: string | number;
  stock_min?: string | number;
  image_url?: string;
  brand_name: string;
  category_name: string;
  technical_specs?: any;
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductFormData | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const apiUrl =
        typeof window !== "undefined"
          ? "/v1"
          : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1";
      const res = await fetch(
        `${apiUrl}/products?q=${encodeURIComponent(search)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleEdit = (p: Product) => {
    const specs = p.technical_specs || {};
    setEditingProduct({
      id: p.id,
      sku: p.sku,
      barcode: p.barcode || "",
      name: p.name,
      description: p.description || "",
      category_id: p.category_id || "",
      brand_id: p.brand_id || "",
      presentation: p.presentation,
      purchase_price: Number(
        p.purchase_price || Math.round(Number(p.sale_price) * 0.72)
      ),
      sale_price: Number(p.sale_price),
      stock_current: Number(p.stock_current),
      stock_min: Number(p.stock_min || 5),
      viscosity: specs.viscosity || "5W-30",
      oil_type: specs.oil_type || "Sintético",
      api_norm: specs.api_norm || "API SP",
      lifespan_km: Number(specs.lifespan_km || 10000),
      image_url: p.image_url || "/media/line-synthetic.png",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `¿Está seguro de desactivar el producto "${name}" del catálogo?`
      )
    )
      return;

    try {
      const apiUrl =
        typeof window !== "undefined"
          ? "/v1"
          : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1";
      await fetch(`${apiUrl}/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch {
      alert("Error al desactivar producto");
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === "TODOS") return true;
    return p.category_name
      ?.toLowerCase()
      .includes(selectedCategory.toLowerCase());
  });

  const lowStockCount = products.filter(
    (p) => Number(p.stock_current) <= 5
  ).length;
  const totalUnidades = products.reduce(
    (acc, p) => acc + Number(p.stock_current || 0),
    0
  );

  return (
    <ErpLayout
      categoryTitle="Catálogo y Kardex"
      title="Productos"
      actionButton={{
        label: "Nuevo producto",
        onClick: () => {
          setEditingProduct(null);
          setIsModalOpen(true);
        },
      }}
    >
      {/* 1. FILA DE MÉTRICAS KHIPU */}
      <FilaMetricas columnas={3}>
        <Metrica
          etiqueta="SKUs activos en catálogo"
          icono={Package}
          tono="acento"
          destacada
          sufijo="productos"
          ayuda="Sincronizados con el portal web y la App Móvil"
        >
          {products.length}
        </Metrica>

        <Metrica
          etiqueta="Existencias físicas totales"
          icono={Layers}
          tono="ok"
          sufijo="unidades"
          ayuda={
            <AyudaMetrica tono="ok">
              Stock consolidado en almacén Huancayo
            </AyudaMetrica>
          }
        >
          {totalUnidades}
        </Metrica>

        <Metrica
          etiqueta="Alertas de stock bajo"
          icono={AlertTriangle}
          tono={lowStockCount > 0 ? "aviso" : "ok"}
          sufijo="SKUs"
          ayuda={
            <AyudaMetrica tono={lowStockCount > 0 ? "aviso" : "ok"}>
              {lowStockCount > 0
                ? "Requieren reposición inmediata"
                : "Todos los productos sobre el mínimo"}
            </AyudaMetrica>
          }
        >
          {lowStockCount}
        </Metrica>
      </FilaMetricas>

      {/* 2. BARRA DE FILTROS KHIPU */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentadoControl<string>
            valor={selectedCategory}
            onChange={setSelectedCategory}
            opciones={[
              { valor: "TODOS", etiqueta: "Todos", contador: products.length },
              { valor: "Sintéticos", etiqueta: "Sintéticos" },
              { valor: "Semisintéticos", etiqueta: "Semisintéticos" },
              { valor: "Minerales", etiqueta: "Minerales" },
              { valor: "Filtros", etiqueta: "Filtros" },
              { valor: "Refrigerantes", etiqueta: "Aditivos y Refrig." },
            ]}
          />

          <BuscadorKhipu
            valor={search}
            onChange={setSearch}
            placeholder="Buscar por código de barras EAN, SKU o nombre…"
          />
        </div>

        <button
          type="button"
          onClick={fetchProducts}
          title="Refrescar catálogo"
          className={ACCION_SECUNDARIA}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refrescar</span>
        </button>
      </div>

      {/* 3. TABLA EN BANDA REDONDEADA KHIPU */}
      <div className={CONTENEDOR_TABLA}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU / Código EAN</TableHead>
              <TableHead>Producto y Marca</TableHead>
              <TableHead>Presentación</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Stock Actual</TableHead>
              <TableHead className="text-right">Precio Venta</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <FilaVacia columnas={7}>
                Cargando catálogo de productos desde PostgreSQL…
              </FilaVacia>
            ) : filteredProducts.length === 0 ? (
              <FilaVacia columnas={7}>
                No se encontraron productos coincidentes con la búsqueda.
              </FilaVacia>
            ) : (
              filteredProducts.map((p) => {
                const isLow = Number(p.stock_current) <= 5;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <ChipCodigo>{p.sku}</ChipCodigo>
                        {p.barcode ? (
                          <span className="inline-flex items-center gap-1 font-mono text-etiqueta text-muted-foreground">
                            <Barcode className="h-3 w-3" />
                            {p.barcode}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-card p-1">
                          <img
                            src={p.image_url || "/media/line-synthetic.png"}
                            alt={p.name}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "/media/line-synthetic.png";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground">
                            {p.name}
                          </div>
                          <span className="text-etiqueta text-muted-foreground">
                            {p.brand_name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.presentation}
                    </TableCell>
                    <TableCell>
                      <Chip>{p.category_name}</Chip>
                    </TableCell>
                    <TableCell>
                      <PillEstado tono={isLow ? "aviso" : "ok"}>
                        {p.stock_current} unid.
                      </PillEstado>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground tabular-nums">
                      S/ {Number(p.sale_price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(p)}
                          title="Editar producto o cambiar foto"
                          className="rounded-full p-1.5 text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          title="Desactivar producto"
                          className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive-suave hover:text-destructive-texto transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <PieTablaSimple
          mostrando={filteredProducts.length}
          total={products.length}
          unidad="productos"
          nota="Imágenes sincronizadas por archivo o enlace HTTPS con App Móvil"
        />
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSaved={fetchProducts}
      />
    </ErpLayout>
  );
}
