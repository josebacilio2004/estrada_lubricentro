"use client";

import React from "react";
import { Car } from "lucide-react";
import { VehicleData } from "@/types";

interface VehicleSectionProps {
  vehicle: VehicleData;
  setVehicle: React.Dispatch<React.SetStateAction<VehicleData>>;
}

export function VehicleSection({ vehicle, setVehicle }: VehicleSectionProps) {
  return (
    <div className="card-dark p-5 rounded-2xl border border-white/10">
      <span className="text-xs font-mono uppercase text-ember-500 font-bold flex items-center gap-1.5 mb-3">
        <Car className="h-3.5 w-3.5" /> 2. Ficha de Lubricación & Próximo Cambio
      </span>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
        <div>
          <label className="text-[11px] text-text-lo block mb-1 font-mono">Placa:</label>
          <input
            type="text"
            value={vehicle.plate}
            onChange={(e) => setVehicle((prev) => ({ ...prev, plate: e.target.value.toUpperCase() }))}
            placeholder="ABC-123"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono font-bold tracking-wider outline-none focus:border-ember-500 uppercase transition-colors"
          />
        </div>

        <div>
          <label className="text-[11px] text-text-lo block mb-1 font-mono">Kilometraje Actual:</label>
          <input
            type="number"
            value={vehicle.currentKM}
            onChange={(e) => setVehicle((prev) => ({ ...prev, currentKM: Number(e.target.value) }))}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-ember-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-[11px] text-text-lo block mb-1 font-mono">Perfil de Uso:</label>
          <select
            value={vehicle.usageProfile}
            onChange={(e) => setVehicle((prev) => ({ ...prev, usageProfile: e.target.value as any }))}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-ember-500 transition-colors"
          >
            <option value="PARTICULAR">Particular (35 km/d)</option>
            <option value="TAXI_COLECTIVO">Taxi / Colectivo (140 km/d)</option>
            <option value="FLOTA_COMERCIAL">Flota Comercial (160 km/d)</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-text-lo block mb-1 font-mono">Vida Útil Aceite:</label>
          <select
            value={vehicle.oilLifespanKM}
            onChange={(e) => setVehicle((prev) => ({ ...prev, oilLifespanKM: Number(e.target.value) }))}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-ember-500 transition-colors"
          >
            <option value={5000}>5,000 km (Mineral)</option>
            <option value={7500}>7,500 km (Semisintético)</option>
            <option value={10000}>10,000 km (Sintético)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-3 border-t border-white/10">
        <label className="flex items-center gap-2 cursor-pointer text-white">
          <input
            type="checkbox"
            checked={vehicle.filterOil}
            onChange={(e) => setVehicle((prev) => ({ ...prev, filterOil: e.target.checked }))}
            className="rounded accent-ember-500"
          />
          Filtro Aceite
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-white">
          <input
            type="checkbox"
            checked={vehicle.filterAir}
            onChange={(e) => setVehicle((prev) => ({ ...prev, filterAir: e.target.checked }))}
            className="rounded accent-ember-500"
          />
          Filtro Aire
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-white">
          <input
            type="checkbox"
            checked={vehicle.filterCabin}
            onChange={(e) => setVehicle((prev) => ({ ...prev, filterCabin: e.target.checked }))}
            className="rounded accent-ember-500"
          />
          Filtro Cabina
        </label>
      </div>
    </div>
  );
}
