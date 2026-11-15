"use client";

import React, { useState, useEffect } from "react";
import { ErpLayout } from "@/components/admin/ErpLayout";
import {
  Users,
  MessageSquare,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  FilaMetricas,
  Metrica,
  AyudaMetrica,
  CONTENEDOR_TABLA,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  FilaVacia,
  ChipCodigo,
  PillEstado,
  PieTablaSimple,
  SegmentadoControl,
  BuscadorKhipu,
  ACCION_SECUNDARIA,
  cn,
} from "@/components/khipu/khipu-ui";

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
    lastServiceDate: "06 jul 2026",
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
    lastServiceDate: "15 ago 2026",
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
    lastServiceDate: "04 oct 2026",
    nextServiceKm: 37000,
    oilApplied: "Castrol EDGE Titanium 5W-30",
    status: "OPTIMAL",
  },
  {
    id: "4",
    name: "Transportes Huancayo S.A.C. (Flota)",
    doc: "20608912345",
    phone: "964555111",
    plate: "BCX-456",
    vehicleModel: "Nissan Frontier Diésel 2.5L",
    year: 2020,
    engineFuel: "Diésel Turbo",
    currentKm: 124500,
    lastServiceDate: "12 may 2026",
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
            phone: c.phone_whatsapp || "964123456",
            plate: c.vehicles_list || "ABC-123",
            vehicleModel: "Vehículo Registrado Estrada",
            year: 2022,
            engineFuel: "Gasolina / Dual",
            currentKm: 48000,
            lastServiceDate: "15 oct 2026",
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

  const dueSoonCount = customers.filter((c) => c.status === "DUE_SOON").length;
  const overdueCount = customers.filter((c) => c.status === "OVERDUE").length;

  return (
    <ErpLayout
      categoryTitle="Catálogo y Kardex"
      title="Clientes y Vehículos"
      actionButton={{
        label: "Nuevo expediente en POS",
        href: "/admin/pos",
      }}
    >
      {/* 1. FILA DE MÉTRICAS KHIPU */}
      <FilaMetricas columnas={3}>
        <Metrica
          etiqueta="Total expedientes vehiculares"
          icono={Users}
          tono="acento"
          destacada
          sufijo="vehículos"
          ayuda="Clientes con historial de lubricación registrado"
        >
          {customers.length}
        </Metrica>

        <Metrica
          etiqueta="Próximos a cambio preventivo"
          icono={Clock}
          tono="aviso"
          sufijo="unidades"
          ayuda={
            <AyudaMetrica tono="aviso">
              Menos de 1,500 km para el siguiente servicio
            </AyudaMetrica>
          }
        >
          {dueSoonCount}
        </Metrica>

        <Metrica
          etiqueta="Mantenimientos vencidos"
          icono={AlertTriangle}
          tono={overdueCount > 0 ? "error" : "ok"}
          sufijo="unidades"
          ayuda={
            <AyudaMetrica tono={overdueCount > 0 ? "error" : "ok"}>
              {overdueCount > 0
                ? "Requieren recordatorio por WhatsApp"
                : "Todos los vehículos dentro de rango"}
            </AyudaMetrica>
          }
        >
          {overdueCount}
        </Metrica>
      </FilaMetricas>

      {/* 2. BARRA DE FILTROS KHIPU */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentadoControl<string>
            valor={filterSeverity}
            onChange={setFilterSeverity}
            opciones={[
              { valor: "TODOS", etiqueta: "Todos", contador: customers.length },
              {
                valor: "OPTIMAL",
                etiqueta: "Al día",
                contador: customers.filter((c) => c.status === "OPTIMAL")
                  .length,
              },
              {
                valor: "DUE_SOON",
                etiqueta: "Próximo cambio",
                contador: dueSoonCount,
              },
              {
                valor: "OVERDUE",
                etiqueta: "Vencidos",
                contador: overdueCount,
              },
            ]}
          />

          <BuscadorKhipu
            valor={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por placa, DNI/RUC, cliente o modelo…"
          />
        </div>
      </div>

      {/* 3. TABLA EN BANDA REDONDEADA KHIPU */}
      <div className={CONTENEDOR_TABLA}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Cliente Propietario</TableHead>
              <TableHead>Vehículo y Lubricante</TableHead>
              <TableHead className="text-right">Odómetro Actual</TableHead>
              <TableHead className="text-right">Próximo Cambio</TableHead>
              <TableHead>Estado Ciclo</TableHead>
              <TableHead className="text-right">Aviso WhatsApp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <FilaVacia columnas={7}>
                No se encontraron expedientes vehiculares con los filtros seleccionados.
              </FilaVacia>
            ) : (
              filtered.map((c) => {
                const rem = c.nextServiceKm - c.currentKm;
                const waMsg = encodeURIComponent(
                  `Estimado(a) ${c.name}, le saludamos de Lubricentros Estrada. Le recordamos que su vehículo con placa ${c.plate} está próximo a su cambio de aceite preventivo (${c.currentKm} km actuales). ¿Desea agendar su atención en Av. Mariátegui?`
                );

                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <ChipCodigo>{c.plate}</ChipCodigo>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{c.name}</div>
                      <span className="text-etiqueta text-muted-foreground tabular-nums">
                        Doc. {c.doc} · Tel. {c.phone}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-foreground">
                        {c.vehicleModel} ({c.year})
                      </div>
                      <span className="text-etiqueta text-muted-foreground">
                        {c.engineFuel} · {c.oilApplied}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground tabular-nums">
                      {c.currentKm.toLocaleString("es-PE")} km
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div className="font-medium text-foreground">
                        {c.nextServiceKm.toLocaleString("es-PE")} km
                      </div>
                      <span
                        className={cn(
                          "text-etiqueta",
                          rem > 0
                            ? "text-success-foreground"
                            : "text-destructive-texto"
                        )}
                      >
                        {rem > 0
                          ? `Restan ${rem.toLocaleString("es-PE")} km`
                          : `Excedido ${Math.abs(rem).toLocaleString("es-PE")} km`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <PillEstado
                        tono={
                          c.status === "OPTIMAL"
                            ? "ok"
                            : c.status === "DUE_SOON"
                            ? "aviso"
                            : "error"
                        }
                      >
                        {c.status === "OPTIMAL"
                          ? "Al día"
                          : c.status === "DUE_SOON"
                          ? "Próximo cambio"
                          : "Servicio vencido"}
                      </PillEstado>
                    </TableCell>
                    <TableCell className="text-right">
                      <a
                        href={`https://wa.me/51${c.phone.replace(
                          /\D/g,
                          ""
                        )}?text=${waMsg}`}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(ACCION_SECUNDARIA, "h-7 px-2.5 text-etiqueta")}
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-success-foreground" />
                        <span>Notificar</span>
                      </a>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <PieTablaSimple
          mostrando={filtered.length}
          total={customers.length}
          unidad="expedientes vehiculares"
          nota="Recordatorios predictivos según perfil de uso (Particular / Taxi / Flota)"
        />
      </div>
    </ErpLayout>
  );
}
