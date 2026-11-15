"use client";

import React, { useState, useEffect } from "react";
import { ErpLayout } from "@/components/admin/ErpLayout";
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle, RefreshCw, Layers } from "lucide-react";
import { ProductModal, ProductFormData } from "@/components/admin/ProductModal";

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
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const apiUrl = typeof window !== "undefined" ? "/v1" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1");
      const res = await fetch(`${apiUrl}/products?q=${encodeURIComponent(search)}`);
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
      purchase_price: Number(p.purchase_price || Math.round(Number(p.sale_price) * 0.72)),
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
    if (!confirm(`¿Está seguro de desactivar el producto "${name}" del catálogo?`)) return;

    try {
      const apiUrl = typeof window !== "undefined" ? "/v1" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1");
      await fetch(`${apiUrl}/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (e) {
      alert("Error al desactivar producto");
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === "TODOS") return true;
    return p.category_name?.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const lowStockCount = products.filter((p) => Number(p.stock_current) <= 5).length;

  return (
    <ErpLayout
      categoryTitle="Gestión & Inventario"
      title="Productos"
      actionButton={{
        label: "Nuevo Producto",
        onClick: () => {
          setEditingProduct(null);
          setIsModalOpen(true);
        },
      }}
    >
      <div className="space-y-6">
        
        {/* Metric Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#151820] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-gray-400">Total en Catálogo</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {products.length} SKUs
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.04] text-white">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#151820] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-gray-400">Alertas de Stock Bajo</span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {lowStockCount} items
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#151820] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-gray-400">Marcas Registradas</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                Mobil, Castrol, Motul...
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3 rounded-2xl bg-[#151820] border border-white/[0.06]">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, SKU, marca o descripción..."
              className="w-full bg-[#1b1f28] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
            {["TODOS", "Sintéticos", "Semisintéticos", "Minerales", "Filtros", "Refrigerantes"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-mono transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-white text-black font-bold shadow-sm"
                    : "bg-[#1b1f28] text-gray-400 hover:text-white border border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}

            <button
              type="button"
              onClick={fetchProducts}
              title="Refrescar catálogo"
              className="p-2 rounded-xl bg-[#1b1f28] text-gray-400 hover:text-white border border-white/10 ml-1"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-2xl bg-[#151820] border border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-400 bg-white/[0.01]">
                  <th className="py-3.5 px-4 font-semibold uppercase">SKU / Código</th>
                  <th className="py-3.5 px-4 font-semibold uppercase">Producto / Marca</th>
                  <th className="py-3.5 px-4 font-semibold uppercase">Presentación</th>
                  <th className="py-3.5 px-4 font-semibold uppercase">Categoría</th>
                  <th className="py-3.5 px-4 font-semibold uppercase">Stock Actual</th>
                  <th className="py-3.5 px-4 font-semibold uppercase">Precio Venta</th>
                  <th className="py-3.5 px-4 font-semibold uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      Cargando catálogo en tiempo real...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No se encontraron productos coincidentes.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isLow = Number(p.stock_current) <= 5;

                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 font-bold text-gray-300">
                          <div>{p.sku}</div>
                          {p.barcode && (
                            <span className="text-[10px] text-gray-400 block">{p.barcode}</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#1b1f28] border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                              <img
                                src={p.image_url || "/media/line-synthetic.png"}
                                alt={p.name}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "/media/line-synthetic.png";
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-sans font-medium text-white text-sm">{p.name}</div>
                              <span className="text-[11px] text-gray-400">{p.brand_name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {p.presentation}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-gray-300 text-[10px]">
                            {p.category_name}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1 ${
                              isLow
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {p.stock_current} unid.
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-white text-sm">
                          S/ {Number(p.sale_price).toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(p)}
                              title="Editar producto"
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-gray-300 hover:text-white transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(p.id, p.name)}
                              title="Desactivar producto"
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/10 text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* Modal Crear / Editar */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSaved={fetchProducts}
      />
    </ErpLayout>
  );
}