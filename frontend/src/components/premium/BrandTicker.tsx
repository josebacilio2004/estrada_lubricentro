'use client';

import React from 'react';
import Image from 'next/image';

interface Brand {
  name: string;
  logo: string;
  norm: string;
  category: string;
}

const BRANDS: Brand[] = [
  { name: 'Porsche', logo: '/media/marcas/porsche-removebg-preview.png', norm: 'Porsche A40 / C30', category: 'Superdeportivos' },
  { name: 'BMW', logo: '/media/marcas/bmw_1.png', norm: 'Longlife LL-04 / LL-12', category: 'Alemania OEM' },
  { name: 'Mercedes-Benz', logo: '/media/marcas/mercedes-removebg-preview.png', norm: 'MB 229.51 / 229.52', category: 'Ingeniería Alemana' },
  { name: 'Audi', logo: '/media/marcas/audi_1.png', norm: 'VW 504.00 / 507.00', category: 'Grupo VAG' },
  { name: 'Toyota', logo: '/media/marcas/toyota-removebg-preview.png', norm: 'Hybrid GF-6A / 0W-16', category: 'Japón OEM' },
  { name: 'Ford', logo: '/media/marcas/ford-removebg-preview.png', norm: 'WSS-M2C948-B / EcoBoost', category: 'American Muscle' },
  { name: 'Hyundai', logo: '/media/marcas/hyunday-removebg-preview.png', norm: 'API SP / Smartstream', category: 'Asia Tech' },
  { name: 'Chevrolet', logo: '/media/marcas/chevrolet-removebg-preview.png', norm: 'dexos1™ Gen 3', category: 'General Motors' },
  { name: 'Volvo', logo: '/media/marcas/volvo-removebg-preview.png', norm: 'VCC RBS0-2AE 0W-20', category: 'Seguridad Sueca' },
  { name: 'Mitsubishi', logo: '/media/marcas/mitsubishi-removebg-preview.png', norm: 'MIVEC Synthetic Tech', category: '4x4 & Rally' },
  { name: 'Kia', logo: '/media/marcas/kia-removebg-preview.png', norm: 'Turbo GDI Spec', category: 'Smart Performance' },
];

export default function BrandTicker() {
  const duplicatedBrands = [...BRANDS, ...BRANDS];

  return (
    <section id="marcas" className="scroll-mt-20 relative w-full py-16 bg-ink-950 border-y border-white/[0.08] overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/50 via-transparent to-ink-900/50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[300px] bg-ember-500/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Header Eyebrow */}
      <div className="max-w-[1400px] mx-auto px-6 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-text-lo uppercase">
            <span className="w-2 h-2 rounded-full bg-ember-500 animate-ping" />
            <span>HOMOLOGACIONES Y MARCAS COMPATIBLES</span>
          </div>
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white uppercase">
            ESTÁNDAR OEM PARA CADA FABRICANTE GLOBAL
          </h3>
        </div>
        <p className="text-text-dim text-xs font-mono tracking-wider max-w-md">
          Fórmulas que superan las tolerancias de fábrica requeridas por los consorcios automotrices más exigentes del mundo.
        </p>
      </div>

      {/* Linear Fade Edges for Cinema Marquee */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 md:w-56 bg-gradient-to-r from-ink-950 via-ink-950/90 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 md:w-56 bg-gradient-to-l from-ink-950 via-ink-950/90 to-transparent z-10" />

      {/* Sliding Chain / Marquee with High-Relief Vertical Cards */}
      <div className="flex overflow-hidden py-4">
        <div className="animate-ticker flex items-center gap-7">
          {duplicatedBrands.map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="group relative flex flex-col items-center justify-between p-6 rounded-2xl bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] hover:from-white/[0.14] hover:to-white/[0.04] border border-white/15 hover:border-ember-500/60 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_14px_35px_rgba(0,0,0,0.65)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_22px_45px_rgba(242,106,27,0.25)] transition-all duration-300 hover:-translate-y-2.5 hover:scale-105 cursor-pointer min-w-[210px] w-[210px] h-[210px]"
            >
              {/* Top ambient highlight line */}
              <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:via-ember-400 transition-colors" />

              {/* Category pill on top */}
              <span className="text-[9px] font-mono tracking-widest uppercase text-text-dim group-hover:text-ember-400 transition-colors">
                {brand.category}
              </span>

              {/* Large Prominent Logo Centered on Top */}
              <div className="relative w-24 h-20 flex items-center justify-center my-auto transition-transform duration-300 group-hover:scale-110 drop-shadow-xl">
                <Image
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  width={96}
                  height={80}
                  className="object-contain max-h-full max-w-full filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                  loading="lazy"
                />
              </div>

              {/* Brand Name DIRECTLY UNDER the logo (centered, high relief) */}
              <div className="flex flex-col items-center text-center mt-auto w-full pt-2 border-t border-white/[0.06] group-hover:border-ember-500/30 transition-colors">
                <span className="font-display font-extrabold text-sm tracking-wider text-white group-hover:text-ember-400 transition-colors uppercase drop-shadow">
                  {brand.name}
                </span>
                <span className="font-mono text-[10px] text-text-lo tracking-tight mt-0.5 truncate max-w-full">
                  {brand.norm}
                </span>
              </div>

              {/* Bottom active indicator */}
              <div className="absolute bottom-0 inset-x-10 h-0.5 bg-ember-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-[0_0_10px_#F26A1B]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
