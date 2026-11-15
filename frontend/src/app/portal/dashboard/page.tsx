"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Car,
  Calendar,
  Gauge,
  Activity,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  FileText,
  LogOut,
  Sparkles,
  MessageSquare,
  ChevronRight,
  RefreshCw,
  Zap,
} from "lucide-react";

interface VehicleData {
  id: string;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  engine_fuel: string;
  usage_profile: string;
  daily_avg_km: number;
  current_odometer: number;
}

interface CustomerData {
  id: string;
  doc_number: string;
  full_name: string;
  phone_whatsapp: string;
  email: string;
}

interface PreventiveData {
  vehicle_id: string;
  license_plate: string;
  current_odometer: number;
  last_service_mileage: number;
  next_service_mileage: number;
  remaining_km: number;
  percentage_used: number;
  status_severity: "OPTIMAL" | "DUE_SOON" | "OVERDUE";
  last_service_date: string;
  estimated_next_date: string;
  oil_applied_name: string;
  oil_viscosity: string;
  pending_items: Array<{
    id: string;
    item_type: string;
    title: string;
    urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    recommended_km: number;
    estimated_cost: string | number;
    status: string;
    notes: string;
    created_at: string;
  }>;
}

interface HistoryItem {
  id: string;
  service_date: string;
  mileage_at_service: number;
  next_service_mileage: number;
  oil_applied_name: string;
  oil_viscosity: string;
  changed_oil_filter: boolean;
  changed_air_filter: boolean;
  changed_cabin_filter: boolean;
  estimated_next_date: string;
  lifecycle_status: string;
  full_number: string;
  total_amount: string | number;
}

export default function PortalDashboardPage() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [preventive, setPreventive] = useState<PreventiveData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"preventive" | "history" | "specs">("preventive");
  const [loading, setLoading] = useState(true);

  const loadData = async (plate: string) => {
    setLoading(true);
    try {
      const apiUrl = typeof window !== "undefined" ? "/v1" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1");

      const [prevRes, histRes] = await Promise.all([
        fetch(`${apiUrl}/portal/maintenance/preventive?plate=${encodeURIComponent(plate)}`),
        fetch(`${apiUrl}/portal/history?plate=${encodeURIComponent(plate)}`),
      ]);

      const prevData = await prevRes.json();
      const histData = await histRes.json();

      if (prevData.success) setPreventive(prevData.data);
      if (histData.success && histData.data) setHistory(histData.data);
    } catch (e) {
      console.error("Error cargando telemetría del portal:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const rawVeh = localStorage.getItem("estrada_portal_vehicle");
    const rawCust = localStorage.getItem("estrada_portal_customer");

    if (!rawVeh) {
      router.push("/portal");
      return;
    }

    try {
      const v: VehicleData = JSON.parse(rawVeh);
      const c: CustomerData = rawCust ? JSON.parse(rawCust) : null;
      setVehicle(v);
      setCustomer(c);
      loadData(v.license_plate);
    } catch {
      router.push("/portal");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("estrada_portal_token");
    localStorage.removeItem("estrada_portal_vehicle");
    localStorage.removeItem("estrada_portal_customer");
    router.push("/portal");
  };

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center text-text-dim font-mono text-xs">
        Cargando telemetría vehicular...
      </div>
    );
  }

  const remaining = preventive?.remaining_km ?? 1200;
  const pct = Math.min(100, Math.max(0, preventive?.percentage_used ?? 80));

  const severityColor =
    preventive?.status_severity === "OVERDUE"
      ? "text-red-400 bg-red-500/10 border-red-500/30"
      : preventive?.status_severity === "DUE_SOON"
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

  const severityText =
    preventive?.status_severity === "OVERDUE"
      ? "Mantenimiento Vencido"
      : preventive?.status_severity === "DUE_SOON"
      ? "Próximo a Servicio"
      : "Lubricación Óptima";

  return (
    <div className="min-h-screen bg-ink-950 text-text-hi flex flex-col font-body selection:bg-ember-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-white/[0.08] bg-ink-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display font-extrabold text-xl tracking-[0.2em] text-white">
              ESTRAD<span className="text-ember-500">A</span>
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-xs font-mono text-text-dim hidden sm:inline">PORTAL CLIENTE</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-white block">{customer?.full_name}</span>
              <span className="text-[10px] font-mono text-text-dim block">{customer?.doc_number}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-xs font-mono text-text-lo hover:text-white border border-white/10 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 space-y-8">
        
        {/* Vehicle Telemetry Hero Card */}
        <div className="rounded-3xl bg-gradient-to-r from-ink-900 via-ink-900/90 to-ink-950 border border-white/15 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-ember-500/10 blur-[130px] pointer-events-none rounded-full" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Plate & Vehicle Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              
              {/* Peruvian Embossed License Plate */}
              <div className="w-48 bg-gradient-to-b from-white to-gray-200 border-2 border-black rounded-lg p-2 shadow-2xl flex flex-col items-center flex-shrink-0">
                <div className="w-full flex items-center justify-between text-[9px] font-mono font-bold text-black border-b border-black/30 pb-0.5 mb-0.5">
                  <span className="text-red-600">PERÚ</span>
                  <span className="text-gray-700">ESTRADA</span>
                </div>
                <span className="font-display font-black text-2xl tracking-[0.2em] text-black">
                  {vehicle.license_plate}
                </span>
              </div>

              {/* Specs Details */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                    {vehicle.brand} {vehicle.model}
                  </h1>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.08] text-white/80">
                    {vehicle.year}
                  </span>
                </div>
                <p className="text-xs font-mono text-text-lo flex items-center gap-3">
                  <span>Combustible: <strong className="text-white">{vehicle.engine_fuel}</strong></span>
                  <span className="text-white/20">•</span>
                  <span>Uso: <strong className="text-white">{vehicle.usage_profile}</strong></span>
                  <span className="text-white/20">•</span>
                  <span>Promedio: <strong className="text-white">{vehicle.daily_avg_km} km/día</strong></span>
                </p>
              </div>

            </div>

            {/* Right: Current Odometer & Status Pill */}
            <div className="flex sm:items-center gap-4 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center font-mono">
                <span className="text-[10px] text-text-dim block uppercase">Odómetro Actual</span>
                <span className="font-display font-black text-2xl text-white block mt-0.5">
                  {preventive?.current_odometer.toLocaleString()} km
                </span>
              </div>

              <div className={`p-4 rounded-2xl border text-center font-mono ${severityColor}`}>
                <span className="text-[10px] block uppercase opacity-75">Estado de Servicio</span>
                <span className="font-bold text-sm block mt-0.5">{severityText}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("preventive")}
            className={`px-5 py-2.5 rounded-full transition-all flex items-center gap-2 ${
              activeTab === "preventive"
                ? "bg-ember-500 text-white font-bold shadow-lg shadow-ember-500/25"
                : "bg-white/[0.04] text-text-lo hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Mantenimiento Preventivo & Pendientes</span>
            {preventive && preventive.pending_items.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                {preventive.pending_items.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2.5 rounded-full transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-ember-500 text-white font-bold shadow-lg shadow-ember-500/25"
                : "bg-white/[0.04] text-text-lo hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Historial Clínico de Servicios</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`px-5 py-2.5 rounded-full transition-all flex items-center gap-2 ${
              activeTab === "specs"
                ? "bg-ember-500 text-white font-bold shadow-lg shadow-ember-500/25"
                : "bg-white/[0.04] text-text-lo hover:text-white"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Ficha de Fábrica & Fluidos</span>
          </button>
        </div>

        {/* TAB 1: MANTENIMIENTO PREVENTIVO & PENDIENTES */}
        {activeTab === "preventive" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Oil Life Cycle Meter Card */}
            <div className="rounded-3xl bg-ink-900 border border-white/15 p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-ember-400 font-semibold tracking-wider uppercase block">
                    CICLO DE VIDA DEL LUBRICANTE EN MOTOR
                  </span>
                  <h3 className="font-display font-extrabold text-xl text-white mt-1">
                    {preventive?.oil_applied_name || "Lubricante Sintético Homologado"}
                  </h3>
                  <span className="text-xs font-mono text-text-lo mt-0.5 block">
                    Viscosidad recomendada: <strong className="text-white">{preventive?.oil_viscosity || "5W-30"}</strong>
                  </span>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs text-text-dim block">Kilometraje Restante</span>
                  <span className={`font-display font-black text-3xl ${remaining <= 1000 ? "text-amber-400" : "text-emerald-400"}`}>
                    {remaining > 0 ? `${remaining.toLocaleString()} km` : "VENCIDO"}
                  </span>
                </div>
              </div>

              {/* Progress Bar Gauge */}
              <div className="space-y-2">
                <div className="w-full h-3 rounded-full bg-white/[0.06] overflow-hidden p-0.5 border border-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      pct >= 90 ? "bg-red-500" : pct >= 75 ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-text-dim">
                  <span>Último cambio: {preventive?.last_service_mileage.toLocaleString()} km</span>
                  <span>Uso: {pct.toFixed(0)}%</span>
                  <span>Próximo objetivo: {preventive?.next_service_mileage.toLocaleString()} km</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <span className="text-[10px] text-text-dim block uppercase">Fecha Estimada de Cambio</span>
                  <span className="font-bold text-white block mt-1">
                    {preventive?.estimated_next_date
                      ? new Date(preventive.estimated_next_date).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })
                      : "Pronto"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <span className="text-[10px] text-text-dim block uppercase">Intervalo Total de Servicio</span>
                  <span className="font-bold text-white block mt-1">10,000 km (100% Sintético)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-dim block uppercase">¿Necesitas agendar?</span>
                    <span className="font-bold text-emerald-400 block mt-1">Atención Express</span>
                  </div>
                  <a
                    href={`https://wa.me/51987654321?text=${encodeURIComponent(`Hola Lubricentros Estrada, soy cliente con vehículo ${vehicle.license_plate} (${vehicle.brand} ${vehicle.model}). Deseo agendar mi próximo cambio de aceite.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                    title="Agendar por WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>

            </div>

            {/* Pending Items & Repairs Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-white uppercase flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-ember-500" />
                    <span>Mantenimientos & Repuestos Pendientes</span>
                  </h3>
                  <p className="text-xs text-text-lo">
                    Ítems diagnosticados por el mecánico durante inspecciones técnicas en bahía.
                  </p>
                </div>
                <span className="text-xs font-mono text-text-dim">
                  Total: {preventive?.pending_items.length || 0} pendientes
                </span>
              </div>

              {(!preventive?.pending_items || preventive.pending_items.length === 0) ? (
                <div className="p-8 rounded-2xl bg-ink-900 border border-white/10 text-center text-text-dim font-mono text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <span>Tu vehículo no tiene repuestos o servicios pendientes reportados. ¡Todo al día!</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preventive.pending_items.map((item) => {
                    const urgencyBadge =
                      item.urgency === "CRITICAL"
                        ? "bg-red-500/15 text-red-400 border-red-500/30"
                        : item.urgency === "HIGH"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        : "bg-white/[0.06] text-text-lo border-white/10";

                    const whatsappItemMsg = encodeURIComponent(
                      `Hola Lubricentros Estrada, para mi vehículo placa ${vehicle.license_plate}, deseo cotizar y agendar el cambio de: ${item.title} (Estimado: S/ ${item.estimated_cost}).`
                    );

                    return (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl bg-ink-900 border border-white/10 flex flex-col justify-between space-y-4 hover:border-ember-500/40 transition-colors shadow-lg"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${urgencyBadge}`}>
                              URGENCIA {item.urgency}
                            </span>
                            <span className="font-mono font-bold text-xs text-ember-400">
                              Estimado: S/ {Number(item.estimated_cost).toFixed(2)}
                            </span>
                          </div>

                          <h4 className="font-display font-bold text-base text-white">
                            {item.title}
                          </h4>

                          <p className="text-xs text-text-lo leading-relaxed font-light">
                            {item.notes}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[11px] font-mono text-text-dim">
                            Programado para: {item.recommended_km ? `${item.recommended_km.toLocaleString()} km` : "Próxima visita"}
                          </span>

                          <a
                            href={`https://wa.me/51987654321?text=${whatsappItemMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ember-500 hover:bg-ember-600 text-white font-semibold text-[11px] transition-all shadow-md shadow-ember-500/20"
                          >
                            <span>Agendar Repuesto</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 2: HISTORIAL CLÍNICO DE SERVICIOS */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-xl text-white uppercase flex items-center gap-2">
                  <FileText className="w-5 h-5 text-ember-500" />
                  <span>Historial Clínico del Vehículo</span>
                </h3>
                <p className="text-xs text-text-lo">
                  Registro cronológico inmutable de servicios, insumos aplicados y comprobantes electrónicos.
                </p>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="p-8 rounded-2xl bg-ink-900 border border-white/10 text-center text-text-dim font-mono text-xs">
                No hay servicios registrados previamente para este vehículo.
              </div>
            ) : (
              <div className="relative border-l-2 border-white/10 ml-4 pl-6 space-y-8">
                {history.map((h, idx) => (
                  <div key={h.id || idx} className="relative group">
                    {/* Circle Node */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-ink-950 border-2 border-ember-500 group-hover:scale-125 transition-transform" />

                    <div className="p-6 rounded-2xl bg-ink-900 border border-white/10 space-y-4 hover:border-white/20 transition-colors shadow-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div>
                          <span className="text-[10px] font-mono text-ember-400 font-semibold uppercase">
                            Mantenimiento Preventivo Integral
                          </span>
                          <h4 className="font-display font-bold text-lg text-white">
                            {new Date(h.service_date).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="px-3 py-1 rounded bg-white/[0.04] border border-white/10 text-xs font-bold text-white">
                            {h.mileage_at_service.toLocaleString()} km
                          </span>
                          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                            {h.full_number}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-text-dim block uppercase">Lubricante Motor</span>
                          <span className="text-white font-medium block mt-0.5">{h.oil_applied_name}</span>
                          <span className="text-[10px] text-text-lo">Grado: {h.oil_viscosity}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-text-dim block uppercase">Filtros Reemplazados</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {h.changed_oil_filter && (
                              <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[10px] text-white">Filtro Aceite</span>
                            )}
                            {h.changed_air_filter && (
                              <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[10px] text-white">Filtro Aire</span>
                            )}
                            {h.changed_cabin_filter && (
                              <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[10px] text-white">Filtro Cabina</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-text-dim block uppercase">Total Invertido</span>
                          <span className="text-sm font-display font-bold text-ember-400 block mt-0.5">
                            S/ {Number(h.total_amount).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-text-lo">SUNAT Comprobante Electrónico</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FICHA DE FÁBRICA & FLUIDOS */}
        {activeTab === "specs" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div className="p-6 rounded-3xl bg-ink-900 border border-white/10 space-y-4">
              <h4 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Car className="w-5 h-5 text-ember-500" />
                <span>Recomendaciones del Fabricante (OEM)</span>
              </h4>
              <ul className="space-y-2 text-xs text-text-lo font-mono">
                <li className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span>Norma API Requerida:</span>
                  <span className="text-white font-semibold">API SP / Resource Conserving</span>
                </li>
                <li className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span>Viscosidades Homologadas:</span>
                  <span className="text-white font-semibold">0W-20 / 5W-30 Full Synthetic</span>
                </li>
                <li className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span>Capacidad del Cárter:</span>
                  <span className="text-white font-semibold">4.4 Cuartos (con filtro)</span>
                </li>
                <li className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span>Líquido de Frenos:</span>
                  <span className="text-white font-semibold">DOT 4 High Performance</span>
                </li>
                <li className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span>Refrigerante:</span>
                  <span className="text-white font-semibold">Super Long Life Coolant 50/50</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-ink-900 border border-white/10 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Garantía de Servicio Estrada</span>
                </h4>
                <p className="text-xs text-text-lo mt-2 leading-relaxed font-light">
                  Todos los aceites aplicados cuentan con trazabilidad certificada directamente desde las importadoras oficiales de Mobil 1, Castrol, Motul y Shell. Cada cambio incluye mano de obra calificada, inspección de 25 puntos y garantía de 10,000 km.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs font-mono">
                <span className="text-emerald-400 font-bold block mb-1">● Taller Central Huancayo</span>
                <span className="text-text-lo block">Av. Mariátegui • Plus Code: WQQ9+7JR</span>
                <span className="text-text-dim block mt-1">Horario: Lun - Sáb: 8:00 AM - 7:00 PM</span>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
