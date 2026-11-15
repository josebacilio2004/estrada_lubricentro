"use client";

import React, { useState, useEffect } from "react";
import { ErpLayout } from "@/components/admin/ErpLayout";
import { FolderTree, Plus, Edit2, Trash2, CheckCircle2, Search, RefreshCw, Layers } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  isActive: boolean;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    name: "Aceites 100% Sintéticos",
    slug: "aceites-100-sinteticos",
    description: "Formulaciones PAO y Éster de alto rendimiento (0W-20, 5W-30, 5W-40) para motores turbo e inyección directa.",
    productCount: 5,
    isActive: true,
  },
  {
    id: "cat-2",
    name: "Aceites Semisintéticos",
    slug: "aceites-semisinteticos",
    description: "Tecnología sintética balanceada (10W-40) para uso mixto urbano y carretera.",
    productCount: 2,
    isActive: true,
  },
  {
    id: "cat-3",
    name: "Aceites Minerales Alto KM",
    slug: "aceites-minerales-alto-km",
    description: "Viscosidades pesadas (20W-50, 15W-40) con acondicionador de retenes para motores con más de 100,000 km.",
    productCount: 1,
    isActive: true,
  },
  {
    id: "cat-4",
    name: "Filtros de Aceite & Aire",
    slug: "filtros-aceite-aire",
    description: "Filtros blindados OEM y de flujo de aire con micro-filtración de partículas hasta 20 micras.",
    productCount: 2,
    isActive: true,
  },
  {
    id: "cat-5",
    name: "Refrigerantes & Aditivos",
    slug: "refrigerantes-aditivos",
    description: "Coolants 50/50 OAT, antifriccionantes cerámicos Liqui Moly y fluidos de frenos DOT 4.",
    productCount: 2,
    isActive: true,
  },
  {
    id: "cat-6",
    name: "Fluidos de Transmisión & Engranajes",
    slug: "fluidos-transmision",
    description: "Aceites ATF para cajas automáticas, CVT, doble embrague DSG y valvulinas 75W-90.",
    productCount: 1,
    isActive: true,
  },
];

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const loadCategories = () => {
    fetch("/v1/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          const mapped = data.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: `Categoría de lubricación técnica homologada (${c.slug})`,
            productCount: Number(c.product_count || 0),
            isActive: c.is_active,
          }));
          setCategories(mapped);
        }
      })
      .catch((e) => console.warn("Fallback categories", e));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenModal = (cat?: CategoryItem) => {
    if (cat) {
      setEditingCategory(cat);
      setFormName(cat.name);
      setFormDesc(cat.description);
    } else {
      setEditingCategory(null);
      setFormName("");
      setFormDesc("");
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: formName, description: formDesc, slug: formName.toLowerCase().replace(/\s+/g, "-") }
            : c
        )
      );
    } else {
      const newCat: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: formName,
        slug: formName.toLowerCase().replace(/\s+/g, "-"),
        description: formDesc,
        productCount: 0,
        isActive: true,
      };
      setCategories((prev) => [...prev, newCat]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Desea desactivar la categoría "${name}"?`)) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const filtered = categories.filter((c) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <ErpLayout
      categoryTitle="Gestión & Inventario"
      title="Categorías de Productos"
      actionButton={{
        label: "Nueva Categoría",
        onClick: () => handleOpenModal(),
      }}
    >
      <div className="space-y-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#151820] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-gray-400">Total Categorías</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {categories.length} familias
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Configuradas en el sistema</div>
            </div>
            <div className="p-3 rounded-xl bg-ember-500/10 text-ember-400">
              <FolderTree className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#151820] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-gray-400">Categorías Activas</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {categories.filter((c) => c.isActive).length} activas
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Visibles en catálogo público y POS</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#151820] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-gray-400">Productos Vinculados</div>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                13 productos
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Con inventario activo</div>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Layers className="w-6 h-6" />
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
              placeholder="Buscar categoría..."
              className="w-full bg-[#1b1f28] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white/30"
            />
          </div>

          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold font-sans hover:bg-gray-150 transition-colors"
          >
            + Crear Categoría
          </button>
        </div>

        {/* Categories Table */}
        <div className="rounded-2xl bg-[#151820] border border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-400 bg-white/[0.01]">
                  <th className="py-3.5 px-4 uppercase font-semibold">Categoría</th>
                  <th className="py-3.5 px-4 uppercase font-semibold">Slug Identificador</th>
                  <th className="py-3.5 px-4 uppercase font-semibold">Descripción Técnica</th>
                  <th className="py-3.5 px-4 uppercase font-semibold">Productos</th>
                  <th className="py-3.5 px-4 uppercase font-semibold">Estado</th>
                  <th className="py-3.5 px-4 uppercase font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-bold text-white text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-ember-500" />
                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-400">{cat.slug}</td>
                    <td className="py-4 px-4 text-gray-300 font-sans max-w-md">
                      {cat.description}
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-gray-300">
                        {cat.productCount} SKUs
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Activa
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(cat)}
                          title="Editar categoría"
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-gray-300 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          title="Desactivar categoría"
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/10 text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal Crear / Editar Categoría */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#14171f] border border-white/10 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingCategory ? "Editar Categoría" : "Nueva Categoría de Productos"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-gray-400 mb-1">Nombre de la Categoría *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Aceites para Motos 4T"
                  className="w-full bg-[#101217] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-ember-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Descripción / Ficha Técnica</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Descripción de la línea de lubricantes..."
                  className="w-full bg-[#101217] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-ember-500 focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white text-black font-bold font-sans hover:bg-gray-200"
                >
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpLayout>
  );
}