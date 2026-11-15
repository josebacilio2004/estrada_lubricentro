"use client";

import React from "react";
import { Printer } from "lucide-react";
import { CartItem, DocumentType, SaleResult } from "@/types";

interface ThermalTicketProps {
  docType: DocumentType;
  saleResult: SaleResult;
  cart: CartItem[];
  subtotalGravado: number;
  totalIGV: number;
  totalAmount: number;
  plate?: string;
  currentKM?: number;
  onClose: () => void;
}

export function ThermalTicket({
  docType,
  saleResult,
  cart,
  subtotalGravado,
  totalIGV,
  totalAmount,
  plate,
  currentKM,
  onClose,
}: ThermalTicketProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-black p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-in zoom-in-95">
        <div id="thermal-ticket">
          <div className="text-center pb-4 border-b border-dashed border-gray-300">
            <h2 className="font-black text-base uppercase">LUBRICENTROS ESTRADA</h2>
            <p className="text-[11px]">R.U.C. 20608945123</p>
            <p className="text-[10px]">AV. JOSÉ CARLOS MARIÁTEGUI 1290 - HUANCAYO, JUNÍN</p>
            <p className="text-[11px] font-bold mt-2">
              {docType === "01" ? "FACTURA ELECTRÓNICA" : docType === "03" ? "BOLETA DE VENTA ELECTRÓNICA" : "NOTA DE VENTA"}
            </p>
            <p className="text-xs font-mono font-bold">{saleResult.full_number}</p>
          </div>

          <div className="py-2 text-[10px] font-mono border-b border-dashed border-gray-300 space-y-0.5">
            <p>Fecha: {new Date(saleResult.issue_date).toLocaleString("es-PE")}</p>
            <p>Cliente: {saleResult.customer_name}</p>
            <p>Doc: {saleResult.customer_doc}</p>
            {plate && <p>Placa: <strong>{plate}</strong> {currentKM ? `(Km: ${currentKM.toLocaleString()})` : ""}</p>}
          </div>

          <div className="py-2 text-[10px] font-mono border-b border-dashed border-gray-300">
            <div className="flex justify-between font-bold mb-1">
              <span>Cant / Descripción</span>
              <span>Total</span>
            </div>
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between py-0.5">
                <span className="truncate pr-2">{item.quantity} x {item.product.name}</span>
                <span>S/ {(item.quantity * item.product.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="py-2 text-[11px] font-mono space-y-0.5">
            <div className="flex justify-between">
              <span>OP. GRAVADA:</span>
              <span>S/ {subtotalGravado.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>I.G.V. (18%):</span>
              <span>S/ {totalIGV.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1">
              <span>TOTAL:</span>
              <span>S/ {totalAmount.toFixed(2)}</span>
            </div>
            <p className="text-[9px] pt-1 italic">{saleResult.amount_in_words}</p>
          </div>

          {plate && saleResult.next_service_km && (
            <div className="my-2 p-2 rounded bg-amber-50 border border-amber-300 text-[10px] text-center font-mono">
              <p className="font-bold text-amber-900">PRÓXIMO CAMBIO DE ACEITE</p>
              <p>Kilometraje: <strong>{saleResult.next_service_km.toLocaleString()} km</strong></p>
              {saleResult.next_service_date && (
                <p>Fecha sugerida: <strong>{new Date(saleResult.next_service_date).toLocaleDateString("es-PE")}</strong></p>
              )}
            </div>
          )}

          <div className="text-center pt-2">
            <p className="text-[9px] font-mono">Representación Impresa del Comprobante Electrónico</p>
            <p className="text-[8px] text-gray-500">Hash: {saleResult.qr_string.slice(-12)}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-black text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            Imprimir (F9)
          </button>
          <button
            onClick={onClose}
            className="px-4 bg-gray-200 hover:bg-gray-300 text-black text-xs font-bold py-2.5 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
