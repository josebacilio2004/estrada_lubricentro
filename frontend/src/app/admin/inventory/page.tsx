"use client";

import React, { useState, useEffect } from "react";
import { ErpLayout } from "@/components/admin/ErpLayout";
import {
  Boxes,
  AlertTriangle,
  PackageCheck,
  RefreshCw,
  SlidersHorizontal,
  X,
} from "lucide-react";
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
  ACCION_PRINCIPAL,
  ACCION_SECUNDARIA,
  CAMPO,
  ETIQUETA_CAMPO,
  TARJETA,
  cn,
} from "@/components/khipu/khipu-ui";

interface InventoryProduct {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  brand_name: string;
  presentation: string;
  stock_current: number;
  stock_min: number;
  sale_price: number;
  category_name: string;
  raw?: any;
}

export default function InventoryAdminPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] =
    useState<"ALL" | "LOW_STOCK" | "OPTIMAL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal de Ajuste de Kardex Khipu
  const [adjustItem, setAdjustItem] = useState<InventoryProduct | null>(null);
  const [adjustMode, setAdjustMode] =
    useState<"ENTRADA" | "SALIDA" | "FIJAR">("ENTRADA");
  const [adjustAmount, setAdjustAmount] = useState<string>("1");
  const [savingAdjust, setSavingAdjust] = useState(false);

  const loadInventory = () => {
    setLoading(true);
    const apiUrl =
      typeof window !== "undefined"
        ? "/v1"
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1";
    fetch(`${apiUrl}/products?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          const mapped = d.data.map((item: any) => ({
            id: item.id,
            sku: item.sku,
            barcode: item.barcode || "",
            name: item.name,
            brand_name: item.brand_name,
            presentation: item.presentation,
            stock_current: Number(item.stock_current) || 0,
            stock_min: Number(item.stock_min) || 5,
            sale_price: Number(item.sale_price) || 0,
            category_name: item.category_name,
            raw: item,
          }));
          setProducts(mapped);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const openAdjustModal = (item: InventoryProduct) => {
    setAdjustItem(item);
    setAdjustMode("ENTRADA");
    setAdjustAmount("1");
  };

  const computeFinalStock = () => {
    if (!adjustItem) return 0;
    const val = Math.max(0, Number(adjustAmount) || 0);
    if (adjustMode === "ENTRADA") return adjustItem.stock_current + val;
    if (adjustMode === "SALIDA")
      return Math.max(0, adjustItem.stock_current - val);
    return val;
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    setSavingAdjust(true);
    const finalStock = computeFinalStock();
    try {
      const r = adjustItem.raw || {};
      const res = await fetch(`/v1/products/${adjustItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: adjustItem.sku,
          barcode: adjustItem.barcode || "",
          name: adjustItem.name,
          description: r.description || "",
          category_id: r.category_id,
          brand_id: r.brand_id,
          presentation: adjustItem.presentation,
          purchase_price: Number(r.purchase_price || adjustItem.sale_price * 0.72),
          sale_price: adjustItem.sale_price,
          stock_current: finalStock,
          stock_min: adjustItem.stock_min,
          image_url: r.image_url || "/media/line-synthetic.png",
          technical_specs: r.technical_specs || {},
        }),
      });
      if (res.ok) {
        setAdjustItem(null);
        loadInventory();
      }
    } finally {
      setSavingAdjust(false);
    }
  };

  const totalUnits = products.reduce((acc, p) => acc + p.stock_current, 0);
  const totalValuation = products.reduce(
    (acc, p) => acc + p.stock_current * p.sale_price,
    0
  );
  const lowStockItems = products.filter(
    (p) => p.stock_current <= p.stock_min
  );

  const filtered = products.filter((p) => {
    if (filterType === "LOW_STOCK" && p.stock_current > p.stock_min)
      return false;
    if (filterType === "OPTIMAL" && p.stock_current <= p.stock_min)
      return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <ErpLayout
      categoryTitle="Catálogo y Kardex"
      title="Control de Stock y Kardex"
      actionButton={{
        label: "Ajustar stock",
        onClick: () => {
          if (products.length > 0) openAdjustModal(products[0]);
        },
      }}
    >
      {/* 1. FILA DE MÉTRICAS KHIPU */}
      <FilaMetricas columnas={3}>
        <Metrica
          etiqueta="Valorización de almacén"
          icono={PackageCheck}
          tono="acento"
          destacada
          ayuda="Valor proyectado de venta en taller Huancayo"
        >
          S/{" "}
          {totalValuation.toLocaleString("es-PE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Metrica>

        <Metrica
          etiqueta="Unidades físicas totales"
          icono={Boxes}
          tono="ok"
          sufijo="envases"
          ayuda={
            <AyudaMetrica tono="ok">
              Sincronizadas con escáner de inventario móvil
            </AyudaMetrica>
          }
        >
          {totalUnits}
        </Metrica>

        <Metrica
          etiqueta="Puntos de reorden críticos"
          icono={AlertTriangle}
          tono={lowStockItems.length > 0 ? "aviso" : "ok"}
          sufijo="SKUs"
          ayuda={
            <AyudaMetrica tono={lowStockItems.length > 0 ? "aviso" : "ok"}>
              Stock menor o igual al punto mínimo
            </AyudaMetrica>
          }
        >
          {lowStockItems.length}
        </Metrica>
      </FilaMetricas>

      {/* 2. BARRA DE FILTROS KHIPU */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentadoControl<"ALL" | "LOW_STOCK" | "OPTIMAL">
            valor={filterType}
            onChange={setFilterType}
            opciones={[
              { valor: "ALL", etiqueta: "Todos", contador: products.length },
              {
                valor: "LOW_STOCK",
                etiqueta: "Bajo stock",
                contador: lowStockItems.length,
              },
              {
                valor: "OPTIMAL",
                etiqueta: "Stock óptimo",
                contador: products.length - lowStockItems.length,
              },
            ]}
          />

          <BuscadorKhipu
            valor={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar SKU, marca o producto…"
          />
        </div>

        <button
          type="button"
          onClick={loadInventory}
          className={ACCION_SECUNDARIA}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refrescar Kardex</span>
        </button>
      </div>

      {/* 3. TABLA EN BANDA REDONDEADA KHIPU */}
      <div className={CONTENEDOR_TABLA}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Producto y Marca</TableHead>
              <TableHead>Presentación</TableHead>
              <TableHead className="text-right">Stock Actual</TableHead>
              <TableHead className="text-right">Stock Mínimo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Valorizado</TableHead>
              <TableHead className="text-right">Kardex</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <FilaVacia columnas={8}>
                Consultando existencias de almacén en tiempo real…
              </FilaVacia>
            ) : filtered.length === 0 ? (
              <FilaVacia columnas={8}>
                No hay artículos con los filtros seleccionados.
              </FilaVacia>
            ) : (
              filtered.map((item) => {
                const isLow = item.stock_current <= item.stock_min;
                const val = item.stock_current * item.sale_price;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <ChipCodigo>{item.sku}</ChipCodigo>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {item.name}
                      </div>
                      <span className="text-etiqueta text-muted-foreground">
                        {item.brand_name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.presentation}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground tabular-nums">
                      {item.stock_current} unid.
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {item.stock_min} unid.
                    </TableCell>
                    <TableCell>
                      <PillEstado tono={isLow ? "aviso" : "ok"}>
                        {isLow ? "Reponer" : "Disponible"}
                      </PillEstado>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground tabular-nums">
                      S/ {val.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => openAdjustModal(item)}
                        className={cn(ACCION_SECUNDARIA, "h-7 px-2.5 text-etiqueta")}
                      >
                        <SlidersHorizontal className="h-3 w-3" />
                        <span>Ajustar</span>
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <PieTablaSimple
          mostrando={filtered.length}
          total={products.length}
          unidad="artículos en Kardex"
          nota="Sincronizado en tiempo real con PostgreSQL y App Móvil"
        />
      </div>

      {/* Modal de Ajuste de Kardex (Entrada / Salida / Fijar) */}
      {adjustItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={cn(TARJETA, "w-full max-w-md bg-popover p-5 shadow-2xl")}>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-titulo text-foreground">
                  Ajuste de Kardex
                </h3>
                <p className="text-etiqueta text-muted-foreground">
                  {adjustItem.name} · <span className="font-mono">{adjustItem.sku}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustItem(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="mt-4 space-y-4">
              <div>
                <span className={ETIQUETA_CAMPO}>Tipo de movimiento</span>
                <SegmentadoControl<"ENTRADA" | "SALIDA" | "FIJAR">
                  valor={adjustMode}
                  onChange={setAdjustMode}
                  className="w-full justify-between"
                  opciones={[
                    { valor: "ENTRADA", etiqueta: "Entrada (+)" },
                    { valor: "SALIDA", etiqueta: "Salida (-)" },
                    { valor: "FIJAR", etiqueta: "Fijar stock (=)" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={ETIQUETA_CAMPO}>
                    {adjustMode === "FIJAR"
                      ? "Nuevo stock total"
                      : "Cantidad de unidades"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className={cn(CAMPO, "font-mono font-semibold tabular-nums")}
                  />
                </div>

                <div className="rounded-lg bg-secondary p-2.5 flex flex-col justify-center">
                  <span className="text-etiqueta text-muted-foreground">
                    Stock resultante
                  </span>
                  <span className="text-titulo font-bold text-foreground tabular-nums">
                    {adjustItem.stock_current} → {computeFinalStock()} unid.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className={ACCION_SECUNDARIA}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingAdjust}
                  className={ACCION_PRINCIPAL}
                >
                  {savingAdjust ? "Guardando…" : "Aplicar en PostgreSQL"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </ErpLayout>
  );
}
