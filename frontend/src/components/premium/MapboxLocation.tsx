"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  ShieldCheck,
  ExternalLink,
  Compass,
  Layers,
  Plus,
  Minus,
} from "lucide-react";

declare global {
  interface Window {
    L: any;
  }
}

const LAT = -12.0618501;
const LNG = -75.2309964;
const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/iwmLRK6GpFuhR6i3A";
const GOOGLE_EMBED_URL = `https://maps.google.com/maps?q=${LAT},${LNG}+(Lubricentros+Estrada+S.A.C.)&t=m&z=17&output=embed&iwloc=near`;

export function MapboxLocation() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapMode, setMapMode] = useState<"DARK_VECTOR" | "GOOGLE_EMBED">(
    "DARK_VECTOR"
  );
  const [leafletReady, setLeafletReady] = useState(false);

  useEffect(() => {
    if (mapMode !== "DARK_VECTOR") return;

    const cssId = "leaflet-css-cdn";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initLeaflet = () => {
      if (!mapContainerRef.current || !window.L) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      try {
        const L = window.L;
        const map = L.map(mapContainerRef.current, {
          center: [LAT, LNG],
          zoom: 17,
          zoomControl: false,
          attributionControl: false,
        });

        // CartoDB Dark Matter high-contrast automotive map tiles (zero API key required)
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            subdomains: "abcd",
            maxZoom: 20,
          }
        ).addTo(map);

        const customIcon = L.divIcon({
          className: "estrada-custom-leaflet-pin",
          iconSize: [48, 48],
          iconAnchor: [24, 24],
          popupAnchor: [0, -24],
          html: `
            <div style="position:relative; width:48px; height:48px; display:flex; align-items:center; justify-content:center;">
              <div style="position:absolute; width:48px; height:48px; border-radius:50%; background:rgba(242,106,27,0.35); animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
              <div style="position:relative; width:34px; height:34px; border-radius:50%; background:#0A0A0B; border:2.5px solid #F26A1B; display:flex; align-items:center; justify-content:center; box-shadow:0 0 20px rgba(242,106,27,0.9);">
                <span style="color:#F26A1B; font-weight:900; font-family:'Sora',system-ui,sans-serif; font-size:14px;">E</span>
              </div>
            </div>
          `,
        });

        const popupHtml = `
          <div style="padding:12px; background:#0A0A0B; color:#F5F5F5; font-family:'Inter',system-ui,sans-serif; border-radius:14px; border:1px solid rgba(242,106,27,0.45); box-shadow:0 16px 36px rgba(0,0,0,0.95); min-width:225px;">
            <div style="display:flex; align-items:center; gap:7px; margin-bottom:5px;">
              <span style="width:8px; height:8px; border-radius:50%; background:#F26A1B; display:inline-block;"></span>
              <strong style="font-size:12px; letter-spacing:0.04em; color:#fff;">LUBRICENTROS ESTRADA S.A.C.</strong>
            </div>
            <p style="font-size:11px; color:#A3AFC7; margin:0 0 8px 0; line-height:1.35;">
              Av. José Carlos Mariátegui, El Tambo — Huancayo (WQQ9+7JR)
            </p>
            <div style="margin-bottom:9px;">
              <span style="display:inline-block; font-size:10px; font-weight:700; color:#10B981; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); padding:2px 7px; border-radius:999px;">
                ● ABIERTO HOY • ATENCIÓN EXPRESS
              </span>
            </div>
            <a href="${GOOGLE_MAPS_URL}" target="_blank" rel="noopener noreferrer" style="display:block; text-align:center; background:#F26A1B; color:#fff; text-decoration:none; font-size:11px; font-weight:700; padding:7px 12px; border-radius:999px;">
              Abrir Ruta GPS en Google Maps →
            </a>
          </div>
        `;

        const marker = L.marker([LAT, LNG], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupHtml, {
            closeButton: false,
            className: "estrada-dark-popup",
          });

        setTimeout(() => {
          try {
            map.invalidateSize();
            marker.openPopup();
          } catch {
            // ignore
          }
        }, 250);

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setLeafletReady(true);
      } catch (e) {
        console.warn("Fallback to Google Maps Embed:", e);
        setMapMode("GOOGLE_EMBED");
      }
    };

    if (window.L) {
      initLeaflet();
    } else {
      const scriptId = "leaflet-js-cdn";
      const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener("load", initLeaflet);
      } else {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => initLeaflet();
        script.onerror = () => setMapMode("GOOGLE_EMBED");
        document.head.appendChild(script);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapMode]);

  const handleResetLocation = () => {
    if (mapMode === "DARK_VECTOR" && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([LAT, LNG], 17, {
        animate: true,
        duration: 0.9,
      });
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    } else {
      setMapMode("DARK_VECTOR");
    }
  };

  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  return (
    <section
      id="ubicacion"
      className="scroll-mt-20 relative w-full py-24 bg-ink-950 border-t border-white/[0.08] overflow-hidden"
    >
      <style>{`
        .estrada-dark-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .estrada-dark-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .estrada-dark-popup .leaflet-popup-tip {
          background: #0A0A0B !important;
          border: 1px solid rgba(242,106,27,0.45);
        }
      `}</style>

      {/* Background ambient lighting */}
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-ember-500/10 blur-[180px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-text-lo uppercase">
              <span className="w-2 h-2 rounded-full bg-ember-500 animate-ping" />
              <span>UBICACIÓN ESTRATÉGICA & TALLER PRINCIPAL</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight leading-none uppercase text-white">
              VISÍTANOS EN NUESTRO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ember-400 via-ember-500 to-amber-500">
                CENTRO DE LUBRICACIÓN
              </span>
            </h2>
            <p className="text-text-lo text-sm sm:text-base max-w-xl font-light leading-relaxed">
              Infraestructura diseñada con fosas de cambio rápido, elevadores
              hidráulicos y estación de diagnosis electrónica en Huancayo.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-wrap justify-start lg:justify-end gap-2.5">
            <button
              type="button"
              onClick={() =>
                setMapMode((m) =>
                  m === "DARK_VECTOR" ? "GOOGLE_EMBED" : "DARK_VECTOR"
                )
              }
              className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold px-4 py-3 rounded-full border border-white/10 transition-all active:scale-95"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>
                {mapMode === "DARK_VECTOR"
                  ? "Vista Google Maps"
                  : "Vista Nocturna 3D"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleResetLocation}
              className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold px-4 py-3 rounded-full border border-white/10 transition-all active:scale-95"
            >
              <Compass className="w-4 h-4 text-ember-500" />
              <span>Centrar Taller</span>
            </button>

            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-ember-500 hover:bg-ember-600 text-white text-xs font-semibold px-5 py-3 rounded-full transition-all shadow-lg shadow-ember-500/25 active:scale-95 group"
            >
              <span>Abrir en Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Map Grid: Map Viewport + Info Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Interactive Map Viewport */}
          <div className="lg:col-span-8 relative min-h-[430px] sm:min-h-[510px] rounded-3xl overflow-hidden border border-white/15 bg-[#0c1017] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            {mapMode === "DARK_VECTOR" ? (
              <>
                <div
                  ref={mapContainerRef}
                  className="absolute inset-0 w-full h-full z-0"
                />
                {!leafletReady ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0c1017] text-xs font-mono text-text-lo">
                    Cargando cartografía interactiva de Huancayo…
                  </div>
                ) : null}

                {/* Controles de Zoom Personalizados */}
                <div className="absolute top-4 right-4 z-[400] flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleZoom(1)}
                    aria-label="Acercar mapa"
                    className="w-9 h-9 rounded-xl bg-ink-950/90 hover:bg-ember-500 text-white border border-white/15 flex items-center justify-center shadow-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZoom(-1)}
                    aria-label="Alejar mapa"
                    className="w-9 h-9 rounded-xl bg-ink-950/90 hover:bg-ember-500 text-white border border-white/15 flex items-center justify-center shadow-lg transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <iframe
                title="Ubicación Lubricentros Estrada S.A.C. Huancayo"
                src={GOOGLE_EMBED_URL}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}

            {/* Top Overlay HUD Badge */}
            <div className="absolute top-4 left-4 z-[400] flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-ink-950/90 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white pointer-events-none shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>GPS ACTIVO • LAT: -12.0618° | LNG: -75.2310°</span>
            </div>

            {/* Bottom Overlay Coordinates */}
            <div className="absolute bottom-4 left-4 z-[400] hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-ink-950/90 backdrop-blur-md border border-white/15 text-xs font-mono text-text-lo pointer-events-none shadow-lg">
              <MapPin className="w-3.5 h-3.5 text-ember-500" />
              <span>Av. José Carlos Mariátegui, Huancayo • Plus Code: WQQ9+7JR</span>
            </div>
          </div>

          {/* Location Info Card */}
          <div className="lg:col-span-4 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/15 p-6 sm:p-8 flex flex-col justify-between backdrop-blur-xl shadow-xl">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-ember-400 tracking-wider uppercase font-semibold block">
                  PUNTO DE ATENCIÓN DIRECTA
                </span>
                <h3 className="font-display font-bold text-xl text-white">
                  Taller Central Estrada Huancayo
                </h3>
                <p className="text-xs text-text-lo leading-relaxed">
                  Acceso vehicular directo por Av. Mariátegui. Bahías techadas
                  con altura para camionetas y flotas comerciales.
                </p>
              </div>

              {/* Hours */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Horarios de Atención</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-text-lo">
                  <div className="flex justify-between">
                    <span>Lunes a Sábado:</span>
                    <span className="text-white font-medium">
                      8:00 AM – 7:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingos y Feriados:</span>
                    <span className="text-white font-medium">
                      8:30 AM – 2:00 PM
                    </span>
                  </div>
                </div>
              </div>

              {/* Facility Features */}
              <div className="space-y-2 text-xs text-text-lo">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-ember-500" />
                  <span>3 Bahías simultáneas de cambio rápido</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-ember-500" />
                  <span>Escáner automotriz OBD2 multimarcas</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-ember-500" />
                  <span>
                    Sala de espera con Wi-Fi y monitoreo de servicio
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/10 mt-6 space-y-2.5">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-ember-500 hover:bg-ember-600 text-white font-semibold text-xs py-3.5 px-6 rounded-full transition-all shadow-lg shadow-ember-500/25 active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                Cómo Llegar con GPS
              </a>
              <a
                href="https://wa.me/51987654321?text=Hola%20Lubricentros%20Estrada%2C%20deseo%20saber%20si%20tienen%20bah%C3%ADa%20libre%20para%20cambio%20de%20aceite%20hoy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.1] text-white font-medium text-xs py-3 px-6 rounded-full border border-white/10 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Consultar Disponibilidad de Bahía
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
