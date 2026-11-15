"use client";

import React from "react";
import { ShoppingCart, Trash2, Receipt, Minus, Plus } from "lucide-react";
import { CartItem } from "@/types";
import {
  TARJETA,
  CabeceraSeccion,
  ChipCodigo,
  SegmentadoControl,
  ACCION_PRINCIPAL,
  ETIQUETA_CAMPO,
  cn,
} from "@/components/khipu/khipu-ui";

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
  const totalUnidades = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className={cn(TARJETA, "flex flex-1 flex-col justify-between pb-4")}>
      <div>
        <CabeceraSeccion
          icon={ShoppingCart}
          titulo="Detalle de venta y liquidación"
          subtitulo={`${totalUnidades} ${totalUnidades === 1 ? "unidad" : "unidades"} en el comprobante`}
          derecha={<ChipCodigo>Serie {series}</ChipCodigo>}
        />

        <div className="px-3 pt-1">
          <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="rounded-xl bg-secondary/50 py-12 px-4 text-center text-cuerpo text-muted-foreground">
                El carrito está vacío. Escanee un código desde la App Móvil o seleccione un producto del catálogo.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between gap-2.5 rounded-xl bg-secondary px-3 py-2.5 transition-colors hover:bg-secondary/80"
                >
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-control font-medium text-foreground">
                      {item.product.name}
                    </span>
                    <div className="flex items-center gap-2 text-etiqueta text-muted-foreground tabular-nums">
                      <span className="font-mono">{item.product.sku}</span>
                      <span>·</span>
                      <span>S/ {item.product.price.toFixed(2)} c/u</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="inline-flex items-center rounded-full bg-card border border-border p-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          onUpdateQuantity(
                            item.product.id,
                            Math.max(1, Number(e.target.value))
                          )
                        }
                        className="w-9 bg-transparent text-center font-mono text-etiqueta font-semibold text-foreground outline-none tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="w-20 text-right font-semibold text-control text-foreground tabular-nums">
                      S/ {(item.product.price * item.quantity).toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product.id, 0)}
                      title="Quitar ítem"
                      className="rounded-full p-1 text-texto-terciario hover:bg-destructive-suave hover:text-destructive-texto transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Resumen Tributario SUNAT Khipu */}
      <div className="mt-4 border-t border-border/60 px-4 pt-3.5 space-y-3">
        <div className="space-y-1.5 rounded-xl bg-secondary/60 p-3 text-control tabular-nums">
          <div className="flex justify-between text-muted-foreground">
            <span>Op. Gravada (Sin IGV)</span>
            <span>S/ {subtotalGravado.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>I.G.V. (18.00%)</span>
            <span>S/ {totalIGV.toFixed(2)}</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-border pt-2">
            <span className="text-titulo text-foreground">Total a pagar</span>
            <span className="text-metrica text-foreground tabular-nums">
              S/ {totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div>
          <span className={ETIQUETA_CAMPO}>Medio de pago</span>
          <SegmentadoControl<string>
            valor={paymentMethod}
            onChange={setPaymentMethod}
            className="w-full justify-between"
            opciones={[
              { valor: "EFECTIVO", etiqueta: "Efectivo" },
              { valor: "YAPE_PLIN", etiqueta: "Yape / Plin" },
              { valor: "TARJETA", etiqueta: "Tarjeta POS" },
            ]}
          />
        </div>

        <button
          type="button"
          onClick={onProcessSale}
          disabled={isProcessing || cart.length === 0}
          className={cn(
            ACCION_PRINCIPAL,
            "h-10 w-full text-titulo justify-center shadow-md"
          )}
        >
          <Receipt className="h-4 w-4" />
          <span>
            {isProcessing
              ? "Transmitiendo a SUNAT…"
              : `Emitir ${series} · S/ ${totalAmount.toFixed(2)}`}
          </span>
        </button>
      </div>
    </div>
  );
}
