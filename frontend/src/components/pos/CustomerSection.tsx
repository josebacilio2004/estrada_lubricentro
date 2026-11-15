"use client";

import React, { useState } from "react";
import { User, Sparkles, Building2, Car, Check } from "lucide-react";
import { CustomerData, DocumentType, VehicleData } from "@/types";

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
    name: "Transportes Huancayo SAC",
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
  series,
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
    <div className="p-5 rounded-2xl bg-[#141720]/90 backdrop-blur-md border border-white/[0.08] shadow-lg space-y-4">
      
      {/* Top Header & Document Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        <span className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>1. Datos del Cliente & Comprobante</span>
        </span>

        <div className="flex gap-1.5 bg-[#101217] p-1 rounded-full border border-white/10">
          <button
            type="button"
            onClick={() => {
              setDocType("03");
              setCustomer((prev) => ({ ...prev, docType: "1" }));
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
              docType === "03" ? "bg-ember-500 text-white shadow-md shadow-ember-500/20" : "text-gray-400 hover:text-white"
            }`}
          >
            Boleta (B001)
          </button>
          <button
            type="button"
            onClick={() => {
              setDocType("01");
              setCustomer((prev) => ({ ...prev, docType: "6" }));
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
              docType === "01" ? "bg-white text-black font-extrabold shadow-md" : "text-gray-400 hover:text-white"
            }`}
          >
            Factura (F001)
          </button>
          <button
            type="button"
            onClick={() => {
              setDocType("80");
              setCustomer((prev) => ({ ...prev, docType: "0" }));
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
              docType === "80" ? "bg-neutral-700 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Nota Venta (NV01)
          </button>
        </div>
      </div>

      {/* Selector de Cliente Frecuente CRM */}
      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Cargar Cliente Registrado del CRM:</span>
        </div>
        <select
          value={selectedFrequent}
          onChange={handleSelectFrequent}
          className="w-full sm:w-auto bg-[#101217] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none font-mono"
        >
          <option value="">-- Seleccionar expediente CRM --</option>
          {CRM_FREQUENT_CUSTOMERS.map((c) => (
            <option key={c.docNumber} value={c.docNumber}>
              {c.name} ({c.plate} - {c.model})
            </option>
          ))}
        </select>
      </div>

      {/* Customer Form Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div>
          <label className="text-[11px] text-gray-400 block mb-1">
            {docType === "01" ? "RUC (11 dígitos):" : "DNI / Documento:"}
          </label>
          <input
            type="text"
            value={customer.docNumber}
            onChange={(e) => setCustomer((prev) => ({ ...prev, docNumber: e.target.value }))}
            placeholder={docType === "01" ? "20601234567" : "71234567"}
            className="w-full bg-[#101217] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-[11px] text-gray-400 block mb-1">
            {docType === "01" ? "Razón Social:" : "Nombre Completo del Cliente:"}
          </label>
          <input
            type="text"
            value={customer.name}
            onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={docType === "01" ? "EMPRESA DE TRANSPORTE S.A.C." : "Juan Pérez Gómez"}
            className="w-full bg-[#101217] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400 transition-colors font-sans"
          />
        </div>

        <div>
          <label className="text-[11px] text-gray-400 block mb-1">
            Celular / WhatsApp (Aviso):
          </label>
          <input
            type="tel"
            value={customer.phone}
            onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="964 123 456"
            className="w-full bg-[#101217] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-[11px] text-gray-400 block mb-1">
            Dirección Fiscal / Referencia:
          </label>
          <input
            type="text"
            value={customer.address}
            onChange={(e) => setCustomer((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Av. Mariátegui 1290, Huancayo"
            className="w-full bg-[#101217] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-amber-400 transition-colors font-sans"
          />
        </div>
      </div>

    </div>
  );
}