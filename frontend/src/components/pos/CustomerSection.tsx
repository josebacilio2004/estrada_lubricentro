"use client";

import React, { useState } from "react";
import { User, Sparkles } from "lucide-react";
import { CustomerData, DocumentType, VehicleData } from "@/types";
import {
  TARJETA,
  CabeceraSeccion,
  SegmentadoControl,
  CAMPO,
  SELECT_NATIVO,
  ETIQUETA_CAMPO,
  cn,
} from "@/components/khipu/khipu-ui";

interface FrequentCustomer {
  docType: "1" | "6" | "0";
  docNumber: string;
  name: string;
  phone: string;
  address: string;
  plate: string;
  brand: string;
  model: string;
  currentKM: number;
}

const CRM_FREQUENT_CUSTOMERS: FrequentCustomer[] = [
  {
    docType: "1",
    docNumber: "10458923",
    name: "Carlos Mendoza Alarcón",
    phone: "964123456",
    address: "Av. Giráldez 450, Huancayo",
    plate: "ABC-123",
    brand: "Toyota",
    model: "RAV4 2.5L AWD",
    currentKM: 48800,
  },
  {
    docType: "1",
    docNumber: "45891230",
    name: "Vanessa Torres Rivas",
    phone: "964987654",
    address: "Jr. Puno 320, Huancayo",
    plate: "W1A-982",
    brand: "Hyundai",
    model: "Tucson GLP Dual",
    currentKM: 72400,
  },
  {
    docType: "1",
    docNumber: "964777888",
    name: "Renzo Estrada Poma",
    phone: "964777888",
    address: "Av. Huancavelica 890, El Tambo",
    plate: "ABC-777",
    brand: "Mazda",
    model: "CX-5 SkyActiv",
    currentKM: 32000,
  },
  {
    docType: "6",
    docNumber: "20608912345",
    name: "Transportes Huancayo S.A.C.",
    phone: "964555111",
    address: "Av. Mariscal Castilla 2200, El Tambo",
    plate: "BCX-456",
    brand: "Nissan",
    model: "Frontier Diésel 2.5L",
    currentKM: 124500,
  },
];

interface CustomerSectionProps {
  docType: DocumentType;
  setDocType: (t: DocumentType) => void;
  series: string;
  customer: CustomerData;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerData>>;
  onSelectVehicle?: (v: Partial<VehicleData>) => void;
}

export function CustomerSection({
  docType,
  setDocType,
  customer,
  setCustomer,
  onSelectVehicle,
}: CustomerSectionProps) {
  const [selectedFrequent, setSelectedFrequent] = useState("");

  const handleSelectFrequent = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const doc = e.target.value;
    setSelectedFrequent(doc);
    if (!doc) return;

    const found = CRM_FREQUENT_CUSTOMERS.find((c) => c.docNumber === doc);
    if (found) {
      if (found.docType === "6") {
        setDocType("01");
      } else {
        setDocType("03");
      }

      setCustomer({
        docType: found.docType,
        docNumber: found.docNumber,
        name: found.name,
        phone: found.phone,
        address: found.address,
      });

      if (onSelectVehicle) {
        onSelectVehicle({
          plate: found.plate,
          brand: found.brand,
          model: found.model,
          currentKM: found.currentKM,
        });
      }
    }
  };

  return (
    <div className={cn(TARJETA, "pb-4")}>
      <CabeceraSeccion
        icon={User}
        titulo="1. Datos del cliente y comprobante"
        subtitulo="Selección de serie electrónica SUNAT y expediente CRM"
        derecha={
          <SegmentadoControl<DocumentType>
            valor={docType}
            onChange={(val) => {
              setDocType(val);
              setCustomer((prev) => ({
                ...prev,
                docType: val === "01" ? "6" : val === "03" ? "1" : "0",
              }));
            }}
            opciones={[
              { valor: "03", etiqueta: "Boleta B001" },
              { valor: "01", etiqueta: "Factura F001" },
              { valor: "80", etiqueta: "Nota NV01" },
            ]}
          />
        }
      />

      <div className="px-4 space-y-3 pt-1">
        {/* Selector de Cliente Frecuente CRM */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-secondary/70 px-3 py-2">
          <div className="flex items-center gap-2 text-etiqueta font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-acento-2-texto dark:text-acento shrink-0" />
            <span>Autocompletar desde expediente CRM:</span>
          </div>
          <select
            value={selectedFrequent}
            onChange={handleSelectFrequent}
            className={cn(SELECT_NATIVO, "w-full sm:w-auto min-w-[240px]")}
          >
            <option value="">Seleccionar cliente frecuente…</option>
            {CRM_FREQUENT_CUSTOMERS.map((c) => (
              <option key={c.docNumber} value={c.docNumber}>
                {c.name} · {c.plate} ({c.model})
              </option>
            ))}
          </select>
        </div>

        {/* Campos del cliente */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={ETIQUETA_CAMPO}>
              {docType === "01" ? "RUC (11 dígitos)" : "DNI / Documento"}
            </label>
            <input
              type="text"
              value={customer.docNumber}
              onChange={(e) =>
                setCustomer((prev) => ({ ...prev, docNumber: e.target.value }))
              }
              placeholder={docType === "01" ? "20601234567" : "71234567"}
              className={cn(CAMPO, "tabular-nums")}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={ETIQUETA_CAMPO}>
              {docType === "01" ? "Razón Social" : "Nombre completo del cliente"}
            </label>
            <input
              type="text"
              value={customer.name}
              onChange={(e) =>
                setCustomer((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={
                docType === "01"
                  ? "EMPRESA DE TRANSPORTE S.A.C."
                  : "Juan Pérez Gómez"
              }
              className={CAMPO}
            />
          </div>

          <div>
            <label className={ETIQUETA_CAMPO}>Celular / WhatsApp</label>
            <input
              type="tel"
              value={customer.phone}
              onChange={(e) =>
                setCustomer((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="964 123 456"
              className={cn(CAMPO, "tabular-nums")}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={ETIQUETA_CAMPO}>Dirección fiscal / Referencia</label>
            <input
              type="text"
              value={customer.address}
              onChange={(e) =>
                setCustomer((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Av. Mariátegui 1290, El Tambo — Huancayo"
              className={CAMPO}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
