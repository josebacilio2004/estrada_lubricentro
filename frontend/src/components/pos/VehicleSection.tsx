"use client";

import React from "react";
import { Car } from "lucide-react";
import { VehicleData } from "@/types";
import {
  TARJETA,
  CabeceraSeccion,
  CAMPO,
  SELECT_NATIVO,
  ETIQUETA_CAMPO,
  Chip,
  cn,
} from "@/components/khipu/khipu-ui";

interface VehicleSectionProps {
  vehicle: VehicleData;
  setVehicle: React.Dispatch<React.SetStateAction<VehicleData>>;
}

export function VehicleSection({ vehicle, setVehicle }: VehicleSectionProps) {
  const proximoCambio = Number(vehicle.currentKM || 0) + Number(vehicle.oilLifespanKM || 5000);

  return (
    <div className={cn(TARJETA, "pb-4")}>
      <CabeceraSeccion
        icon={Car}
        titulo="2. Ficha de lubricación y próximo cambio"
        subtitulo="Cálculo automático del próximo kilometraje de servicio"
        derecha={
          <Chip>
            Próx. cambio: {proximoCambio.toLocaleString("es-PE")} km
          </Chip>
        }
      />

      <div className="px-4 space-y-3 pt-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className={ETIQUETA_CAMPO}>Placa vehicular</label>
            <input
              type="text"
              value={vehicle.plate}
              onChange={(e) =>
                setVehicle((prev) => ({
                  ...prev,
                  plate: e.target.value.toUpperCase(),
                }))
              }
              placeholder="ABC-123"
              className={cn(CAMPO, "font-mono font-semibold uppercase")}
            />
          </div>

          <div>
            <label className={ETIQUETA_CAMPO}>Kilometraje actual</label>
            <input
              type="number"
              value={vehicle.currentKM}
              onChange={(e) =>
                setVehicle((prev) => ({
                  ...prev,
                  currentKM: Number(e.target.value),
                }))
              }
              className={cn(CAMPO, "tabular-nums")}
            />
          </div>

          <div>
            <label className={ETIQUETA_CAMPO}>Perfil de uso</label>
            <select
              value={vehicle.usageProfile}
              onChange={(e) =>
                setVehicle((prev) => ({
                  ...prev,
                  usageProfile: e.target.value as any,
                }))
              }
              className={cn(SELECT_NATIVO, "w-full")}
            >
              <option value="PARTICULAR">Particular (35 km/d)</option>
              <option value="TAXI_COLECTIVO">Taxi / Colectivo (140 km/d)</option>
              <option value="FLOTA_COMERCIAL">Flota Comercial (160 km/d)</option>
            </select>
          </div>

          <div>
            <label className={ETIQUETA_CAMPO}>Vida útil del aceite</label>
            <select
              value={vehicle.oilLifespanKM}
              onChange={(e) =>
                setVehicle((prev) => ({
                  ...prev,
                  oilLifespanKM: Number(e.target.value),
                }))
              }
              className={cn(SELECT_NATIVO, "w-full tabular-nums")}
            >
              <option value={5000}>5,000 km (Mineral)</option>
              <option value={7500}>7,500 km (Semisintético)</option>
              <option value={10000}>10,000 km (Full Sintético)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-secondary/70 px-3 py-2 text-control">
          <span className="text-etiqueta font-medium text-muted-foreground">
            Filtros reemplazados:
          </span>
          <label className="inline-flex items-center gap-1.5 cursor-pointer text-foreground">
            <input
              type="checkbox"
              checked={vehicle.filterOil}
              onChange={(e) =>
                setVehicle((prev) => ({ ...prev, filterOil: e.target.checked }))
              }
              className="rounded accent-primary"
            />
            <span>Filtro de aceite</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer text-foreground">
            <input
              type="checkbox"
              checked={vehicle.filterAir}
              onChange={(e) =>
                setVehicle((prev) => ({ ...prev, filterAir: e.target.checked }))
              }
              className="rounded accent-primary"
            />
            <span>Filtro de aire</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer text-foreground">
            <input
              type="checkbox"
              checked={vehicle.filterCabin}
              onChange={(e) =>
                setVehicle((prev) => ({
                  ...prev,
                  filterCabin: e.target.checked,
                }))
              }
              className="rounded accent-primary"
            />
            <span>Filtro de cabina</span>
          </label>
        </div>
      </div>
    </div>
  );
}
