"use client";

import React, { useState } from "react";
import { ProductItem } from "@/types";

const VISCOSITIES = ["TODOS", "0W-20", "5W-30", "5W-40", "10W-40", "15W-40", "20W-50"];

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: "1",
    sku: "MOB-5W30",
    name: "Mobil 1 Advanced Full Synthetic 5W-30",
    brand: "Mobil 1",
    presentation: "1 Galón (3.78L)",
    viscosity: "5W-30",
    price: 185.00,
    stock: 25,
    tag: "Más Vendido",
  },
  {
    id: "2",
    sku: "CAS-5W30",
    name: "Castrol EDGE Titanium FST 5W-30",
    brand: "Castrol",
    presentation: "1 Cuarto (946ml)",
    viscosity: "5W-30",
    price: 48.00,
    stock: 50,
    tag: "Recomendado",
  },
  {
    id: "3",
    sku: "MOT-10W40",
    name: "Motul 6100 Synergie+ 10W-40",
    brand: "Motul",
    presentation: "1 Galón (4L)",
    viscosity: "10W-40",
    price: 155.00,
    stock: 18,
    tag: "Alto Rendimiento",
  },
  {
    id: "4",
    sku: "LIQ-5W40",
    name: "Liqui Moly Molygen New Generation 5W-40",
    brand: "Liqui Moly",
    presentation: "Bidón 5L",
    viscosity: "5W-40",
    price: 240.00,
    stock: 12,
    tag: "Tecnología Alemana",
  },
  {
    id: "5",
    sku: "SHELL-10W40",
    name: "Shell Helix HX7 10W-40 Semisintético",
    brand: "Shell Helix",
    presentation: "1 Galón (4L)",
    viscosity: "10W-40",
    price: 130.00,
    stock: 30,
    tag: "Económico",
  },
  {
    id: "6",
    sku: "CAS-20W50",
    name: "Castrol GTX 20W-50 Alto Kilometraje",
    brand: "Castrol",
    presentation: "1 Galón (3.78L)",
    viscosity: "20W-50",
    price: 110.00,
    stock: 40,
    tag: "Motores > 100k km",
  },
];

export function ProductGrid() {
  const [selectedViscosity, setSelectedViscosity] = useState("TODOS");

  const filtered = selectedViscosity === "TODOS"
    ? DEFAULT_PRODUCTS
    : DEFAULT_PRODUCTS.filter((p) => p.viscosity === selectedViscosity);

  return (
    <section id="catalogo" className="py-20 px-4 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-estrada-amber text-xs font-mono uppercase tracking-widest">Stock Disponible & Certificado</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-1">
            Catálogo de Lubricantes de Motor
          </h2>
          <p className="text-estrada-muted text-sm mt-1">
            Filtra por viscosidad recomendada por el fabricante de tu vehículo.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {VISCOSITIES.map((v) => (
            <button
              key={v}
              onClick={() => setSelectedViscosity(v)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedViscosity === v
                  ? "bg-estrada-amber text-black shadow-md shadow-estrada-amber/20"
                  : "bg-estrada-surface hover:bg-slate-800 text-estrada-muted border border-white/5"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((prod) => (
          <div key={prod.id} className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-estrada-muted">
                  {prod.brand}
                </span>
                {prod.tag && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-estrada-amber/15 text-estrada-amber border border-estrada-amber/30">
                    {prod.tag}
                  </span>
                )}
              </div>

              <h3 className="font-display font-bold text-lg text-white mb-2 leading-snug">
                {prod.name}
              </h3>

              <div className="space-y-1.5 text-xs text-estrada-muted mb-6">
                <div className="flex justify-between">
                  <span>Presentación:</span>
                  <span className="text-white font-medium">{prod.presentation}</span>
                </div>
                <div className="flex justify-between">
                  <span>Viscosidad SAE:</span>
                  <span className="text-estrada-amber font-mono font-bold">{prod.viscosity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Disponibilidad:</span>
                  <span className="text-estrada-ok font-mono font-medium">{prod.stock} unid. en stock</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-estrada-muted block font-mono">Precio Público (Inc. IGV)</span>
                <span className="font-mono text-2xl font-black text-white">
                  S/ {prod.price.toFixed(2)}
                </span>
              </div>

              <a
                href={`https://wa.me/51987654321?text=Hola,%20deseo%20comprar%20o%20cotizar%20${encodeURIComponent(prod.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-estrada-orange hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
              >
                Cotizar
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
