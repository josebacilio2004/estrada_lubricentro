"use client";

import React, { useState, useEffect } from "react";
import { ErpLayout } from "@/components/admin/ErpLayout";
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Search,
  Download,
  FileSpreadsheet,
  RotateCw,
  Eye,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  fullNumber: string;
  docType: "BOLETA" | "FACTURA";
  clientName: string;
  clientDoc: string;
  plate: string;
  issueDate: string;
  amount: number;
  sunatStatus: "ACEPTADO" | "PENDIENTE" | "RECHAZADO";
  cdrCode: string;
}

const SAMPLE_INVOICES: InvoiceItem[] = [
  {
    id: "1",
    fullNumber: "B001-0000412",
    docType: "BOLETA",
    clientName: "Carlos Mendoza Alarcón",
    clientDoc: "10458923",
    plate: "ABC-123",
    issueDate: "2026-11-03 18:42",
    amount: 235.0,
    sunatStatus: "ACEPTADO",
    cdrCode: "0 - Aceptado con CDR por SUNAT",
  },
  {
    id: "2",
    fullNumber: "F001-0000189",
    docType: "FACTURA",
    clientName: "Transportes Huancayo SAC",
    clientDoc: "20608912345",
    plate: "BCX-456",
    issueDate: "2026-11-03 17:15",
    amount: 720.0,
    sunatStatus: "ACEPTADO",
    cdrCode: "0 - Aceptado con CDR por SUNAT",
  },
  {
    id: "3",
    fullNumber: "B001-0000411",
    docType: "BOLETA",
    clientName: "Vanessa Torres Rivas",
    clientDoc: "45891230",
    plate: "W1A-982",
    issueDate: "2026-11-03 15:30",
    amount: 165.0,
    sunatStatus: "ACEPTADO",
    cdrCode: "0 - Aceptado con CDR por SUNAT",
  },
  {
    id: "4",
    fullNumber: "B001-0000410",
    docType: "BOLETA",
    clientName: "Renzo Estrada Poma",
    clientDoc: "72194850",
    plate: "ABC-777",
    issueDate: "2026-11-03 14:10",
    amount: 185.0,
    sunatStatus: "PENDIENTE",
    cdrCode: "En cola de sincronización OSE",
  },
  {
    id: "5",
    fullNumber: "B001-0000409",
    docType: "BOLETA",
    clientName: "Jorge Luis Gómez",
    clientDoc: "41982341",
    plate: "A9B-441",
    issueDate: "2026-11-03 11:20",
    amount: 145.0,
    sunatStatus: "ACEPTADO",
    cdrCode: "0 - Aceptado con CDR por SUNAT",
  },
  {
    id: "6",
    fullNumber: "F001-0000188",
    docType: "FACTURA",
    clientName: "Inversiones Centro Minero EIRL",
    clientDoc: "20489123891",
    plate: "B7V-882",
    issueDate: "2026-11-02 16:50",
    amount: 890.0,
    sunatStatus: "ACEPTADO",
    cdrCode: "0 - Aceptado con CDR por SUNAT",
  },
  {
    id: "7",
    fullNumber: "B001-0000408",
    docType: "BOLETA",
    clientName: "María Fernández Quispe",
    clientDoc: "47812904",
    plate: "C1A-202",
    issueDate: "2026-11-02 14:15",
    amount: 110.0,
    sunatStatus: "ACEPTADO",
    cdrCode: "0 - Aceptado con CDR por SUNAT",
  },
];

export default function InvoicesAdminPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(SAMPLE_INVOICES);
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [filterType, setFilterType] = useState("TODOS");
  const [filterSeries, setFilterSeries] = useState("TODAS");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/v1/sales")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          const mapped = data.data.map((s: any) => ({
            id: s.id,
            fullNumber: s.full_number,
            docType: s.doc_type_code === "01" ? "FACTURA" : "BOLETA",
            clientName: s.customer_name,
            clientDoc: s.customer_doc,
            plate: s.license_plate || "PARTICULAR",
            issueDate: new Date(s.issue_date).toLocaleString("es-PE", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            amount: Number(s.total_amount),
            sunatStatus: s.sunat_status === "ACCEPTED" ? "ACEPTADO" : "PENDIENTE",
            cdrCode: s.sunat_status === "ACCEPTED" ? "0 - Aceptado con CDR por SUNAT" : "En cola de sincronización OSE",
          }));
          setInvoices(mapped);
        }
      })
      .catch((e) => console.warn("Fallback invoices", e));
  }, []);

  const filtered = invoices.filter((inv) => {
    if (filterStatus !== "TODOS" && inv.sunatStatus !== filterStatus) return false;
    if (filterType !== "TODOS" && inv.docType !== filterType) return false;
    if (filterSeries !== "TODAS" && !inv.fullNumber.startsWith(filterSeries)) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        inv.fullNumber.toLowerCase().includes(q) ||
        inv.clientName.toLowerCase().includes(q) ||
        inv.clientDoc.includes(q) ||
        inv.plate.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <ErpLayout
      categoryTitle="Facturación"
      title="Comprobantes"
      actionButton={{
        label: "Nuevo Comprobante",
        href: "/admin/pos",
      }}
    >
      <div className="space-y-6">
        
        {/* 1. TOP 4 METRIC CARDS (Exact match to screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="rounded-2xl bg-[#151820] border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
              <Receipt className="w-4 h-4 text-gray-400" />
              <span>Total facturado</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold font-mono tracking-tight text-white">
                S/ 28,450.00
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Neto de notas de crédito • Este mes
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#151820] border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Emitidos en el período</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold font-mono tracking-tight text-white">
                164
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Este mes
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#151820] border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Aceptados con CDR</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
                161
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Conformidad SUNAT
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#151820] border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Atención requerida</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold font-mono tracking-tight text-amber-400">
                3
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Pendientes de envío
              </div>
            </div>
          </div>

        </div>

        {/* 2. HORIZONTAL FILTER BAR (Matching screenshot pills) */}
        <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-[#151820] border border-white/[0.06] text-xs">
          
          {/* Estado SUNAT */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#1b1f28] border border-white/10 rounded-xl px-3 py-2 text-gray-300 focus:outline-none focus:border-white/30"
          >
            <option value="TODOS">Estado SUNAT: Todos</option>
            <option value="ACEPTADO">Aceptado con CDR</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>

          {/* Tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#1b1f28] border border-white/10 rounded-xl px-3 py-2 text-gray-300 focus:outline-none focus:border-white/30"
          >
            <option value="TODOS">Tipo: Todos</option>
            <option value="BOLETA">Boleta Electrónica</option>
            <option value="FACTURA">Factura Electrónica</option>
          </select>

          {/* Serie */}
          <select
            value={filterSeries}
            onChange={(e) => setFilterSeries(e.target.value)}
            className="bg-[#1b1f28] border border-white/10 rounded-xl px-3 py-2 text-gray-300 focus:outline-none focus:border-white/30"
          >
            <option value="TODAS">Serie: Todas</option>
            <option value="B001">B001</option>
            <option value="F001">F001</option>
          </select>

          {/* Search cliente o documento */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cliente o documento..."
              className="w-full bg-[#1b1f28] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Rango Desde / Hasta */}
          <input
            type="date"
            className="bg-[#1b1f28] border border-white/10 rounded-xl px-3 py-2 text-gray-300 focus:outline-none"
          />
          <input
            type="date"
            className="bg-[#1b1f28] border border-white/10 rounded-xl px-3 py-2 text-gray-300 focus:outline-none"
          />

          {/* Actions: Descargar ZIP & Exportar */}
          <button
            type="button"
            onClick={() => alert("Descargando paquete XML/CDR en ZIP...")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1b1f28] border border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar ZIP</span>
          </button>

          <button
            type="button"
            onClick={() => alert("Exportando libro de ventas a Excel...")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1b1f28] border border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </button>

          <button
            type="button"
            onClick={() => window.location.reload()}
            title="Refrescar datos"
            className="p-2 rounded-xl bg-[#1b1f28] border border-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

        </div>

        {/* 3. TABLE VIEW (Exact replica of screenshot headers) */}
        <div className="rounded-2xl bg-[#151820] border border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-400 bg-white/[0.01]">
                  <th className="py-3.5 px-4 font-semibold uppercase">Comprobante</th>
                  <th className="py-3.5 px-4 font-semibold uppercase">Cliente / Receptor</th>
                  <th className="py-3.5 px-4 font-semibold uppercase">Fecha & Emisión</th>
                  <th className="py-3.5 px-4 font-semibold uppercase">Importe Total</th>
                  <th className="py-3.5 px-4 font-semibold uppercase">Estado SUNAT</th>
                  <th className="py-3.5 px-4 font-semibold uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-400">
                          {inv.docType === "FACTURA" ? "FAC" : "BOL"}
                        </span>
                        <span>{inv.fullNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-sans font-medium text-white">{inv.clientName}</div>
                      <div className="text-[11px] text-gray-400">
                        Doc: {inv.clientDoc} • <span className="text-amber-400">Placa {inv.plate}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {inv.issueDate}
                    </td>
                    <td className="py-4 px-4 font-bold text-white text-sm">
                      S/ {inv.amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          inv.sunatStatus === "ACEPTADO"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${inv.sunatStatus === "ACEPTADO" ? "bg-emerald-400" : "bg-amber-400"}`} />
                        <span>{inv.sunatStatus}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => alert(`Visualizando PDF A4 / 80mm de ${inv.fullNumber}`)}
                          title="Imprimir ticket 80mm"
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-gray-300 hover:text-white transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Descargando XML SUNAT y CDR firmado para ${inv.fullNumber}`)}
                          title="Descargar XML y CDR"
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-gray-300 hover:text-white transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. PAGINATION FOOTER (Exact match to screenshot) */}
          <div className="p-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-400">
            <div>
              Mostrando <span className="text-white font-semibold">1-{filtered.length}</span> de <span className="text-white font-semibold">164</span> comprobantes
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[11px]">
                <span>Filas:</span>
                <span className="px-2 py-0.5 rounded bg-white text-black font-bold">10</span>
                <span className="px-1 text-gray-500 cursor-pointer hover:text-white">20</span>
                <span className="px-1 text-gray-500 cursor-pointer hover:text-white">50</span>
              </div>

              <div className="hidden md:inline text-[11px] text-gray-400">
                Plazo máx. envío SUNAT: 3 días calendario
              </div>

              <div className="flex items-center gap-1">
                <button type="button" className="p-1 rounded bg-white/[0.04] text-gray-500 hover:text-white disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="w-6 h-6 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <button type="button" className="p-1 rounded bg-white/[0.04] text-gray-500 hover:text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </ErpLayout>
  );
}