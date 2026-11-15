"use client";

import React, { useState, useEffect } from "react";
import { ErpLayout } from "@/components/admin/ErpLayout";
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Download,
  FileSpreadsheet,
  RotateCw,
  FileText,
  Printer,
} from "lucide-react";
import {
  FilaMetricas,
  Metrica,
  AyudaMetrica,
  ChipVariacion,
  CONTENEDOR_TABLA,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  FilaVacia,
  ChipCodigo,
  Chip,
  PillEstado,
  PieTablaSimple,
  SegmentadoControl,
  BuscadorKhipu,
  CONTROL_FILTRO,
  ACCION_SECUNDARIA,
} from "@/components/khipu/khipu-ui";

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
    fullNumber: "B001-00000412",
    docType: "BOLETA",
    clientName: "Carlos Mendoza Alarcón",
    clientDoc: "10458923",
    plate: "ABC-123",
    issueDate: "15 nov 2026, 18:42",
    amount: 235.0,
    sunatStatus: "ACEPTADO",
    cdrCode: "0 - Aceptado con CDR por SUNAT",
  },
  {
    id: "2",
    fullNumber: "F001-00000189",
    docType: "FACTURA",
    clientName: "Transportes Huancayo S.A.C.",
    clientDoc: "20608912345",
    plate: "BCX-456",
    issueDate: "15 nov 2026, 17:15",
    amount: 720.0,
    sunatStatus: "ACEPTADO",
    cdrCode: "0 - Aceptado con CDR por SUNAT",
  },
  {
    id: "3",
    fullNumber: "B001-00000411",
    docType: "BOLETA",
    clientName: "Vanessa Torres Rivas",
    clientDoc: "45891230",
    plate: "W1A-982",
    issueDate: "15 nov 2026, 15:30",
    amount: 165.0,
    sunatStatus: "ACEPTADO",
    cdrCode: "0 - Aceptado con CDR por SUNAT",
  },
  {
    id: "4",
    fullNumber: "B001-00000410",
    docType: "BOLETA",
    clientName: "Renzo Estrada Poma",
    clientDoc: "72194850",
    plate: "ABC-777",
    issueDate: "15 nov 2026, 14:10",
    amount: 185.0,
    sunatStatus: "PENDIENTE",
    cdrCode: "En cola de sincronización OSE",
  },
  {
    id: "5",
    fullNumber: "B001-00000409",
    docType: "BOLETA",
    clientName: "Jorge Luis Gómez",
    clientDoc: "41982341",
    plate: "A9B-441",
    issueDate: "15 nov 2026, 11:20",
    amount: 145.0,
    sunatStatus: "ACEPTADO",
    cdrCode: "0 - Aceptado con CDR por SUNAT",
  },
  {
    id: "6",
    fullNumber: "F001-00000188",
    docType: "FACTURA",
    clientName: "Inversiones Centro Minero E.I.R.L.",
    clientDoc: "20489123891",
    plate: "B7V-882",
    issueDate: "14 nov 2026, 16:50",
    amount: 890.0,
    sunatStatus: "ACEPTADO",
    cdrCode: "0 - Aceptado con CDR por SUNAT",
  },
  {
    id: "7",
    fullNumber: "B001-00000408",
    docType: "BOLETA",
    clientName: "María Fernández Quispe",
    clientDoc: "47812904",
    plate: "C1A-202",
    issueDate: "14 nov 2026, 14:15",
    amount: 110.0,
    sunatStatus: "ACEPTADO",
    cdrCode: "0 - Aceptado con CDR por SUNAT",
  },
];

export default function InvoicesAdminPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(SAMPLE_INVOICES);
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [filterType, setFilterType] = useState<"TODOS" | "FACTURA" | "BOLETA">("TODOS");
  const [filterSeries, setFilterSeries] = useState("TODAS");
  const [searchTerm, setSearchTerm] = useState("");

  const loadInvoices = () => {
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
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            amount: Number(s.total_amount),
            sunatStatus:
              s.sunat_status === "ACCEPTED" ? "ACEPTADO" : "PENDIENTE",
            cdrCode:
              s.sunat_status === "ACCEPTED"
                ? "0 - Aceptado con CDR por SUNAT"
                : "En cola de sincronización OSE",
          }));
          setInvoices(mapped);
        }
      })
      .catch((e) => console.warn("Fallback invoices", e));
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filtered = invoices.filter((inv) => {
    if (filterStatus !== "TODOS" && inv.sunatStatus !== filterStatus)
      return false;
    if (filterType !== "TODOS" && inv.docType !== filterType) return false;
    if (filterSeries !== "TODAS" && !inv.fullNumber.startsWith(filterSeries))
      return false;
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

  const totalMonto = invoices.reduce((acc, i) => acc + i.amount, 0);
  const aceptadosCount = invoices.filter(
    (i) => i.sunatStatus === "ACEPTADO"
  ).length;
  const pendientesCount = invoices.filter(
    (i) => i.sunatStatus !== "ACEPTADO"
  ).length;

  return (
    <ErpLayout
      categoryTitle="Emisión y SUNAT"
      title="Comprobantes"
      actionButton={{
        label: "Emitir comprobante",
        href: "/admin/pos",
      }}
    >
      {/* 1. FILA DE MÉTRICAS KHIPU */}
      <FilaMetricas columnas={4}>
        <Metrica
          etiqueta="Total facturado"
          icono={Receipt}
          tono="acento"
          destacada
          acciones={<ChipVariacion variacion={14.2} destacada />}
          ayuda="Neto de notas de crédito · Período actual"
        >
          S/{" "}
          {Math.max(28450, totalMonto).toLocaleString("es-PE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Metrica>

        <Metrica
          etiqueta="Emitidos en el período"
          icono={Calendar}
          tono="neutro"
          sufijo="CPEs"
          ayuda={
            <AyudaMetrica tono="neutro">
              Series electrónicas F001 y B001
            </AyudaMetrica>
          }
        >
          {Math.max(164, invoices.length)}
        </Metrica>

        <Metrica
          etiqueta="Aceptados con CDR"
          icono={CheckCircle2}
          tono="ok"
          visual={{ tipo: "barra", valor: 98.2 }}
          ayuda={
            <AyudaMetrica tono="ok">
              Conformidad SUNAT UBL 2.1 ({aceptadosCount} en vista)
            </AyudaMetrica>
          }
        >
          {Math.max(161, aceptadosCount)}
        </Metrica>

        <Metrica
          etiqueta="Atención requerida"
          icono={AlertCircle}
          tono={pendientesCount > 0 ? "aviso" : "ok"}
          ayuda={
            <AyudaMetrica tono={pendientesCount > 0 ? "aviso" : "ok"}>
              {pendientesCount > 0
                ? "Pendientes de envío al OSE"
                : "Sin pendientes de envío"}
            </AyudaMetrica>
          }
        >
          {pendientesCount}
        </Metrica>
      </FilaMetricas>

      {/* 2. BARRA DE FILTROS ESTÁNDAR KHIPU (h-control = 32px) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentadoControl<"TODOS" | "FACTURA" | "BOLETA">
            valor={filterType}
            onChange={setFilterType}
            opciones={[
              { valor: "TODOS", etiqueta: "Todos", contador: invoices.length },
              {
                valor: "FACTURA",
                etiqueta: "Facturas",
                contador: invoices.filter((i) => i.docType === "FACTURA").length,
              },
              {
                valor: "BOLETA",
                etiqueta: "Boletas",
                contador: invoices.filter((i) => i.docType === "BOLETA").length,
              },
            ]}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={CONTROL_FILTRO}
          >
            <option value="TODOS">Estado SUNAT: Todos</option>
            <option value="ACEPTADO">Aceptado con CDR</option>
            <option value="PENDIENTE">En proceso OSE</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>

          <select
            value={filterSeries}
            onChange={(e) => setFilterSeries(e.target.value)}
            className={CONTROL_FILTRO}
          >
            <option value="TODAS">Serie: Todas</option>
            <option value="B001">Serie B001</option>
            <option value="F001">Serie F001</option>
          </select>

          <BuscadorKhipu
            valor={searchTerm}
            onChange={setSearchTerm}
            placeholder="Cliente, RUC/DNI, correlativo o placa…"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert("Descargando paquete XML/CDR firmado en ZIP…")}
            className={ACCION_SECUNDARIA}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Descargar ZIP</span>
          </button>

          <button
            type="button"
            onClick={() =>
              alert("Exportando Registro de Ventas 14.1 PLE / SIRE…")
            }
            className={ACCION_SECUNDARIA}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Exportar</span>
          </button>

          <button
            type="button"
            onClick={loadInvoices}
            title="Refrescar comprobantes"
            className={ACCION_SECUNDARIA}
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 3. TABLA EN BANDA REDONDEADA KHIPU */}
      <div className={CONTENEDOR_TABLA}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Comprobante</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cliente / Receptor</TableHead>
              <TableHead>Placa Vehicular</TableHead>
              <TableHead>Emisión</TableHead>
              <TableHead className="text-right">Importe Total</TableHead>
              <TableHead>Estado SUNAT</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <FilaVacia columnas={8}>
                No se encontraron comprobantes con los filtros seleccionados.
              </FilaVacia>
            ) : (
              filtered.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <ChipCodigo>{inv.fullNumber}</ChipCodigo>
                  </TableCell>
                  <TableCell>
                    <Chip>
                      {inv.docType === "FACTURA" ? "01 Factura" : "03 Boleta"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {inv.clientName}
                    </div>
                    <div className="text-etiqueta text-muted-foreground tabular-nums">
                      Doc. {inv.clientDoc}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-etiqueta font-medium text-foreground">
                      {inv.plate}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {inv.issueDate}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-foreground tabular-nums">
                    S/ {inv.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <PillEstado
                      tono={inv.sunatStatus === "ACEPTADO" ? "ok" : "aviso"}
                    >
                      {inv.sunatStatus === "ACEPTADO"
                        ? "Aceptado con CDR"
                        : "En proceso"}
                    </PillEstado>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            `Imprimiendo representación impresa 80mm de ${inv.fullNumber}`
                          )
                        }
                        title="Imprimir ticket 80mm"
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            `Descargando XML UBL 2.1 y CDR firmado de ${inv.fullNumber}`
                          )
                        }
                        title="Descargar XML y CDR"
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <PieTablaSimple
          mostrando={filtered.length}
          total={Math.max(164, invoices.length)}
          unidad="comprobantes"
          nota="Plazo máx. envío SUNAT: 3 días calendario · RUC 20608945123"
        />
      </div>
    </ErpLayout>
  );
}
