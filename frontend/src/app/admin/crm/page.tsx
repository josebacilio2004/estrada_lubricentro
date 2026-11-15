"use client";

import React, { useState, useEffect } from "react";
import { ErpLayout } from "@/components/admin/ErpLayout";
import {
  Users,
  Car,
  Phone,
  MessageSquare,
  Search,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";

interface CustomerRecord {
  id: string;
  name: string;
  doc: string;
  phone: string;
  plate: string;
  vehicleModel: string;
  year: number;
  engineFuel: string;
  currentKm: number;
  lastServiceDate: string;
  nextServiceKm: number;
  oilApplied: string;
  status: "OPTIMAL" | "DUE_SOON" | "OVERDUE";
}

const CRM_CUSTOMERS: CustomerRecord[] = [
  {
    id: "1",
    name: "Carlos Mendoza Alarcón",
    doc: "10458923",
    phone: "964123456",
    plate: "ABC-123",
    vehicleModel: "Toyota RAV4 2.5L AWD",
    year: 2022,
    engineFuel: "Gasolina",
    currentKm: 48800,
    lastServiceDate: "2026-07-06",
    nextServiceKm: 50000,
    oilApplied: "Mobil 1 Advanced 5W-30",
    status: "DUE_SOON",
  },
  {
    id: "2",
    name: "Vanessa Torres Rivas",
    doc: "45891230",
    phone: "964987654",
    plate: "W1A-982",
    vehicleModel: "Hyundai Tucson 2.0L GLP",
    year: 2021,
    engineFuel: "GLP Dual",
    currentKm: 72400,
    lastServiceDate: "2026-08-15",
    nextServiceKm: 75000,
    oilApplied: "Motul 6100 Synergie+ 10W-40",
    status: "OPTIMAL",
  },
  {
    id: "3",
    name: "Renzo Estrada Poma",
    doc: "964777888",
    phone: "964777888",
    plate: "ABC-777",
    vehicleModel: "Mazda CX-5 SkyActiv",
    year: 2023,
    engineFuel: "Gasolina",
    currentKm: 32000,
    lastServiceDate: "2026-10-04",
    nextServiceKm: 37000,
    oilApplied: "Castrol EDGE Titanium 5W-30",
    status: "OPTIMAL",
  },
  {
    id: "4",
    name: "Transportes Huancayo SAC (Flota)",
    doc: "20608912345",
    phone: "964555111",
    plate: "BCX-456",
    vehicleModel: "Nissan Frontier Diésel 2.5L",
    year: 2020,
    engineFuel: "Diésel Turbo",
    currentKm: 124500,
    lastServiceDate: "2026-05-12",
    nextServiceKm: 120000,
    oilApplied: "Castrol GTX 20W-50 Alto KM",
    status: "OVERDUE",
  },
];

export default function CrmAdminPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>(CRM_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("TODOS");

  useEffect(() => {
    fetch("/v1/customers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          const mapped = data.data.map((c: any, idx: number) => ({
            id: c.id || String(idx + 1),
            name: c.full_name_or_business_name,
            doc: c.doc_number,
            phone: c.phone_whatsapp || "Sin celular",
            plate: c.vehicles_list || "PARTICULAR",
            vehicleModel: "Vehículo Particular Estrada",
            year: 2022,
            engineFuel: "Gasolina / Dual",
            currentKm: 48000,
            lastServiceDate: "2026-10-15",
            nextServiceKm: 55000,
            oilApplied: "Mobil 1 / Castrol 5W-30",
            status: "OPTIMAL",
          }));
          setCustomers(mapped);
        }
      })
      .catch((e) => console.warn("Fallback CRM", e));
  }, []);

  const filtered = customers.filter((c) => {
    if (filterSeverity !== "TODOS" && c.status !== filterSeverity) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.plate.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.vehicleModel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <ErpLayout
      categoryTitle="Gestión & CRM"
      title="Clientes & Expedientes Vehiculares"
      actionButton={{
        label: "Registrar Cliente",
        onClick: () => alert("Formulario rápido de alta de cliente y vehículo"),
      }}
    >
      <div className="space-y-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#151820] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-gray-400">Total Clientes / Vehículos</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {CRM_CUSTOMERS.length} expedientes
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Registrados en la plataforma</div>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#151820] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-gray-400">Próximos a Vencer (DUE SOON)</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {CRM_CUSTOMERS.filter((c) => c.status === "DUE_SOON").length} vehículos
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Menos de 1,500 km restantes</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#151820] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-gray-400">Mantenimientos Vencidos</div>
              <div className="text-2xl font-bold font-mono text-red-400 mt-1">
                {CRM_CUSTOMERS.filter((c) => c.status === "OVERDUE").length} vehículo
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Requieren contacto urgente</div>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3 rounded-2xl bg-[#151820] border border-white/[0.06]">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por placa, cliente o WhatsApp..."
              className="w-full bg-[#1b1f28] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="flex items-center gap-2">
            {["TODOS", "OPTIMAL", "DUE_SOON", "OVERDUE"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterSeverity(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  filterSeverity === s
                    ? "bg-white text-black font-bold"
                    : "bg-[#1b1f28] text-gray-400 hover:text-white border border-white/10"
                }`}
              >
                {s === "TODOS" ? "Todos" : s}
              </button>
            ))}
          </div>
        </div>

        {/* CRM Customers Table */}
        <div className="rounded-2xl bg-[#151820] border border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-400 bg-white/[0.01]">
                  <th className="py-3.5 px-4 uppercase font-semibold">Placa</th>
                  <th className="py-3.5 px-4 uppercase font-semibold">Cliente Propietario</th>
                  <th className="py-3.5 px-4 uppercase font-semibold">Vehículo & Motor</th>
                  <th className="py-3.5 px-4 uppercase font-semibold">Odómetro Actual</th>
                  <th className="py-3.5 px-4 uppercase font-semibold">Próximo Servicio</th>
                  <th className="py-3.5 px-4 uppercase font-semibold">Estado Ciclo</th>
                  <th className="py-3.5 px-4 uppercase font-semibold text-right">WhatsApp CRM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((c) => {
                  const rem = c.nextServiceKm - c.currentKm;
                  const waMsg = encodeURIComponent(
                    `Estimado(a) ${c.name}, le saludamos de Lubricentros Estrada. Le recordamos que su vehículo con placa ${c.plate} está próximo a su cambio de aceite preventivo (${c.currentKm} km actuales). ¿Desea que reservemos su turno de atención express?`
                  );

                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        <span className="px-2.5 py-1 rounded-md bg-white/[0.08] border border-white/15 text-amber-400 font-mono text-sm tracking-wider">
                          {c.plate}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-sans font-medium text-white text-sm">{c.name}</div>
                        <span className="text-[11px] text-gray-400">DNI/RUC: {c.doc}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-200">{c.vehicleModel} ({c.year})</div>
                        <span className="text-[10px] text-gray-400">{c.engineFuel} • {c.oilApplied}</span>
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        {c.currentKm.toLocaleString()} km
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-300">{c.nextServiceKm.toLocaleString()} km</div>
                        <span className={`text-[10px] ${rem > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {rem > 0 ? `Restan ${rem.toLocaleString()} km` : `Excedido por ${Math.abs(rem)} km`}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            c.status === "OPTIMAL"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : c.status === "DUE_SOON"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <a
                          href={`https://wa.me/51${c.phone}?text=${waMsg}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black font-semibold text-xs border border-emerald-500/30 transition-all shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Notificar</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ErpLayout>
  );
}