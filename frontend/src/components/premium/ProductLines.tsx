"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Zap, Gauge, Sparkles, ExternalLink } from "lucide-react";
import { VehicleDetailModal, CarProductDetail } from "./VehicleDetailModal";

const CAR_PRODUCTS: CarProductDetail[] = [
  {
    id: "estrada-s",
    modelCode: "ESTRADA S",
    name: "Hyper Sport PAO",
    tagline: "100% Sintético Base Éster & Polialfaolefina para conducción extrema",
    image: "/media/carro1-transparent.png",
    gradeBadge: "RACING & TURBO",
    specs: {
      viscosity: "0W-20 / 5W-30",
      interval: "10,000 km",
      approval: "API SP / ILSAC GF-6",
    },
    technicalSheet: {
      kinematic100: "10.4 cSt",
      kinematic40: "58.2 cSt",
      viscosityIndex: "172",
      flashPoint: "238°C",
      tbn: "8.8 mg KOH/g",
      evaporationNoack: "7.8%",
    },
    recommendedEngines: [
      "Turbo GDI / TSI / EcoBoost",
      "V6 y V8 Biturbo",
      "Supercargados",
      "Motores Japoneses Híbridos",
    ],
    packageIncludes: [
      "4 o 5 cuartos de Lubricante 100% Sintético PAO",
      "Filtro de aceite blindado de celulosa sintética",
      "Inspección de 25 puntos de seguridad en elevador",
      "Reseteo de testigo de mantenimiento en computadora",
      "Revisión y relleno de líquidos (frenos, coolant, dirección)",
    ],
    price: "S/ 185.00",
  },
  {
    id: "estrada-x",
    modelCode: "ESTRADA X",
    name: "Euro Performance",
    tagline: "Sintético Premium LongLife Low-SAPS para normas europeas estrictas",
    image: "/media/carro2-transparent.png",
    gradeBadge: "EURO HOMOLOGATED",
    specs: {
      viscosity: "5W-40 LongLife",
      interval: "10,000 km",
      approval: "ACEA C3 / MB 229.51",
    },
    technicalSheet: {
      kinematic100: "14.2 cSt",
      kinematic40: "84.5 cSt",
      viscosityIndex: "175",
      flashPoint: "242°C",
      tbn: "7.6 mg KOH/g",
      evaporationNoack: "8.2%",
    },
    recommendedEngines: [
      "Audi / VW TFSI & TDI",
      "BMW Valvetronic & TwinPower",
      "Mercedes-Benz BlueTEC & CGI",
      "Vehículos con filtros DPF y GPF",
    ],
    packageIncludes: [
      "Galón o cuartos requeridos de fórmula Euro 5W-40",
      "Filtro de cartucho OEM de alta retención",
      "Escaneo OBD2 con informe digital de salud de motor",
      "Verificación de fugas en empaquetaduras y retenes",
      "Garantía escrita de intervalo 10,000 km",
    ],
    price: "S/ 165.00",
  },
  {
    id: "estrada-gt",
    modelCode: "ESTRADA GT",
    name: "Touring & SUV",
    tagline: "Semisintético de Alta Cohesión Molecular para ciudad y carretera",
    image: "/media/carro3-transparent.png",
    gradeBadge: "SUV & CITY DRIVING",
    specs: {
      viscosity: "10W-40 Multi-G",
      interval: "7,500 km",
      approval: "API SN Plus / CF",
    },
    technicalSheet: {
      kinematic100: "14.8 cSt",
      kinematic40: "96.0 cSt",
      viscosityIndex: "160",
      flashPoint: "230°C",
      tbn: "8.5 mg KOH/g",
      evaporationNoack: "10.4%",
    },
    recommendedEngines: [
      "SUVs y Crossovers 1.6L a 3.5L",
      "Sedanes de uso intensivo y colectivo",
      "Motores a GLP y GNV (mayor calor)",
      "Camionetas 4x4 atmosféricas",
    ],
    packageIncludes: [
      "Lubricante semisintético reforzado con aditivo antilodos",
      "Filtro de aceite metálico garantizado",
      "Sopleteado y limpieza de filtro de aire",
      "Revisión de presión de neumáticos y líquido de frenos",
      "Ticket y comprobante electrónico SUNAT",
    ],
    price: "S/ 135.00",
  },
  {
    id: "estrada-r",
    modelCode: "ESTRADA R",
    name: "Heavy Duty Max",
    tagline: "Mineral Refinado para Alto Kilometraje, Carga y Trabajo Pesado",
    image: "/media/carro4-transparent.png",
    gradeBadge: "HEAVY DUTY & FLEET",
    specs: {
      viscosity: "15W-40 / 20W-50",
      interval: "5,000 km",
      approval: "API CK-4 / SL Heavy",
    },
    technicalSheet: {
      kinematic100: "18.5 cSt",
      kinematic40: "162.0 cSt",
      viscosityIndex: "128",
      flashPoint: "246°C",
      tbn: "10.5 mg KOH/g",
      evaporationNoack: "9.1%",
    },
    recommendedEngines: [
      "Camionetas Pickup Hilux, Ranger, D-Max",
      "Motores con más de 120,000 km",
      "Diésel Turbo de trabajo y carga pesada",
      "Furgones comerciales y furgonetas",
    ],
    packageIncludes: [
      "Fórmula de alta viscosidad con aditivo acondicionador de sellos",
      "Filtro diésel / gasolina de uso rudo",
      "Engrase de articulaciones y terminales de suspensión",
      "Ajuste de torque en tapón de cárter con arandela de cobre nueva",
      "Atención express en bahía dedicada de carga",
    ],
    price: "S/ 115.00",
  },
];

export function ProductLines() {
  const [selectedCar, setSelectedCar] = useState<CarProductDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenDetail = (car: CarProductDetail) => {
    setSelectedCar(car);
    setModalOpen(true);
  };

  return (
    <section id="modelos" className="scroll-mt-20 bg-cream-100 text-cream-text py-20 px-6 overflow-hidden border-t border-black/[0.05]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-14">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-wideEyebrow text-cream-muted uppercase font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-ember-600" />
              <span>NUESTRA GAMA • SELECCIONA UN VEHÍCULO PARA VER DETALLES</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight leading-none uppercase">
              FÓRMULA PURA.<br />
              PROTECCIÓN REAL.
            </h2>
            <p className="text-cream-muted text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
              Haz clic en cualquiera de los vehículos de nuestra flota para abrir la ficha técnica interactiva con tolerancias, 
              paquete de aditivos y servicios de taller incluidos.
            </p>
          </div>

          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <a
              href="#catalogo"
              className="inline-flex items-center gap-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold px-7 py-3.5 rounded-full transition-all duration-200 hover:shadow-lg active:scale-95 group"
            >
              <span>Ver Catálogo Completo</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* 4 Car Models Grid from assets (carro1, carro2, carro3, carro4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CAR_PRODUCTS.map((car) => (
            <div
              key={car.id}
              onClick={() => handleOpenDetail(car)}
              className="card-cream rounded-2xl p-6 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden bg-white/70 hover:bg-white"
            >
              {/* Top Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-black/5 text-cream-text group-hover:bg-ember-500 group-hover:text-white transition-colors">
                  {car.gradeBadge}
                </span>
                <span className="font-mono font-bold text-xs text-ember-600 bg-ember-500/10 px-2 py-0.5 rounded">
                  {car.price}
                </span>
              </div>

              {/* Car Cutout from assets */}
              <div className="relative w-full aspect-[250/150] rounded-xl overflow-hidden mb-6 flex items-center justify-center bg-gradient-to-b from-transparent to-black/[0.02]">
                <Image
                  src={car.image}
                  alt={car.name}
                  fill
                  className="object-contain p-2 group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-[10px] font-mono font-semibold shadow-lg">
                    Ver Ficha Completa <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Model Title & Tagline */}
              <div className="space-y-1.5 mb-6">
                <h3 className="font-display font-black text-xl tracking-tight text-cream-text flex items-center justify-between">
                  <span>{car.modelCode}</span>
                  <Sparkles className="w-4 h-4 text-ember-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-cream-muted font-medium line-clamp-1">
                  {car.tagline}
                </p>
              </div>

              {/* Specs Row with thin dividers */}
              <div className="pt-4 border-t border-black/[0.08] grid grid-cols-3 gap-2 text-center font-mono">
                <div className="space-y-0.5">
                  <p className="text-[9px] text-cream-muted uppercase tracking-wider">Intervalo</p>
                  <p className="font-semibold text-[11px] text-cream-text">{car.specs.interval}</p>
                </div>
                <div className="space-y-0.5 border-x border-black/[0.08]">
                  <p className="text-[9px] text-cream-muted uppercase tracking-wider">Viscosidad</p>
                  <p className="font-semibold text-[11px] text-cream-text">{car.specs.viscosity}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] text-cream-muted uppercase tracking-wider">Norma</p>
                  <p className="font-semibold text-[11px] text-cream-text">{car.specs.approval}</p>
                </div>
              </div>

              {/* Action Trigger */}
              <div className="mt-5 pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs font-semibold text-ember-600 group-hover:text-ember-700">
                <span>Explorar Especificaciones</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Hover active bottom line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-ember-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-ember-500/10 flex items-center justify-center text-ember-600 flex-shrink-0">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-cream-text">
                ¿Deseas verificar la compatibilidad exacta de tu motor?
              </h4>
              <p className="text-xs text-cream-muted">
                Nuestro escáner de telemetría y tabla de lubricación OEM identifica la viscosidad exacta por placa de rodaje.
              </p>
            </div>
          </div>
          <a
            href="#agenda"
            className="inline-flex items-center gap-2 bg-ember-500 hover:bg-ember-600 text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-all shrink-0 hover:shadow-md"
          >
            <Zap className="w-3.5 h-3.5" />
            Consultar por Placa
          </a>
        </div>

      </div>

      {/* Interactive Detail Modal Frame */}
      <VehicleDetailModal
        car={selectedCar}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
