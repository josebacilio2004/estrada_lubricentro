"use client";

import React, { useRef } from "react";
import { ArrowRight, Play, Activity, Gauge, Flame } from "lucide-react";

interface HeroProps {
  onOpenFilm: () => void;
}

export function Hero({ onOpenFilm }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section className="relative min-h-[750px] lg:min-h-[860px] flex items-center justify-center overflow-hidden bg-ink-950 pt-28 pb-20">
      
      {/* 1. Full-Bleed Video Background with Rich Visual Impact */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover opacity-65 sm:opacity-75 scale-100 transition-all duration-700 filter contrast-125 saturate-115"
        >
          <source src="/media/fondo1.mp4" type="video/mp4" />
        </video>

        {/* Cinematic Vignettes & Color Blending Masks */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-ink-950/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 via-transparent to-ink-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,rgba(10,10,11,0.6)_80%)]" />
        
        {/* Ambient Ember Glow in lower center */}
        <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-ember-500/15 blur-[160px] pointer-events-none rounded-full" />

        {/* Dynamic Motion Graphics Scanning Line */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-ember-500/60 to-transparent animate-scanline pointer-events-none" />
      </div>

      {/* Hero Content: Clean, Imposing, Perfectly Balanced */}
      <div className="max-w-[1200px] mx-auto px-6 w-full relative z-20 flex flex-col items-center text-center space-y-8">
        
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-ink-950/60 border border-white/15 backdrop-blur-md shadow-2xl animate-hud-float">
          <span className="w-2 h-2 rounded-full bg-ember-500 animate-pulse" />
          <div className="text-[11px] font-mono tracking-wideEyebrow text-text-hi uppercase flex items-center gap-2">
            <span className="text-white font-semibold">LUBRICACIÓN DE ALTA GAMA</span>
            <span className="text-white/30">•</span>
            <span className="text-text-lo">FORMULACIONES OEM</span>
            <span className="text-white/30">•</span>
            <span className="text-amber-400 font-semibold">100% SINTÉTICO</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="space-y-2">
          <h1 className="font-display font-extrabold text-5xl sm:text-7xl xl:text-8xl tracking-tight leading-[0.94] uppercase drop-shadow-2xl">
            <span className="block text-white">PROTEGE MÁS ALLÁ</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-ember-400 via-ember-500 to-amber-500 drop-shadow-lg">
              DE LO ESPERADO.
            </span>
          </h1>
        </div>

        {/* Subtitle with High Readability */}
        <p className="text-base sm:text-lg text-text-hi/90 max-w-2xl mx-auto leading-relaxed font-light drop-shadow-md">
          Lubricentros Estrada formula la máxima protección para motores de última generación. 
          Química molecular de alta pureza que combina potencia extrema, refrigeración térmica continua 
          y una conducción con reducción absoluta de fricción.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-5 pt-2">
          <a
            href="#modelos"
            className="inline-flex items-center gap-2.5 bg-ember-500 hover:bg-ember-600 text-white text-sm font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:shadow-2xl hover:shadow-ember-500/40 hover:scale-105 active:scale-95 group shadow-lg"
          >
            <span>Explorar Catálogo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </a>

          <button
            type="button"
            onClick={onOpenFilm}
            className="group inline-flex items-center gap-3 text-white text-sm font-medium hover:text-ember-400 transition-all px-6 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 backdrop-blur-md shadow-lg"
          >
            <span className="relative w-8 h-8 rounded-full border border-white/40 flex items-center justify-center transition-all duration-300 group-hover:border-ember-500 group-hover:bg-ember-500/20 group-hover:scale-110">
              <Play className="w-3.5 h-3.5 fill-current text-white group-hover:text-ember-400 ml-0.5" />
            </span>
            <span className="tracking-wide">Ver el film</span>
          </button>
        </div>

        {/* Live Telemetry Dock matching HyperFrames Precision */}
        <div className="pt-6 w-full max-w-2xl border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="px-4 py-2.5 rounded-xl bg-ink-900/60 border border-white/10 backdrop-blur-sm flex items-center justify-center gap-2.5">
            <Flame className="w-4 h-4 text-ember-500 flex-shrink-0" />
            <div className="text-left">
              <p className="text-[10px] text-text-dim uppercase">Tolerancia Térmica</p>
              <p className="text-white font-bold">Hasta 260°C</p>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-ink-900/60 border border-white/10 backdrop-blur-sm flex items-center justify-center gap-2.5">
            <Gauge className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="text-left">
              <p className="text-[10px] text-text-dim uppercase">Presión Hidrodinámica</p>
              <p className="text-white font-bold">4.8 bar Óptimo</p>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-ink-900/60 border border-white/10 backdrop-blur-sm flex items-center justify-center gap-2.5">
            <Activity className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div className="text-left">
              <p className="text-[10px] text-text-dim uppercase">Fricción Interna</p>
              <p className="text-white font-bold">-42% Desgaste</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
