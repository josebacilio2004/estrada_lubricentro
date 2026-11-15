"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, Check, ShieldCheck, Zap, Gauge, Flame, Sparkles, MessageSquare, ArrowRight } from "lucide-react";

export interface CarProductDetail {
  id: string;
  modelCode: string;
  name: string;
  tagline: string;
  image: string;
  gradeBadge: string;
  specs: {
    viscosity: string;
    interval: string;
    approval: string;
  };
  technicalSheet: {
    kinematic100: string;
    kinematic40: string;
    viscosityIndex: string;
    flashPoint: string;
    tbn: string;
    evaporationNoack: string;
  };
  recommendedEngines: string[];
  packageIncludes: string[];
  price: string;
}

interface VehicleDetailModalProps {
  car: CarProductDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VehicleDetailModal({ car, isOpen, onClose }: VehicleDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !car) return null;

  const whatsappMessage = encodeURIComponent(
    `Hola Lubricentros Estrada, deseo agendar un servicio con la formulación ${car.modelCode} - ${car.name} (${car.price}). ¿Qué turnos tienen disponibles?`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-ink-950 border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-text-hi p-6 sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-text-lo hover:text-white transition-all z-20"
          aria-label="Cerrar detalles"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-ember-500/15 via-transparent to-transparent pointer-events-none rounded-t-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Vehicle Image & Badges */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full relative aspect-[4/3] rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 p-4 flex items-center justify-center overflow-hidden group">
              <Image
                src={car.image}
                alt={car.name}
                fill
                className="object-contain p-4 drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-ink-950/80 border border-white/10 text-[10px] font-mono text-ember-400 font-semibold backdrop-blur-md">
                {car.gradeBadge}
              </div>
            </div>

            <div className="mt-6 w-full p-4 rounded-xl bg-white/[0.02] border border-white/10 text-center">
              <span className="text-[11px] font-mono text-text-dim block uppercase">Precio del Paquete Completo</span>
              <span className="font-display font-extrabold text-3xl text-ember-500 mt-1 block">
                {car.price}
              </span>
              <span className="text-[10px] text-text-lo block mt-1">Incluye aceite, filtro OEM, mano de obra y diagnóstico</span>
            </div>

            <div className="mt-4 w-full flex flex-col gap-2.5">
              <a
                href={`https://wa.me/51987654321?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-ember-500 hover:bg-ember-600 text-white font-semibold text-xs py-3.5 px-6 rounded-full transition-all shadow-lg shadow-ember-500/30 active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                Agendar Vía WhatsApp
              </a>
              <a
                href="/admin/pos"
                className="w-full inline-flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium text-xs py-3 px-6 rounded-full border border-white/10 transition-all"
              >
                Abrir en Terminal POS
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: In-depth Technical Telemetry */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-ember-400 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>FICHA TÉCNICA Y DIAGNÓSTICO ESTRADA</span>
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight uppercase">
                {car.modelCode} • {car.name}
              </h2>
              <p className="text-xs text-text-lo mt-1 leading-relaxed">
                {car.tagline}
              </p>
            </div>

            {/* Core specs pills */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-center">
              <div>
                <p className="text-[10px] text-text-dim uppercase">Viscosidad</p>
                <p className="font-bold text-xs text-white mt-0.5">{car.specs.viscosity}</p>
              </div>
              <div className="border-x border-white/10">
                <p className="text-[10px] text-text-dim uppercase">Intervalo</p>
                <p className="font-bold text-xs text-white mt-0.5">{car.specs.interval}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-dim uppercase">Homologación</p>
                <p className="font-bold text-xs text-white mt-0.5">{car.specs.approval}</p>
              </div>
            </div>

            {/* Technical Sheet Table */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-dim mb-2.5 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-ember-500" />
                Propiedades Físico-Químicas de Laboratorio
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-ink-900 border border-white/10">
                  <span className="text-[10px] text-text-dim block">Visc. a 100°C</span>
                  <span className="text-white font-semibold">{car.technicalSheet.kinematic100}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-ink-900 border border-white/10">
                  <span className="text-[10px] text-text-dim block">Visc. a 40°C</span>
                  <span className="text-white font-semibold">{car.technicalSheet.kinematic40}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-ink-900 border border-white/10">
                  <span className="text-[10px] text-text-dim block">Índice Visc. (VI)</span>
                  <span className="text-white font-semibold">{car.technicalSheet.viscosityIndex}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-ink-900 border border-white/10">
                  <span className="text-[10px] text-text-dim block">Flash Point</span>
                  <span className="text-white font-semibold">{car.technicalSheet.flashPoint}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-ink-900 border border-white/10">
                  <span className="text-[10px] text-text-dim block">TBN Alcalinidad</span>
                  <span className="text-white font-semibold">{car.technicalSheet.tbn}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-ink-900 border border-white/10">
                  <span className="text-[10px] text-text-dim block">Noack Volatilidad</span>
                  <span className="text-white font-semibold">{car.technicalSheet.evaporationNoack}</span>
                </div>
              </div>
            </div>

            {/* Recommended Engines */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-dim mb-2.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Motores & Aplicaciones Compatibles
              </h3>
              <div className="flex flex-wrap gap-2">
                {car.recommendedEngines.map((eng, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-text-hi">
                    {eng}
                  </span>
                ))}
              </div>
            </div>

            {/* Service Package Includes */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-dim mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                El Servicio en Taller Estrada Incluye
              </h3>
              <ul className="space-y-1.5 text-xs text-text-lo">
                {car.packageIncludes.map((inc, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
