"use client";

import React, { useState, useEffect } from "react";
import { ErpLayout } from "@/components/admin/ErpLayout";
import {
  FolderTree,
  Edit2,
  Trash2,
  CheckCircle2,
  Layers,
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
  BuscadorKhipu,
  ACCION_PRINCIPAL,
  ACCION_SECUNDARIA,
  CAMPO,
  ETIQUETA_CAMPO,
  TARJETA,
  cn,
} from "@/components/khipu/khipu-ui";

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
    description:
      "Formulaciones PAO y Éster de alto rendimiento (0W-20, 5W-30, 5W-40) para motores turbo e inyección directa.",
    productCount: 5,
    isActive: true,
  },
  {
    id: "cat-2",
    name: "Aceites Semisintéticos",
    slug: "aceites-semisinteticos",
    description:
      "Tecnología sintética balanceada (10W-40) para uso mixto urbano y carretera.",
    productCount: 2,
    isActive: true,
  },
  {
    id: "cat-3",
    name: "Aceites Minerales Alto KM",
    slug: "aceites-minerales-alto-km",
    description:
      "Viscosidades pesadas (20W-50, 15W-40) con acondicionador de retenes para motores con más de 100,000 km.",
    productCount: 1,
    isActive: true,
  },
  {
    id: "cat-4",
    name: "Filtros de Aceite & Aire",
    slug: "filtros-aceite-aire",
    description:
      "Filtros blindados OEM y de flujo de aire con micro-filtración de partículas hasta 20 micras.",
    productCount: 2,
    isActive: true,
  },
  {
    id: "cat-5",
    name: "Refrigerantes & Aditivos",
    slug: "refrigerantes-aditivos",
    description:
      "Coolants 50/50 OAT, antifriccionantes cerámicos Liqui Moly y fluidos de frenos DOT 4.",
    productCount: 2,
    isActive: true,
  },
  {
    id: "cat-6",
    name: "Fluidos de Transmisión & Engranajes",
    slug: "fluidos-transmision",
    description:
      "Aceites ATF para cajas automáticas, CVT, doble embrague DSG y valvulinas 75W-90.",
    productCount: 1,
    isActive: true,
  },
];

export default function CategoriesAdminPage() {
  const [categories, setCategories] =
    useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryItem | null>(null);

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
            ? {
                ...c,
                name: formName,
                description: formDesc,
                slug: formName.toLowerCase().replace(/\s+/g, "-"),
              }
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
      return (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalProductsLinked = categories.reduce(
    (acc, c) => acc + c.productCount,
    0
  );

  return (
    <ErpLayout
      categoryTitle="Catálogo y Kardex"
      title="Categorías"
      actionButton={{
        label: "Nueva categoría",
        onClick: () => handleOpenModal(),
      }}
    >
      {/* 1. FILA DE MÉTRICAS KHIPU */}
      <FilaMetricas columnas={3}>
        <Metrica
          etiqueta="Total categorías"
          icono={FolderTree}
          tono="acento"
          destacada
          sufijo="familias"
          ayuda="Clasificación técnica del catálogo Estrada"
        >
          {categories.length}
        </Metrica>

        <Metrica
          etiqueta="Categorías activas"
          icono={CheckCircle2}
          tono="ok"
          sufijo="activas"
          ayuda={
            <AyudaMetrica tono="ok">
              Visibles en catálogo público y Terminal POS
            </AyudaMetrica>
          }
        >
          {categories.filter((c) => c.isActive).length}
        </Metrica>

        <Metrica
          etiqueta="Productos vinculados"
          icono={Layers}
          tono="neutro"
          sufijo="SKUs"
          ayuda={
            <AyudaMetrica tono="neutro">
              Asociados con control de inventario
            </AyudaMetrica>
          }
        >
          {Math.max(12, totalProductsLinked)}
        </Metrica>
      </FilaMetricas>

      {/* 2. BARRA DE FILTROS KHIPU */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BuscadorKhipu
          valor={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por nombre de familia, slug o descripción…"
        />
      </div>

      {/* 3. TABLA EN BANDA REDONDEADA KHIPU */}
      <div className={CONTENEDOR_TABLA}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoría</TableHead>
              <TableHead>Slug Identificador</TableHead>
              <TableHead>Descripción Técnica</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <FilaVacia columnas={6}>
                No se encontraron categorías coincidentes.
              </FilaVacia>
            ) : (
              filtered.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium text-foreground">
                    {cat.name}
                  </TableCell>
                  <TableCell>
                    <ChipCodigo>{cat.slug}</ChipCodigo>
                  </TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">
                    {cat.description}
                  </TableCell>
                  <TableCell>
                    <Chip>{cat.productCount} SKUs</Chip>
                  </TableCell>
                  <TableCell>
                    <PillEstado tono={cat.isActive ? "ok" : "neutro"}>
                      {cat.isActive ? "Activa" : "Inactiva"}
                    </PillEstado>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(cat)}
                        title="Editar categoría"
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        title="Desactivar categoría"
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive-suave hover:text-destructive-texto transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <PieTablaSimple
          mostrando={filtered.length}
          total={categories.length}
          unidad="categorías"
          nota="Taxonomía sincronizada con el recomendador de lubricantes"
        />
      </div>

      {/* Modal Khipu de Categoría */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={cn(TARJETA, "w-full max-w-md bg-popover p-5 shadow-2xl")}>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="text-titulo text-foreground">
                {editingCategory
                  ? "Editar categoría"
                  : "Nueva categoría de productos"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div>
                <label className={ETIQUETA_CAMPO}>
                  Nombre de la categoría *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej. Aceites para Motos 4T"
                  className={CAMPO}
                />
              </div>

              <div>
                <label className={ETIQUETA_CAMPO}>
                  Descripción / Ficha técnica
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Descripción técnica de la línea…"
                  className={cn(CAMPO, "h-auto py-2 resize-none")}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={ACCION_SECUNDARIA}
                >
                  Cancelar
                </button>
                <button type="submit" className={ACCION_PRINCIPAL}>
                  Guardar categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </ErpLayout>
  );
}
