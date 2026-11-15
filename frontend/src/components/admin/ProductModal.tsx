"use client";

import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Sparkles } from "lucide-react";

export interface ProductFormData {
  id?: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  category_id: string;
  brand_id: string;
  presentation: string;
  purchase_price: number;
  sale_price: number;
  stock_current: number;
  stock_min: number;
  viscosity: string;
  oil_type: string;
  api_norm: string;
  lifespan_km: number;
  image_url: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductFormData | null;
  onSaved: () => void;
}

export function ProductModal({ isOpen, onClose, product, onSaved }: ProductModalProps) {
  const isEditing = !!product?.id;

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    sku: "",
    barcode: "",
    name: "",
    description: "",
    category_id: "",
    brand_id: "",
    presentation: "1 Galón (3.78L)",
    purchase_price: 120,
    sale_price: 165,
    stock_current: 20,
    stock_min: 5,
    viscosity: "5W-30",
    oil_type: "Full Sintético",
    api_norm: "API SP / ILSAC GF-6",
    lifespan_km: 10000,
    image_url: "",
  });

  useEffect(() => {
    // Cargar categorías y marcas
    const apiUrl = typeof window !== "undefined" ? "/v1" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1");
    fetch(`${apiUrl}/categories`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) setCategories(d.data);
      })
      .catch(() => {});

    fetch(`${apiUrl}/brands`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) setBrands(d.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        sku: `EST-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: `770${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        name: "",
        description: "",
        category_id: categories[0]?.id || "",
        brand_id: brands[0]?.id || "",
        presentation: "1 Galón (3.78L)",
        purchase_price: 120,
        sale_price: 165,
        stock_current: 20,
        stock_min: 5,
        viscosity: "5W-30",
        oil_type: "Full Sintético",
        api_norm: "API SP / ILSAC GF-6",
        lifespan_km: 10000,
        image_url: "",
      });
    }
    setError(null);
  }, [product, isOpen, categories, brands]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const apiUrl = typeof window !== "undefined" ? "/v1" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1");
    const payload = {
      sku: formData.sku,
      barcode: formData.barcode,
      name: formData.name,
      description: formData.description,
      category_id: formData.category_id,
      brand_id: formData.brand_id,
      presentation: formData.presentation,
      purchase_price: Number(formData.purchase_price),
      sale_price: Number(formData.sale_price),
      stock_current: Number(formData.stock_current),
      stock_min: Number(formData.stock_min),
      image_url: formData.image_url,
      technical_specs: {
        viscosity: formData.viscosity,
        oil_type: formData.oil_type,
        api_norm: formData.api_norm,
        lifespan_km: Number(formData.lifespan_km),
      },
    };

    try {
      const url = isEditing ? `${apiUrl}/products/${product?.id}` : `${apiUrl}/products`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Error al procesar producto");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-ink-950 border border-white/15 p-6 sm:p-8 text-text-hi shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-text-lo hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-ember-500 font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>GESTIÓN DE CATÁLOGO // BACKOFFICE</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white uppercase">
            {isEditing ? "Editar Producto Automotriz" : "Registrar Nuevo Producto"}
          </h2>
          <p className="text-xs text-text-lo">
            Control de SKU, especificaciones de laboratorio, precios de lista y niveles de stock de almacén.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fila 1: Datos Básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-text-dim mb-1">Código SKU *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full bg-ink-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-ember-500 focus:outline-none"
                placeholder="MOB-5W30-GLN"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-text-dim mb-1">Código de Barras</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full bg-ink-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-ember-500 focus:outline-none"
                placeholder="770123456789"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-text-dim mb-1">Presentación *</label>
              <input
                type="text"
                required
                value={formData.presentation}
                onChange={(e) => setFormData({ ...formData, presentation: e.target.value })}
                className="w-full bg-ink-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-ember-500 focus:outline-none"
                placeholder="1 Galón (3.78L), 1 Cuarto..."
              />
            </div>
          </div>

          {/* Fila 2: Nombre Completo */}
          <div>
            <label className="block text-xs font-mono text-text-dim mb-1">Nombre Comercial del Producto *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-ink-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-ember-500 focus:outline-none"
              placeholder="Ej. Mobil 1 Advanced Full Synthetic 5W-30"
            />
          </div>

          {/* Fila 3: Categoría y Marca */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-text-dim mb-1">Categoría *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-ink-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-ember-500 focus:outline-none"
              >
                <option value="">Seleccione Categoría...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-text-dim mb-1">Marca Fabricante *</label>
              <select
                required
                value={formData.brand_id}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                className="w-full bg-ink-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-ember-500 focus:outline-none"
              >
                <option value="">Seleccione Marca...</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 4: Precios y Stock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <div>
              <label className="block text-[11px] font-mono text-text-dim mb-1">Precio Compra (S/)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
                className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-ember-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-text-dim mb-1">Precio Venta (S/) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })}
                className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-ember-400 focus:border-ember-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-text-dim mb-1">Stock Actual</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.stock_current}
                onChange={(e) => setFormData({ ...formData, stock_current: parseFloat(e.target.value) || 0 })}
                className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-ember-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-text-dim mb-1">Stock Mínimo</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.stock_min}
                onChange={(e) => setFormData({ ...formData, stock_min: parseFloat(e.target.value) || 0 })}
                className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-ember-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Fila 5: Especificaciones Técnicas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-text-dim mb-1">Viscosidad</label>
              <input
                type="text"
                value={formData.viscosity}
                onChange={(e) => setFormData({ ...formData, viscosity: e.target.value })}
                className="w-full bg-ink-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-ember-500 focus:outline-none"
                placeholder="5W-30 / 10W-40"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-text-dim mb-1">Tipo de Base</label>
              <input
                type="text"
                value={formData.oil_type}
                onChange={(e) => setFormData({ ...formData, oil_type: e.target.value })}
                className="w-full bg-ink-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-ember-500 focus:outline-none"
                placeholder="100% Sintético, etc."
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-text-dim mb-1">Norma Homologada</label>
              <input
                type="text"
                value={formData.api_norm}
                onChange={(e) => setFormData({ ...formData, api_norm: e.target.value })}
                className="w-full bg-ink-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-ember-500 focus:outline-none"
                placeholder="API SP / ACEA C3"
              />
            </div>
              <div>
                <label className="block text-[11px] font-mono text-text-dim mb-1">Vida Útil (km)</label>
                <input
                  type="number"
                  step="500"
                  value={formData.lifespan_km}
                  onChange={(e) => setFormData({ ...formData, lifespan_km: parseInt(e.target.value) || 5000 })}
                  className="w-full bg-ink-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-ember-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Fila 6: Imagen del Producto (Enlace URL o Subir Archivo a PostgreSQL) */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono text-text-dim">
                  Imagen del Producto (Enlace URL o Subir Archivo a Base de Datos)
                </label>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ember-500/15 hover:bg-ember-500/25 border border-ember-500/30 text-ember-400 text-[11px] font-mono font-semibold transition-all">
                  <span>Subir Foto / Archivo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        setLoading(true);
                        const apiUrl = typeof window !== "undefined" ? "/v1" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1");
                        const fd = new FormData();
                        fd.append("file", file);
                        const res = await fetch(`${apiUrl}/media/upload`, {
                          method: "POST",
                          body: fd,
                        });
                        const data = await res.json();
                        if (data.success && data.data?.url) {
                          setFormData((prev) => ({ ...prev, image_url: data.data.url }));
                        } else {
                          setError(data.error?.message || "No se pudo subir la imagen");
                        }
                      } catch {
                        setError("Error al subir archivo de imagen al servidor");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full bg-ink-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-ember-500 focus:outline-none"
                    placeholder="https://ejemplo.com/aceite.png o /media/line-synthetic.png"
                  />
                  <p className="text-[11px] text-text-lo mt-1.5">
                    Pegue un enlace directo de imagen (https://...) o suba una fotografía que se guardará en PostgreSQL.
                  </p>
                </div>
                {formData.image_url && (
                  <div className="w-16 h-16 rounded-xl bg-ink-900 border border-white/15 overflow-hidden flex items-center justify-center flex-shrink-0">
                    <img
                      src={formData.image_url}
                      alt="Vista previa"
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/media/line-synthetic.png";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Botones de Acción */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-ember-500 hover:bg-ember-600 text-xs font-semibold text-white shadow-lg shadow-ember-500/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Guardando..." : isEditing ? "Actualizar Producto" : "Guardar Producto"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
