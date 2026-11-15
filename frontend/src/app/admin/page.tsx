"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ErpLayout } from "@/components/admin/ErpLayout";
import {
  TrendingUp,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Package,
  Store,
  Users,
  Calendar,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Datos de facturación mensual para Recharts
const DAILY_SALES_DATA = [
  { day: "01 Nov", facturado: 1850, comprobantes: 12 },
  { day: "02 Nov", facturado: 2400, comprobantes: 15 },
  { day: "03 Nov", facturado: 3100, comprobantes: 18 },
  { day: "04 Nov", facturado: 2950, comprobantes: 16 },
  { day: "05 Nov", facturado: 3800, comprobantes: 22 },
  { day: "06 Nov", facturado: 4200, comprobantes: 25 },
  { day: "07 Nov", facturado: 3900, comprobantes: 21 },
  { day: "08 Nov", facturado: 4600, comprobantes: 28 },
  { day: "09 Nov", facturado: 5100, comprobantes: 30 },
  { day: "10 Nov", facturado: 4850, comprobantes: 27 },
];

const BRAND_DISTRIBUTION = [
  { brand: "Mobil 1", ventas: 9400, galones: 51 },
  { brand: "Castrol", ventas: 8200, galones: 48 },
  { brand: "Motul", ventas: 7100, galones: 39 },
  { brand: "Liqui Moly", ventas: 6400, galones: 28 },
  { brand: "Shell", ventas: 4800, galones: 25 },
  { brand: "Filtros OEM", ventas: 3900, galones: 65 },
];

const RECENT_INVOICES = [
  { fullNumber: "B001-0000412", client: "Carlos Mendoza Alarcón", plate: "ABC-123", amount: 235.0, status: "ACEPTADO", time: "Hace 12 min" },
  { fullNumber: "F001-0000189", client: "Transportes Huancayo SAC", plate: "BCX-456", amount: 720.0, status: "ACEPTADO", time: "Hace 34 min" },
  { fullNumber: "B001-0000411", client: "Vanessa Torres Rivas", plate: "W1A-982", amount: 165.0, status: "ACEPTADO", time: "Hace 1 hora" },
  { fullNumber: "B001-0000410", client: "Renzo Estrada Poma", plate: "ABC-777", amount: 185.0, status: "PENDIENTE", time: "Hace 2 horas" },
  { fullNumber: "B001-0000409", client: "Jorge Luis Gómez", plate: "A9B-441", amount: 145.0, status: "ACEPTADO", time: "Hace 3 horas" },
];

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/v1/analytics/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setMetrics(data.data);
        }
      })
      .catch((err) => console.warn("Fallback analytics", err));
  }, []);

  const totalFacturado = metrics?.total_month_sales ? Number(metrics.total_month_sales) : 28450.0;
  const emitidosCount = metrics?.total_month_count ? Number(metrics.total_month_count) : 164;
  const aceptadosCount = metrics?.accepted_sunat_count ? Number(metrics.accepted_sunat_count) : 161;
  const atencionCount = metrics?.low_stock_count !== undefined ? Number(metrics.low_stock_count) : 3;
  const chartData = (metrics?.daily_sales_chart && metrics.daily_sales_chart.length > 0)
    ? metrics.daily_sales_chart.map((d: any) => ({
        day: d.date,
        facturado: Number(d.amount),
        comprobantes: Number(d.count),
      }))
    : DAILY_SALES_DATA;

  return (
    <ErpLayout
      categoryTitle="Panel"
      title="Inicio / Dashboard"
      actionButton={{
        label: "Nueva Venta / POS",
        href: "/admin/pos",
      }}
    >
      <div className="space-y-8">
        
        {/* 1. TOP 4 METRIC CARDS (Exact styling from reference screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Facturado */}
          <div className="rounded-2xl bg-[#151820] border border-white/[0.06] p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
              <Receipt className="w-4 h-4 text-gray-400" />
              <span>Total facturado</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold font-mono tracking-tight text-white">
                S/ {totalFacturado.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Neto de comprobantes • <span className="text-emerald-400 font-medium">Actualizado</span> este mes
              </div>
            </div>
          </div>

          {/* Card 2: Emitidos en el período */}
          <div className="rounded-2xl bg-[#151820] border border-white/[0.06] p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Emitidos en el período</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold font-mono tracking-tight text-white">
                {emitidosCount}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Total comprobantes registrados
              </div>
            </div>
          </div>

          {/* Card 3: Aceptados con CDR */}
          <div className="rounded-2xl bg-[#151820] border border-white/[0.06] p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Aceptados con CDR</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
                {aceptadosCount}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Conformidad SUNAT {emitidosCount > 0 ? ((aceptadosCount / emitidosCount) * 100).toFixed(1) : 100}%
              </div>
            </div>
          </div>

          {/* Card 4: Atención requerida */}
          <div className="rounded-2xl bg-[#151820] border border-white/[0.06] p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Atención requerida</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold font-mono tracking-tight text-amber-400">
                {atencionCount}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Alertas de stock bajo en lubricantes
              </div>
            </div>
          </div>

        </div>

        {/* 2. RECHARTS ANALYTICS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Area Chart: Evolución de Facturación Diaria */}
          <div className="lg:col-span-8 rounded-2xl bg-[#151820] border border-white/[0.06] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Flujo de Facturación y Ventas (S/.)
                </h3>
                <p className="text-xs text-gray-400">
                  Ingresos diarios por cambios de lubricante y venta en mostrador
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.06] text-white">Noviembre 2026</span>
              </div>
            </div>

            <div className="h-[280px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorFacturado" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f26a1b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f26a1b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222630" />
                    <XAxis dataKey="day" stroke="#6b7280" fontSize={11} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} tickFormatter={(val) => `S/${val}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1c2029", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
                      formatter={(val: any) => [`S/ ${val.toLocaleString()}`, "Venta Total"]}
                    />
                    <Area type="monotone" dataKey="facturado" stroke="#f26a1b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFacturado)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bar Chart: Ventas por Marca de Lubricante */}
          <div className="lg:col-span-4 rounded-2xl bg-[#151820] border border-white/[0.06] p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white">
                Ventas por Marca / Línea
              </h3>
              <p className="text-xs text-gray-400">
                Rotación de inventario en el período
              </p>
            </div>

            <div className="h-[280px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={BRAND_DISTRIBUTION} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#222630" horizontal={false} />
                    <XAxis type="number" stroke="#6b7280" fontSize={10} tickFormatter={(val) => `S/${val/1000}k`} />
                    <YAxis dataKey="brand" type="category" stroke="#8b949e" fontSize={11} tickLine={false} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1c2029", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
                      formatter={(val: any) => [`S/ ${val.toLocaleString()}`, "Total"]}
                    />
                    <Bar dataKey="ventas" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

        {/* 3. RECENT ACTIVITY & DIRECT SHORTCUTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Ultimos Comprobantes */}
          <div className="lg:col-span-8 rounded-2xl bg-[#151820] border border-white/[0.06] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                Últimos Comprobantes Emitidos
              </h3>
              <Link href="/admin/invoices" className="text-xs font-mono text-emerald-400 hover:underline">
                Ver todos los comprobantes →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.06] text-gray-500 uppercase">
                    <th className="py-2.5">Comprobante</th>
                    <th className="py-2.5">Cliente / Placa</th>
                    <th className="py-2.5">Importe</th>
                    <th className="py-2.5">Estado SUNAT</th>
                    <th className="py-2.5">Tiempo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {RECENT_INVOICES.map((inv) => (
                    <tr key={inv.fullNumber} className="hover:bg-white/[0.02]">
                      <td className="py-3 font-bold text-white">{inv.fullNumber}</td>
                      <td className="py-3">
                        <span className="text-gray-200 block font-sans">{inv.client}</span>
                        <span className="text-[10px] text-gray-500">{inv.plate}</span>
                      </td>
                      <td className="py-3 text-white font-semibold">S/ {inv.amount.toFixed(2)}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === "ACEPTADO"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 text-[11px]">{inv.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Access Tiles */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              Accesos Rápidos del Administrador
            </h3>

            <Link
              href="/admin/pos"
              className="p-4 rounded-xl bg-[#151820] border border-white/[0.06] hover:border-ember-500/50 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-ember-500/10 text-ember-400">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-ember-400 transition-colors">
                    Terminal POS
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Cobro ágil y lector de placas
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white" />
            </Link>

            <Link
              href="/admin/products"
              className="p-4 rounded-xl bg-[#151820] border border-white/[0.06] hover:border-emerald-500/50 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    Catálogo de Productos
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Cargar, editar precios y stock
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white" />
            </Link>

            <Link
              href="/admin/crm"
              className="p-4 rounded-xl bg-[#151820] border border-white/[0.06] hover:border-cyan-500/50 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    Clientes & CRM
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Placas y recordatorios WhatsApp
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white" />
            </Link>
          </div>

        </div>

      </div>
    </ErpLayout>
  );
}