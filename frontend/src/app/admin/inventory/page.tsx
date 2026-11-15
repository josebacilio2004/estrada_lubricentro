"use client";

import React, { useState, useEffect } from "react";
import { ErpLayout } from "@/components/admin/ErpLayout";
import {
  Boxes,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  PackageCheck,
  TrendingDown,
  Layers,
  RefreshCw,
} from "lucide-react";

interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  brand_name: string;
  presentation: string;
  stock_current: number;
  stock_min: number;
  sale_price: number;
  category_name: string;
}

export default function InventoryAdminPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "LOW_STOCK" | "OPTIMAL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const loadInventory = () => {
    setLoading(true);
    const apiUrl = typeof window !== "undefined" ? "/v1" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1");
    fetch(`${apiUrl}/products`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          const mapped = d.data.map((item: any) => ({
            id: item.id,
            sku: item.sku,
            name: item.name,
            brand_name: item.brand_name,
            presentation: item.presentation,
            stock_current: Number(item.stock_current) || 0,
            stock_min: 5,
            sale_price: Number(item.sale_price) || 0,
            category_name: item.category_name,
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

  const totalUnits = products.reduce((acc, p) => acc + p.stock_current, 0);
  const totalValuation = products.reduce((acc, p) => acc + p.stock_current * p.sale_price, 0);
  const lowStockItems = products.filter((p) => p.stock_current <= p.stock_min);

  const filtered = products.filter((p) => {
    if (filterType === "LOW_STOCK" && p.stock_current > p.stock_min) return false;
    if (filterType === "OPTIMAL" && p.stock_current <= p.stock_min) return false;
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
      categoryTitle="Gestión & Inventario"
      title="Control de Stock & Kardex"
      actionButton={{
        label: "Ajustar Stock",
        onClick: () => alert("Módulo de ingreso de orden de compra y ajuste Kardex"),
      }}
    >
      <div className="space-y-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#151820] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-gray-400">Valorización de Almacén</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                S/ {totalValuation.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Precio valor venta proyectado</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <PackageCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#151820] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-gray-400">Unidades Físicas Totales</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {totalUnits} unidades
              </div>
              <div className="text-[11px] text-gray-400 mt-1">En taller Huancayo</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.04] text-white">
              <Boxes className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#151820] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-gray-400">Puntos de Reorden Críticos</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {lowStockItems.length} SKUs
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Stock menor o igual al mínimo</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3 rounded-2xl bg-[#151820] border border-white/[0.06]">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar SKU o nombre de producto..."
              className="w-full bg-[#1b1f28] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                filterType === "ALL"
                  ? "bg-white text-black font-bold"
                  : "bg-[#1b1f28] text-gray-400 hover:text-white border border-white/10"
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("LOW_STOCK")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                filterType === "LOW_STOCK"
                  ? "bg-amber-500 text-black font-bold"
                  : "bg-[#1b1f28] text-amber-400 hover:bg-amber-500/10 border border-white/10"
              }`}
            >
              Bajo Stock ({lowStockItems.length})
            </button>
            <button
              type="button"
              onClick={loadInventory}
              className="p-2 rounded-xl bg-[#1b1f28] text-gray-400 hover:text-white border border-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="rounded-2xl bg-[#151820] border border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-400 bg-white/[0.01]">
                  <th className="py-3.5 px-4 uppercase font-semibold">SKU</th>
                  <th className="py-3.5 px-4 uppercase font-semibold">Producto</th>
                  <th className="py-3.5 px-4 uppercase font-semibold">Presentación</th>
                  <th className="py-3.5 px-4 uppercase font-semibold">Stock Actual</th>
                  <th className="py-3.5 px-4 uppercase font-semibold">Stock Mínimo</th>
                  <th className="py-3.5 px-4 uppercase font-semibold">Estado</th>
                  <th className="py-3.5 px-4 uppercase font-semibold text-right">Valorizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      Cargando existencias de inventario...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No hay artículos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const isLow = item.stock_current <= item.stock_min;
                    const val = item.stock_current * item.sale_price;

                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-300">{item.sku}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-sans font-medium text-white">{item.name}</div>
                          <span className="text-[10px] text-gray-400">{item.brand_name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-300">{item.presentation}</td>
                        <td className="py-3.5 px-4 font-bold text-white text-sm">
                          {item.stock_current} unid.
                        </td>
                        <td className="py-3.5 px-4 text-gray-400">{item.stock_min} unid.</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              isLow
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isLow ? "bg-amber-400" : "bg-emerald-400"}`} />
                            <span>{isLow ? "REPONER" : "DISPONIBLE"}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-white">
                          S/ {val.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ErpLayout>
  );
}