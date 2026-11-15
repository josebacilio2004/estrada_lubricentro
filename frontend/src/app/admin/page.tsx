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
  Smartphone,
  BarChart3,
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
import {
  FilaMetricas,
  Metrica,
  ChipVariacion,
  AyudaMetrica,
  CabeceraSeccion,
  PieSeccion,
  TARJETA,
  CONTENEDOR_TABLA,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  ChipCodigo,
  Chip,
  PillEstado,
  PieTablaSimple,
  ACCION_SECUNDARIA,
  cn,
} from "@/components/khipu/khipu-ui";

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
  { fullNumber: "B001-00000412", client: "Carlos Mendoza Alarcón", plate: "ABC-123", amount: 235.0, status: "ACEPTADO", time: "Hace 12 min" },
  { fullNumber: "F001-00000189", client: "Transportes Huancayo S.A.C.", plate: "BCX-456", amount: 720.0, status: "ACEPTADO", time: "Hace 34 min" },
  { fullNumber: "B001-00000411", client: "Vanessa Torres Rivas", plate: "W1A-982", amount: 165.0, status: "ACEPTADO", time: "Hace 1 hora" },
  { fullNumber: "B001-00000410", client: "Renzo Estrada Poma", plate: "ABC-777", amount: 185.0, status: "PENDIENTE", time: "Hace 2 horas" },
  { fullNumber: "B001-00000409", client: "Jorge Luis Gómez", plate: "A9B-441", amount: 145.0, status: "ACEPTADO", time: "Hace 3 horas" },
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

  const totalFacturado = metrics?.total_month_sales
    ? Number(metrics.total_month_sales)
    : 28450.0;
  const emitidosCount = metrics?.total_month_count
    ? Number(metrics.total_month_count)
    : 164;
  const aceptadosCount = metrics?.accepted_sunat_count
    ? Number(metrics.accepted_sunat_count)
    : 161;
  const atencionCount =
    metrics?.low_stock_count !== undefined
      ? Number(metrics.low_stock_count)
      : 3;

  const conformidadPct =
    emitidosCount > 0 ? (aceptadosCount / emitidosCount) * 100 : 100;

  const chartData =
    metrics?.daily_sales_chart && metrics.daily_sales_chart.length > 0
      ? metrics.daily_sales_chart.map((d: any) => ({
          day: d.date,
          facturado: Number(d.amount),
          comprobantes: Number(d.count),
        }))
      : DAILY_SALES_DATA;

  return (
    <ErpLayout
      categoryTitle="General"
      title="Resumen y Analítica"
      actionButton={{
        label: "Emitir en Terminal POS",
        href: "/admin/pos",
      }}
    >
      {/* 1. FILA DE MÉTRICAS KHIPU (src/components/patrones/metricas.tsx) */}
      <FilaMetricas columnas={4}>
        <Metrica
          etiqueta="Total facturado"
          icono={Receipt}
          tono="acento"
          destacada
          acciones={<ChipVariacion variacion={14.2} destacada />}
          visual={{ tipo: "barra", valor: 82 }}
          ayuda="Neto de comprobantes · Actualizado hoy"
        >
          S/{" "}
          {totalFacturado.toLocaleString("es-PE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Metrica>

        <Metrica
          etiqueta="Emitidos en el período"
          icono={Calendar}
          tono="neutro"
          sufijo="CPEs"
          acciones={<ChipVariacion variacion={8.4} />}
          visual={{ tipo: "puntos", total: 10, marcados: 8 }}
          ayuda={
            <AyudaMetrica tono="neutro">
              Facturas F001 y Boletas B001 registradas
            </AyudaMetrica>
          }
        >
          {emitidosCount}
        </Metrica>

        <Metrica
          etiqueta="Aceptados con CDR"
          icono={CheckCircle2}
          tono="ok"
          sufijo={`(${conformidadPct.toFixed(1)}%)`}
          visual={{ tipo: "barra", valor: conformidadPct }}
          ayuda={
            <AyudaMetrica tono="ok">
              Conformidad electrónica SUNAT UBL 2.1
            </AyudaMetrica>
          }
        >
          {aceptadosCount}
        </Metrica>

        <Metrica
          etiqueta="Atención requerida"
          icono={AlertCircle}
          tono={atencionCount > 0 ? "aviso" : "ok"}
          sufijo="SKUs"
          visual={{
            tipo: "puntos",
            total: 8,
            marcados: Math.min(8, atencionCount),
          }}
          ayuda={
            <AyudaMetrica tono={atencionCount > 0 ? "aviso" : "ok"}>
              Alertas de reposición mínima en almacén
            </AyudaMetrica>
          }
        >
          {atencionCount}
        </Metrica>
      </FilaMetricas>

      {/* 2. SECCIÓN ANALÍTICA KHIPU (CabeceraSeccion + PieSeccion) */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Gráfico de Área Principal */}
        <div className={cn(TARJETA, "lg:col-span-8 flex flex-col justify-between")}>
          <CabeceraSeccion
            icon={TrendingUp}
            titulo="Flujo de Facturación Diaria (PEN)"
            subtitulo="Ingresos por cambios de aceite, filtros y venta en mostrador"
            derecha={<Chip>Noviembre 2026</Chip>}
          />

          <div className="h-[260px] w-full px-3 pt-2">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="khipuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4f06b" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#d4f06b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(163, 175, 199, 0.12)"
                  />
                  <XAxis
                    dataKey="day"
                    stroke="#8794ad"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#8794ad"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `S/${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "var(--foreground)",
                    }}
                    formatter={(val: any) => [
                      `S/ ${Number(val).toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}`,
                      "Facturado",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="facturado"
                    stroke="#d4f06b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#khipuGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <PieSeccion>
            <span>Moneda: Soles (PEN)</span>
            <span>·</span>
            <span>Incluye IGV 18%</span>
            <span>·</span>
            <span>Sede: Av. José Carlos Mariátegui — El Tambo, Huancayo</span>
          </PieSeccion>
        </div>

        {/* Gráfico de Barras por Marca */}
        <div className={cn(TARJETA, "lg:col-span-4 flex flex-col justify-between")}>
          <CabeceraSeccion
            icon={BarChart3}
            titulo="Rotación por Marca"
            subtitulo="Participación en ventas de lubricantes y filtros"
          />

          <div className="h-[260px] w-full px-3 pt-2">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BRAND_DISTRIBUTION} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(163, 175, 199, 0.12)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke="#8794ad"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `S/${val / 1000}k`}
                  />
                  <YAxis
                    dataKey="brand"
                    type="category"
                    stroke="#a3afc7"
                    fontSize={11.5}
                    tickLine={false}
                    axisLine={false}
                    width={78}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "var(--foreground)",
                    }}
                    formatter={(val: any) => [
                      `S/ ${Number(val).toLocaleString("es-PE")}`,
                      "Ventas",
                    ]}
                  />
                  <Bar dataKey="ventas" fill="#8fc0f7" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <PieSeccion>
            <span>Top 1: Mobil 1 Full Synthetic</span>
            <span>·</span>
            <span>256 envases despachados</span>
          </PieSeccion>
        </div>
      </div>

      {/* 3. TABLA KHIPU DE ÚLTIMOS COMPROBANTES + ACCESOS RÁPIDOS */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Tabla en Banda Redondeada Khipu */}
        <div className={cn(CONTENEDOR_TABLA, "lg:col-span-8")}>
          <CabeceraSeccion
            icon={Receipt}
            titulo="Últimos comprobantes emitidos"
            subtitulo="Transmisión en línea al PSE / OSE SUNAT"
            derecha={
              <Link href="/admin/invoices" className={ACCION_SECUNDARIA}>
                <span>Ver listado completo</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Correlativo</TableHead>
                <TableHead>Cliente / Razón Social</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead className="text-right">Importe</TableHead>
                <TableHead>Estado CDR</TableHead>
                <TableHead className="text-right">Emisión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_INVOICES.map((inv) => (
                <TableRow key={inv.fullNumber}>
                  <TableCell>
                    <ChipCodigo>{inv.fullNumber}</ChipCodigo>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {inv.client}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-etiqueta text-muted-foreground">
                      {inv.plate}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-foreground">
                    S/ {inv.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <PillEstado
                      tono={inv.status === "ACEPTADO" ? "ok" : "aviso"}
                    >
                      {inv.status === "ACEPTADO"
                        ? "Aceptado"
                        : "En proceso"}
                    </PillEstado>
                  </TableCell>
                  <TableCell className="text-right text-etiqueta text-texto-terciario tabular-nums">
                    {inv.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <PieTablaSimple
            mostrando={RECENT_INVOICES.length}
            total={emitidosCount}
            unidad="comprobantes"
            nota="RUC 20608945123 · Lubricentros Estrada S.A.C."
          />
        </div>

        {/* Módulos Operativos Directos */}
        <div className="lg:col-span-4 flex flex-col gap-2.5">
          <Link
            href="/admin/pos"
            className={cn(
              TARJETA,
              "group flex items-center justify-between p-3.5 transition-all hover:bg-secondary/60"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-acento-suave text-acento-texto dark:text-acento">
                <Store className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-titulo text-foreground">
                  Terminal POS & Pistola Móvil
                </div>
                <div className="truncate text-etiqueta text-muted-foreground">
                  Recepción automática de escaneos y ficha vehicular
                </div>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-texto-terciario transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </Link>

          <Link
            href="/admin/products"
            className={cn(
              TARJETA,
              "group flex items-center justify-between p-3.5 transition-all hover:bg-secondary/60"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-info text-info-foreground">
                <Package className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-titulo text-foreground">
                  Catálogo de Lubricantes y Filtros
                </div>
                <div className="truncate text-etiqueta text-muted-foreground">
                  Gestión de SKUs, códigos EAN-13, precios y fotos
                </div>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-texto-terciario transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </Link>

          <Link
            href="/admin/inventory"
            className={cn(
              TARJETA,
              "group flex items-center justify-between p-3.5 transition-all hover:bg-secondary/60"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning text-warning-foreground">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-titulo text-foreground">
                  Kardex y Alertas de Stock
                </div>
                <div className="truncate text-etiqueta text-muted-foreground">
                  Ajustes de entrada/salida sincronizados con App Android
                </div>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-texto-terciario transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </Link>

          <Link
            href="/admin/crm"
            className={cn(
              TARJETA,
              "group flex items-center justify-between p-3.5 transition-all hover:bg-secondary/60"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success text-success-foreground">
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-titulo text-foreground">
                  Historial Vehicular & CRM
                </div>
                <div className="truncate text-etiqueta text-muted-foreground">
                  Búsqueda por placa, kilometraje y próximo cambio
                </div>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-texto-terciario transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </Link>

          <a
            href="/estrada_erp_mobile.apk"
            download
            className={cn(
              TARJETA,
              "group flex items-center justify-between p-3.5 border-acento-borde bg-acento-suave/60 transition-all hover:bg-acento-suave"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-acento text-acento-texto">
                <Smartphone className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-titulo text-foreground">
                  Descargar App Móvil Estrada v1.2.1
                </div>
                <div className="truncate text-etiqueta text-muted-foreground">
                  Escáner láser HD 1080p para Inventario y POS
                </div>
              </div>
            </div>
            <ChipCodigo>APK</ChipCodigo>
          </a>
        </div>
      </div>
    </ErpLayout>
  );
}
