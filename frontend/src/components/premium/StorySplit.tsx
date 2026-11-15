"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function StorySplit() {
  return (
    <section id="historias" className="bg-ink-950 py-8 px-6 border-t border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Block: Our Story */}
        <div className="relative aspect-[576/344] min-h-[340px] rounded-2xl overflow-hidden group p-8 sm:p-10 flex flex-col justify-end">
          {/* Background Image from DOSLA screenshot */}
          <Image
            src="/media/story-sunset.png"
            alt="Conductor y vehículo al atardecer en carretera de montaña"
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Dark Overlay gradient for high text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 space-y-3">
            <span className="text-[10px] font-mono tracking-wideEyebrow text-text-lo uppercase block">
              NUESTRA HISTORIA
            </span>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight uppercase leading-tight">
              PASIÓN QUE<br />CUIDA MOTORES.
            </h3>
            <p className="text-xs sm:text-sm text-text-lo max-w-sm leading-relaxed font-light">
              Cuidamos cada vehículo con rigor técnico y vocación honesta. Más que lubricantes, aseguramos la longevidad de tu inversión.
            </p>
            <div className="pt-1">
              <a
                href="#agenda"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-ember-400 transition-colors group/link"
              >
                <span>Conoce Nuestra Historia</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Block: Workshop Experience / Human Drive */}
        <div id="taller" className="relative aspect-[576/344] min-h-[340px] rounded-2xl overflow-hidden group p-8 sm:p-10 flex flex-col justify-end">
          {/* Background Image: Cockpit Interior */}
          <Image
            src="/media/service-interior.png"
            alt="Interior automotriz de lujo con iluminación ámbar"
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Dark Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 space-y-3">
            <span className="text-[10px] font-mono tracking-wideEyebrow text-text-lo uppercase block">
              EXPERIENCIA EN TALLER
            </span>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight uppercase leading-tight">
              UN SERVICIO<br />MÁS HUMANO.
            </h3>
            <p className="text-xs sm:text-sm text-text-lo max-w-sm leading-relaxed font-light">
              Rápido. Transparente. Diseñado a tu alrededor con sala de espera climatizada y diagnóstico en tiempo real.
            </p>
            <div className="pt-2">
              <a
                href="#agenda"
                className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-black text-xs font-semibold px-6 py-2.5 rounded-full transition-all duration-200 hover:shadow-lg active:scale-95"
              >
                Conoce el Taller
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
