"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-estrada-surface/80 py-10 px-4 text-xs font-mono text-estrada-muted">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        <div>
          <span className="font-display font-black text-lg text-white tracking-wider">
            LUBRICENTROS <span className="text-estrada-amber">ESTRADA</span>
          </span>
          <p className="mt-1">© 2026 Lubricentros Estrada. Todos los derechos reservados. RUC 20601234567</p>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/admin/pos" className="text-estrada-amber hover:underline">
            Terminal POS Cajeros
          </Link>
          <span>Facturación UBL 2.1 SUNAT</span>
        </div>
      </div>
    </footer>
  );
}
