"use client";

import React, { useState } from "react";
import { ArrowRight, Maximize2, Play, Flame, Gauge, Sparkles } from "lucide-react";
import { EngineDetailModal } from "./EngineDetailModal";

export function Technology() {
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  return (
    <section id="tecnologia" className="scroll-mt-20 bg-ink-950 py-24 px-6 overflow-hidden relative border-t border-white/[0.06]">
      
      {/* Background ambient radial glow */}
      <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[650px] h-[500px] bg-ember-500/10 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute left-10 bottom-10 w-[400px] h-[300px] bg-cyan-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Text Block */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-text-lo uppercase">
            <span className="w-2 h-2 rounded-full bg-ember-500 animate-pulse" />
            <span>TECNOLOGÍA DE PROPULSIÓN & LUBRICACIÓN</span>
          </div>
          
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl xl:text-6xl tracking-tight leading-[0.98] uppercase">
            <span className="block text-white">LA INGENIERÍA</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-ember-400 via-ember-500 to-amber-500">
              LUBRICA MÁS LEJOS.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-text-lo max-w-lg leading-relaxed font-light">
            Desde nuestra formulación de micro-película molecular hasta el control térmico activo bajo máxima exigencia, 
            Estrada combina química de lubricación de vanguardia con precisión milimétrica en cada servicio.
          </p>

          <div className="pt-2 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setDetailModalOpen(true)}
              className="inline-flex items-center gap-2 bg-ember-500 hover:bg-ember-600 text-white text-xs font-semibold px-7 py-3.5 rounded-full transition-all duration-200 hover:shadow-xl hover:shadow-ember-500/30 active:scale-95 group shadow-lg"
            >
              <span>Explorar Telemetría del Motor</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <span className="text-xs font-mono text-text-dim hidden sm:inline">
              ● V8 Biturbo Cutaway
            </span>
          </div>
        </div>

        {/* Right Exploded Engine Frame with Video & Interactive Hotspots */}
        <div className="lg:col-span-7 relative">
          <div 
            onClick={() => setDetailModalOpen(true)}
            className="relative w-full aspect-[720/380] max-w-[760px] mx-auto rounded-3xl overflow-hidden border border-white/15 bg-ink-900 group cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:border-ember-500/80 hover:shadow-[0_25px_60px_rgba(242,106,27,0.25)] transition-all duration-500"
          >
            {/* Embedded Engine Video (motor1.mp4) playing in frame */}
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out filter contrast-110"
            >
              <source src="/media/motor1.mp4" type="video/mp4" />
            </video>

            {/* Video Overlay Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-ink-950/40 pointer-events-none" />

            {/* Pulsing expand badge in upper right */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 border border-white/20 text-[11px] font-mono text-white backdrop-blur-md group-hover:bg-ember-500 group-hover:border-ember-400 transition-all">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Ver Análisis Detallado</span>
            </div>

            {/* Bottom HUD bar on video */}
            <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between px-4 py-2 rounded-xl bg-ink-950/85 backdrop-blur-md border border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-ember-500 animate-ping" />
                <span className="text-white font-semibold">FLUJO HIDRODINÁMICO EN VIVO</span>
              </div>
              <span className="text-text-lo text-[11px]">
                Click para desplegar banco de pruebas
              </span>
            </div>

            {/* Hotspot 1: Película Molecular */}
            <div className="absolute top-[20%] left-[12%] z-20 hidden sm:flex flex-col items-start pointer-events-none group-hover:scale-105 transition-transform">
              <span className="text-[10px] font-mono text-white font-medium tracking-wide bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                Película Molecular Antifricción
              </span>
              <div className="w-12 h-px bg-ember-500 my-1" />
              <div className="w-2 h-2 rounded-full bg-ember-500 shadow-md shadow-ember-500 animate-ping" />
            </div>

            {/* Hotspot 2: Filtración 15um */}
            <div className="absolute top-[18%] right-[12%] z-20 hidden sm:flex flex-col items-end pointer-events-none group-hover:scale-105 transition-transform">
              <span className="text-[10px] font-mono text-white font-medium tracking-wide flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block shadow-md shadow-cyan-400" />
                Filtración Homologada 15µm
              </span>
              <div className="w-16 h-px bg-cyan-400 my-1" />
            </div>

            {/* Hotspot 3: Control Térmico */}
            <div className="absolute bottom-[24%] left-[14%] z-20 hidden sm:flex flex-col items-start pointer-events-none group-hover:scale-105 transition-transform">
              <span className="text-[10px] font-mono text-white font-medium tracking-wide bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                Control Térmico Activo 150°C
              </span>
              <div className="w-12 h-px bg-amber-500 my-1" />
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-md shadow-amber-500" />
            </div>

          </div>
        </div>

      </div>

      {/* Interactive Detail Modal Frame */}
      <EngineDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
    </section>
  );
}
