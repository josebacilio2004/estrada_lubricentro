"use client";

import React from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import { CartItem } from "@/types";

interface CartSectionProps {
  series: string;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  subtotalGravado: number;
  totalIGV: number;
  totalAmount: number;
  paymentMethod: string;
  setPaymentMethod: (m: string) => void;
  onProcessSale: () => void;
  isProcessing: boolean;
}

export function CartSection({
  series,
  cart,
  onUpdateQuantity,
  subtotalGravado,
  totalIGV,
  totalAmount,
  paymentMethod,
  setPaymentMethod,
  onProcessSale,
  isProcessing,
}: CartSectionProps) {
  return (
    <div className="card-dark p-5 rounded-2xl border border-white/10 flex-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <span className="text-sm font-mono font-bold text-white flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-ember-500" />
            Detalle de Venta
          </span>
          <span className="text-xs font-mono text-text-lo">
            Serie: <strong className="text-ember-500">{series}</strong>
          </span>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-text-lo">
              El carrito está vacío. Seleccione productos del catálogo rápido.
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-white font-medium block truncate">{item.product.name}</span>
                  <span className="font-mono text-[10px] text-text-lo">
                    S/ {item.product.price.toFixed(2)} c/u
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.product.id, Number(e.target.value))}
                    className="w-12 bg-black/60 border border-white/10 rounded px-1.5 py-1 text-center font-mono text-xs text-white"
                  />
                  <span className="font-mono font-bold text-white w-16 text-right">
                    S/ {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, 0)}
                    className="text-text-lo hover:text-red-400 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border-t border-white/10 pt-4 mt-4 space-y-2 font-mono text-xs">
        <div className="flex justify-between text-text-lo">
          <span>Subtotal Gravado (Sin IGV):</span>
          <span>S/ {subtotalGravado.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-text-lo">
          <span>I.G.V. (18.00%):</span>
          <span>S/ {totalIGV.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-white/10">
          <span>TOTAL A PAGAR:</span>
          <span className="text-ember-500">S/ {totalAmount.toFixed(2)}</span>
        </div>

        <div className="pt-2">
          <label className="text-[10px] text-text-lo block mb-1">Medio de Pago:</label>
          <div className="grid grid-cols-3 gap-2">
            {["EFECTIVO", "YAPE_PLIN", "TARJETA"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPaymentMethod(m)}
                className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                  paymentMethod === m
                    ? "bg-ember-500/20 border-ember-500 text-ember-400"
                    : "bg-black/30 border-white/5 text-text-lo hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onProcessSale}
          disabled={isProcessing || cart.length === 0}
          className="w-full mt-4 bg-ember-500 hover:bg-ember-600 text-white font-display font-extrabold text-base py-3.5 rounded-full shadow-lg shadow-ember-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? "Transmitiendo a SUNAT..." : `Cobrar S/ ${totalAmount.toFixed(2)} (F8)`}
        </button>
      </div>
    </div>
  );
}
