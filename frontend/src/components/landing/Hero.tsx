"use client";

import React from "react";
import { Sparkles, Gauge, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 px-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-estrada-amber/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-estrada-orange/15 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-estrada-surface/80 border border-estrada-amber/30 text-estrada-amber text-xs font-mono font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Líderes en Marcas Premium de Alto Rendimiento
        </div>

        <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.1] mb-6">
          Protección de Máximo Nivel para el <span className="text-transparent bg-clip-text bg-gradient-to-r from-estrada-amber via-amber-200 to-estrada-orange">Motor de tu Vehículo</span>
        </h1>

        <p className="text-lg sm:text-xl text-estrada-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Aceites 100% originales, filtros homologados y servicio express de cambio de aceite con cartilla digital y recordatorio predictivo a tu WhatsApp.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#consulta-placa"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-estrada-orange hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-estrada-orange/30 transition-all hover:scale-[1.02]"
          >
            <Gauge className="h-5 w-5" />
            ¿Cuándo me toca cambio? (Por Placa)
          </a>
          <a
            href="#catalogo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-estrada-surface hover:bg-slate-800 text-white border border-white/10 font-bold px-8 py-4 rounded-xl transition-all"
          >
            Explorar Catálogo
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
          <div className="glass-panel p-4 rounded-2xl text-center">
            <span className="font-mono text-3xl font-extrabold text-estrada-amber">+15,000</span>
            <p className="text-xs text-estrada-muted mt-1">Cambios Realizados</p>
          </div>
          <div className="glass-panel p-4 rounded-2xl text-center">
            <span className="font-mono text-3xl font-extrabold text-white">100%</span>
            <p className="text-xs text-estrada-muted mt-1">Lubricantes Sellados</p>
          </div>
          <div className="glass-panel p-4 rounded-2xl text-center">
            <span className="font-mono text-3xl font-extrabold text-estrada-teal">&lt; 20 min</span>
            <p className="text-xs text-estrada-muted mt-1">Servicio Express</p>
          </div>
          <div className="glass-panel p-4 rounded-2xl text-center">
            <span className="font-mono text-3xl font-extrabold text-estrada-ok">SUNAT</span>
            <p className="text-xs text-estrada-muted mt-1">Boleta y Factura Electrónica</p>
          </div>
        </div>
      </div>
    </section>
  );
}
