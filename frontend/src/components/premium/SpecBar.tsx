"use client";

import React from "react";
import { Zap, Gauge, ShieldCheck, Timer, FileCheck } from "lucide-react";

export function SpecBar() {
  const specs = [
    {
      icon: <Zap className="w-5 h-5 text-ember-500" />,
      value: "10,000 km",
      label: "Rango Máximo (Sintético)",
    },
    {
      icon: <Gauge className="w-5 h-5 text-text-lo" />,
      value: "5W-30",
      label: "Viscosidad Homologada",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-text-lo" />,
      value: "API SP",
      label: "Certificación Internacional",
    },
    {
      icon: <Timer className="w-5 h-5 text-text-lo" />,
      value: "< 20 min",
      label: "Servicio de Cambio Express",
    },
    {
      icon: <FileCheck className="w-5 h-5 text-ember-500" />,
      value: "SUNAT",
      label: "Comprobantes Electrónicos UBL",
    },
  ];

  return (
    <section className="bg-ink-900 border-y border-white/[0.08] py-8">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-2 items-center">
          {specs.map((item, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-4 ${
                idx > 0 ? "md:border-l md:border-white/[0.08] md:pl-6" : ""
              }`}
            >
              <div className="flex-shrink-0 p-2 rounded-lg bg-white/[0.03]">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <span className="font-display font-bold text-lg text-white tracking-tight block">
                  {item.value}
                </span>
                <span className="text-[11px] font-mono text-text-lo uppercase tracking-wider block">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
