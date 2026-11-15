"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, Search, CheckCircle2, AlertTriangle, Calendar, Gauge } from "lucide-react";
import { checkNextService } from "@/lib/api";
import { NextServiceData } from "@/types";

export function BookingBanner() {
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NextServiceData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      const data = await checkNextService(plate);
      if (data && data.found) {
        setResult(data);
      } else {
        setErrorMsg(`No hay registros previos para la placa ${plate.toUpperCase()}. ¡Agenda tu primer cambio hoy!`);
      }
    } catch {
      setErrorMsg("Error de conexión al consultar placa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="agenda" className="scroll-mt-20 relative py-20 px-6 overflow-hidden bg-ember-sunset text-white">
      
      {/* Background ambient light */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: DOSLA Book A Drive typography & interactive form */}
        <div className="lg:col-span-7 space-y-6">
          <span className="text-[11px] font-mono tracking-wideEyebrow text-white/80 uppercase block">
            AGENDA O CONSULTA TU CAMBIO
          </span>

          <h2 className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight leading-[0.98]">
            Tu próximo<br />capítulo empieza aquí.
          </h2>

          <p className="text-sm sm:text-base text-white/90 max-w-lg leading-relaxed font-light">
            Consulta el kilometraje exacto de tu auto o agenda tu próximo servicio con lubricantes 100% sintéticos certificados.
          </p>

          {/* Integrated Interactive Plate Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-md pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="PLACA (Ej: BCX-512)"
                maxLength={8}
                className="w-full bg-black/40 border border-white/20 focus:border-white rounded-full px-5 py-3 text-sm font-mono tracking-wider text-white placeholder:text-white/50 outline-none uppercase transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-black text-xs font-semibold px-7 py-3 rounded-full transition-all duration-200 hover:shadow-xl active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "Consultando..." : "Consultar Placa"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Error notice */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white flex items-center gap-2 max-w-md">
              <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Interactive Result Card */}
          {result && (
            <div className="p-5 rounded-2xl bg-black/60 border border-white/20 max-w-lg backdrop-blur-md space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="font-mono font-black text-xl text-white">
                    {result.license_plate}
                  </span>
                  <span className="text-xs text-white/70 block">
                    {result.vehicle_brand} {result.vehicle_model}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Próximo Servicio Activo
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-white/5">
                  <span className="text-white/60 block text-[10px]">Próximo Km Sugerido:</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
                    <Gauge className="w-3.5 h-3.5 text-ember-400" />
                    {result.next_mileage?.toLocaleString()} km
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5">
                  <span className="text-white/60 block text-[10px]">Fecha Estimada:</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-ember-400" />
                    {result.estimated_next_date ? new Date(result.estimated_next_date).toLocaleDateString("es-PE") : "-"}
                  </span>
                </div>
              </div>

              <a
                href={`https://wa.me/51987654321?text=Hola,%20quisiera%20confirmar%20mi%20cambio%20de%20aceite%20para%20la%20placa%20${result.license_plate}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-ember-500 hover:bg-ember-600 text-white text-xs font-semibold py-2.5 rounded-full transition-all"
              >
                Confirmar Turno por WhatsApp
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Right Column: Car driving into the sunset */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[460px] aspect-[452/280] rounded-xl overflow-hidden group">
            <Image
              src="/media/cta-car-rear.png"
              alt="Vehículo en carretera hacia el atardecer"
              fill
              className="object-contain object-right-bottom group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
