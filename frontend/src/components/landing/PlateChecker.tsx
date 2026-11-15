"use client";

import React, { useState } from "react";
import { Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import { checkNextService } from "@/lib/api";
import { NextServiceData } from "@/types";

export function PlateChecker() {
  const [searchPlate, setSearchPlate] = useState("");
  const [plateLoading, setPlateLoading] = useState(false);
  const [serviceInfo, setServiceInfo] = useState<NextServiceData | null>(null);
  const [searchError, setSearchError] = useState("");

  const handlePlateSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPlate.trim()) return;

    setPlateLoading(true);
    setSearchError("");
    setServiceInfo(null);

    try {
      const data = await checkNextService(searchPlate);
      if (data && data.found) {
        setServiceInfo(data);
      } else {
        setSearchError(`No se encontraron registros previos para la placa ${searchPlate}. ¡Visítanos para tu primer servicio!`);
      }
    } catch {
      setSearchError("Error momentáneo al consultar placa. Intente nuevamente.");
    } finally {
      setPlateLoading(false);
    }
  };

  return (
    <section id="consulta-placa" className="py-16 px-4 bg-estrada-surface/40 border-y border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-estrada-amber text-xs font-mono uppercase tracking-widest">Tecnología de Fidelización Estrada</span>
          <h2 className="font-display font-bold text-3xl text-white mt-2">
            Consulta el Próximo Cambio de Aceite de tu Auto
          </h2>
          <p className="text-estrada-muted text-sm mt-2">
            Ingresa tu placa vehicular para consultar la fecha sugerida y el kilometraje de tu próximo servicio.
          </p>
        </div>

        <form onSubmit={handlePlateSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
              placeholder="Ejemplo: ABC-123"
              maxLength={8}
              className="w-full bg-estrada-bg border border-white/15 focus:border-estrada-amber rounded-xl px-5 py-3.5 text-center sm:text-left text-lg font-mono tracking-widest text-white placeholder-slate-500 outline-none uppercase transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={plateLoading}
            className="bg-estrada-amber hover:bg-amber-500 text-black font-extrabold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {plateLoading ? "Consultando..." : "Consultar Placa"}
            <Search className="h-4 w-4" />
          </button>
        </form>

        {searchError && (
          <div className="p-4 rounded-xl bg-estrada-danger/10 border border-estrada-danger/30 text-estrada-danger text-sm flex items-center gap-2 max-w-xl mx-auto">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {serviceInfo && (
          <div className="glass-panel p-6 rounded-2xl border-estrada-amber/30 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 mb-4 gap-2">
              <div>
                <span className="font-mono text-2xl font-black text-estrada-amber bg-black/40 px-3 py-1 rounded-lg border border-estrada-amber/30">
                  {serviceInfo.license_plate}
                </span>
                <p className="text-xs text-estrada-muted mt-1">
                  {serviceInfo.vehicle_brand} {serviceInfo.vehicle_model}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-estrada-ok/10 text-estrada-ok border border-estrada-ok/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Estado: {serviceInfo.lifecycle_status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono">
              <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                <span className="text-xs text-estrada-muted block">Último Aceite Aplicado:</span>
                <span className="text-white font-semibold">{serviceInfo.oil_applied} ({serviceInfo.oil_viscosity})</span>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                <span className="text-xs text-estrada-muted block">Kilometraje en Último Servicio:</span>
                <span className="text-white font-semibold">{serviceInfo.last_mileage?.toLocaleString()} km</span>
              </div>
              <div className="p-3 rounded-xl bg-estrada-amber/10 border border-estrada-amber/30">
                <span className="text-xs text-estrada-amber block font-sans font-bold">Próximo Kilometraje Sugerido:</span>
                <span className="text-xl font-bold text-estrada-amber">{serviceInfo.next_mileage?.toLocaleString()} km</span>
              </div>
              <div className="p-3 rounded-xl bg-estrada-orange/10 border border-estrada-orange/30">
                <span className="text-xs text-estrada-orange block font-sans font-bold">Fecha Estimada:</span>
                <span className="text-xl font-bold text-white">
                  {serviceInfo.estimated_next_date ? new Date(serviceInfo.estimated_next_date).toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  }) : "-"}
                </span>
              </div>
            </div>

            <div className="mt-5 text-center">
              <a
                href={`https://wa.me/51987654321?text=Hola,%20quisiera%20agendar%20mi%20cambio%20de%20aceite%20para%20la%20placa%20${serviceInfo.license_plate}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono text-estrada-amber hover:underline"
              >
                Confirmar cita o adelantar cambio por WhatsApp &rarr;
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
