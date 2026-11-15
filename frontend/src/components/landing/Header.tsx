"use client";

import React from "react";
import Link from "next/link";
import { Wrench, PhoneCall } from "lucide-react";

export function Header() {
  return (
    <>
      <div className="bg-estrada-surface/90 border-b border-white/5 py-2 px-4 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2 text-estrada-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-estrada-ok">
              <span className="h-2 w-2 rounded-full bg-estrada-ok animate-pulse"></span>
              Emisión Oficial SUNAT UBL 2.1
            </span>
            <span>• Horario: Lun a Sáb 8:00 AM - 7:00 PM</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/pos" className="text-estrada-amber hover:underline flex items-center gap-1 font-semibold">
              Acceso ERP / POS &rarr;
            </Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-md bg-estrada-bg/85 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-estrada-orange to-estrada-amber flex items-center justify-center shadow-lg shadow-estrada-orange/20">
              <Wrench className="h-6 w-6 text-black" />
            </div>
            <div>
              <span className="font-display font-black text-2xl tracking-wider text-white">
                LUBRICENTROS <span className="text-estrada-amber">ESTRADA</span>
              </span>
              <p className="text-[10px] text-estrada-muted uppercase tracking-widest font-mono">
                Ingeniería en Lubricación & Mantenimiento
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#catalogo" className="hover:text-estrada-amber transition-colors">Catálogo de Aceites</a>
            <a href="#consulta-placa" className="hover:text-estrada-amber transition-colors">Consultar Mi Cambio</a>
            <a href="#servicios" className="hover:text-estrada-amber transition-colors">Servicio en Taller</a>
          </div>

          <a
            href="https://wa.me/51987654321?text=Hola,%20deseo%20cotizar%20un%20cambio%20de%20aceite%20para%20mi%20vehiculo"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 bg-estrada-orange hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-estrada-orange/25 transition-all hover:scale-[1.02]"
          >
            <PhoneCall className="h-4 w-4" />
            Cotizar por WhatsApp
          </a>
        </div>
      </header>
    </>
  );
}
