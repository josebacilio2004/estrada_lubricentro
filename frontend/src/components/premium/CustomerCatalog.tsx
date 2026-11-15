"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Sparkles, MessageSquare, Check, ShieldCheck, Flame, Droplets, ArrowRight, X, Eye, Gauge, CheckCircle } from "lucide-react";

interface Product {
  id: string;
  sku: string;
  name: string;
  presentation: string;
  sale_price: string | number;
  stock_current: string | number;
  brand_name: string;
  category_name: string;
  technical_specs?: {
    viscosity?: string;
    oil_type?: string;
    api_norm?: string;
    lifespan_km?: number;
  };
}

export function CustomerCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Relative URL ensures it works on localhost, cloudflare tunnels, and mobile without Failed to fetch!
    fetch(`/v1/products?q=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setProducts(data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching catalog:", err);
      })
      .finally(() => setLoading(false));
  }, [search]);

  const categories = [
    { id: "TODOS", label: "Todos los Productos" },
    { id: "Sintéticos", label: "100% Sintéticos" },
    { id: "Semisintéticos", label: "Semisintéticos" },
    { id: "Minerales", label: "Minerales Alto KM" },
    { id: "Filtros", label: "Filtros OEM" },
    { id: "Refrigerantes", label: "Aditivos & Fluidos" },
  ];

  const filtered = products.filter((p) => {
    if (selectedCategory === "TODOS") return true;
    return p.category_name?.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const getProductImage = (prod: Product) => {
    const cat = (prod.category_name || "").toLowerCase();
    const name = (prod.name || "").toLowerCase();
    if (cat.includes("sintétic") || name.includes("0w-") || name.includes("5w-30") || name.includes("sint")) {
      return "/media/line-synthetic.png";
    }
    if (cat.includes("semi") || name.includes("10w-40")) {
      return "/media/line-semi.png";
    }
    if (cat.includes("mineral") || name.includes("20w-50")) {
      return "/media/line-mineral.png";
    }
    return "/media/tech-engine.png";
  };

  return (
    <section id="catalogo" className="scroll-mt-20 relative w-full py-24 bg-ink-950 border-t border-white/[0.08] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute right-10 top-1/3 w-[600px] h-[500px] bg-ember-500/10 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute left-10 bottom-10 w-[500px] h-[400px] bg-cyan-500/5 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-ember-400 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CATÁLOGO AUTOMOTRIZ • DISPONIBILIDAD INMEDIATA EN TALLER</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-white uppercase">
              LUBRICACIÓN DE ALTA GAMA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ember-400 via-ember-500 to-amber-500">
                PARA CADA MOTOR
              </span>
            </h2>
            <p className="text-text-lo text-sm sm:text-base max-w-2xl font-light leading-relaxed">
              Consulta las fórmulas homologadas de Mobil 1, Castrol, Motul, Liqui Moly, Shell y filtros blindados Mann/Bosch. Haz clic en cualquier producto para inspeccionar su ficha técnica detallada.
            </p>
          </div>

          {/* Search bar inside catalog */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="text"
              placeholder="Buscar por marca o formulación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-ink-900 border border-white/15 rounded-2xl pl-10 pr-4 py-3 text-xs font-mono text-white focus:border-ember-500 focus:outline-none shadow-lg placeholder:text-text-dim"
            />
          </div>
        </div>

        {/* Category Filters Pills */}
        <div className="flex flex-wrap items-center gap-2.5 mb-10 text-xs font-mono">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full transition-all ${
                selectedCategory === cat.id
                  ? "bg-ember-500 text-white font-semibold shadow-lg shadow-ember-500/25"
                  : "bg-white/[0.04] text-text-lo hover:text-white border border-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {loading && products.length === 0 ? (
          <div className="p-16 rounded-3xl bg-ink-900 border border-white/10 text-center text-text-dim font-mono text-xs">
            Cargando catálogo en tiempo real...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 rounded-3xl bg-ink-900 border border-white/10 text-center text-text-dim font-mono text-xs">
            No se encontraron productos en esta categoría o búsqueda.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((prod) => {
              const specs = prod.technical_specs || {};
              const imgUrl = getProductImage(prod);
              const whatsappMessage = encodeURIComponent(
                `Hola Lubricentros Estrada, deseo cotizar y consultar stock de: ${prod.name} (${prod.presentation}) - Precio S/ ${Number(prod.sale_price).toFixed(2)}.`
              );

              return (
                <div
                  key={prod.id}
                  onClick={() => setModalProduct(prod)}
                  className="rounded-3xl bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-ink-950/80 border border-white/10 p-5 flex flex-col justify-between hover:border-ember-500/50 hover:shadow-[0_20px_45px_rgba(242,106,27,0.15)] hover:-translate-y-1.5 transition-all duration-300 ease-out group backdrop-blur-md cursor-pointer relative"
                >
                  {/* Card top badge */}
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/[0.08] text-white border border-white/15">
                      {prod.brand_name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Check className="w-3 h-3" /> En Taller ({Number(prod.stock_current)} unid.)
                    </span>
                  </div>

                  {/* Product Image Frame */}
                  <div className="relative w-full h-44 my-3 flex items-center justify-center overflow-hidden rounded-2xl bg-ink-900/60 border border-white/5 group-hover:border-ember-500/30 transition-all">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(242,106,27,0.15),transparent_70%)] group-hover:scale-125 transition-transform duration-500" />
                    <Image
                      src={imgUrl}
                      alt={prod.name}
                      width={180}
                      height={140}
                      className="object-contain max-h-36 drop-shadow-2xl group-hover:scale-110 group-hover:rotate-1 transition-all duration-500"
                    />
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-ember-400 flex items-center gap-1 border border-white/10">
                      <Eye className="w-3 h-3" />
                      <span>Ver Ficha</span>
                    </div>
                  </div>

                  {/* Product Name & Presentation */}
                  <div className="space-y-1.5">
                    <h3 className="font-display font-bold text-sm text-white group-hover:text-ember-400 transition-colors line-clamp-2">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-text-lo font-mono">
                      {prod.presentation}
                    </p>

                    {/* Specs Pills */}
                    <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-mono">
                      {specs.viscosity && (
                        <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white font-semibold">
                          {specs.viscosity}
                        </span>
                      )}
                      {specs.oil_type && (
                        <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-text-lo">
                          {specs.oil_type}
                        </span>
                      )}
                      {specs.api_norm && (
                        <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-text-dim">
                          {specs.api_norm}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & CTA Button */}
                  <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-mono text-text-dim block uppercase">Precio Taller</span>
                      <span className="font-display font-extrabold text-lg text-ember-400">
                        S/ {Number(prod.sale_price).toFixed(2)}
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/51987654321?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-ember-500 hover:bg-ember-600 text-white text-xs font-semibold shadow-md shadow-ember-500/25 transition-all active:scale-95 group-hover:scale-105"
                      title="Solicitar por WhatsApp"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Cotizar</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Interactive Product Detail Frame Modal */}
      {modalProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setModalProduct(null)}
        >
          <div 
            className="relative w-full max-w-2xl rounded-3xl bg-ink-950 border border-white/20 shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal ambient light */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-ember-500/15 blur-[120px] pointer-events-none rounded-full" />
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4 flex-shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-ember-500/20 text-ember-400 border border-ember-500/30">
                    {modalProduct.brand_name}
                  </span>
                  <span className="text-xs font-mono text-text-dim">
                    SKU: {modalProduct.sku}
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                  {modalProduct.name}
                </h3>
                <p className="text-xs font-mono text-text-lo">
                  Categoría: {modalProduct.category_name} • Presentación: {modalProduct.presentation}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalProduct(null)}
                aria-label="Cerrar ficha de producto"
                className="p-2 rounded-xl text-text-dim hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto pr-2 space-y-6 flex-1 text-xs">
              
              {/* Product Visual Showcase Frame */}
              <div className="relative w-full h-52 rounded-2xl bg-ink-900 border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(242,106,27,0.2),transparent_70%)]" />
                <Image
                  src={getProductImage(modalProduct)}
                  alt={modalProduct.name}
                  width={240}
                  height={180}
                  className="object-contain max-h-44 drop-shadow-2xl z-10"
                />
                <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30">
                  <CheckCircle className="w-3.5 h-3.5" /> Stock Inmediato: {Number(modalProduct.stock_current)} disponibles
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="space-y-3">
                <h4 className="font-mono text-xs uppercase tracking-wider text-ember-400 font-bold flex items-center gap-2">
                  <Gauge className="w-4 h-4" /> Especificaciones Técnicas de Ingeniería
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] text-text-dim block">Viscosidad SAE</span>
                    <span className="text-sm font-bold text-white">
                      {modalProduct.technical_specs?.viscosity || "Multigrado"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] text-text-dim block">Base Química</span>
                    <span className="text-sm font-bold text-white">
                      {modalProduct.technical_specs?.oil_type || "Sintético"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] text-text-dim block">Norma API / ACEA</span>
                    <span className="text-sm font-bold text-white">
                      {modalProduct.technical_specs?.api_norm || "API SP"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] text-text-dim block">Intervalo Máx.</span>
                    <span className="text-sm font-bold text-white">
                      {modalProduct.technical_specs?.lifespan_km ? `${modalProduct.technical_specs.lifespan_km} km` : "10,000 km"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantee and Application Banner */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Homologación de Fabricantes de Vehículos</span>
                </div>
                <p className="text-text-lo text-[11px] leading-relaxed">
                  Compatible con motores a gasolina, híbridos y GLP/GNV. Máxima tolerancia contra el fenómeno LSPI (pre-ignición a bajas revoluciones), garantizando protección de turbocompresores y convertidores catalíticos según las tolerancias de fábrica de Toyota, Nissan, Hyundai, Kia, Chevrolet y Ford.
                </p>
              </div>

            </div>

            {/* Modal Footer with Pricing & WhatsApp Quote */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4 flex-shrink-0">
              <div>
                <span className="text-[10px] font-mono text-text-dim block uppercase">Precio con Mano de Obra Express</span>
                <span className="font-display font-extrabold text-2xl text-ember-400">
                  S/ {Number(modalProduct.sale_price).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalProduct(null)}
                  className="px-4 py-2.5 rounded-full border border-white/15 text-text-lo hover:text-white transition-colors"
                >
                  Cerrar
                </button>
                <a
                  href={`https://wa.me/51987654321?text=${encodeURIComponent(
                    `Hola Lubricentros Estrada, quiero solicitar el cambio de aceite con el producto: ${modalProduct.name} (${modalProduct.presentation}) a S/ ${Number(modalProduct.sale_price).toFixed(2)}. ¿Tienen bahía disponible hoy?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-ember-500 hover:bg-ember-600 text-white font-semibold shadow-lg shadow-ember-500/25 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Agendar en Bahía</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}