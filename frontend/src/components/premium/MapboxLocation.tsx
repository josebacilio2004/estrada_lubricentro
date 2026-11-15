"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Clock, Phone, ShieldCheck, ExternalLink, Compass } from "lucide-react";

declare global {
  interface Window {
    mapboxgl: any;
  }
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const LOCATION_COORDS: [number, number] = [-75.2309964, -12.0618501]; // Lng, Lat
const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/iwmLRK6GpFuhR6i3A";

export function MapboxLocation() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    // Inject Mapbox CSS if not present
    const cssId = "mapbox-gl-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css";
      document.head.appendChild(link);
    }

    // Load Mapbox GL JS script
    const loadMapboxScript = () => {
      if (window.mapboxgl) {
        initMap();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js";
      script.async = true;
      script.onload = () => initMap();
      script.onerror = () => setMapError(true);
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainerRef.current || mapInstanceRef.current || !window.mapboxgl) return;

      try {
        window.mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new window.mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: LOCATION_COORDS,
          zoom: 16.2,
          pitch: 52, // 3D perspective pitch
          bearing: -20,
          antialias: true,
        });

        map.addControl(new window.mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

        // Custom Animated Glowing Marker Element
        const el = document.createElement("div");
        el.className = "estrada-map-marker";
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.cursor = "pointer";
        el.innerHTML = `
          <div style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:#F26A1B; opacity:0.4; animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:relative; width:28px; height:28px; border-radius:50%; background:#0A0A0B; border:2px solid #F26A1B; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(242,106,27,0.8);">
              <span style="color:#F26A1B; font-weight:900; font-family:'Sora',sans-serif; font-size:12px;">E</span>
            </div>
          </div>
        `;

        // Popup with Workshop details
        const popup = new window.mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(`
            <div style="padding:10px; background:#0A0A0B; color:#F5F5F5; font-family:'Inter',sans-serif; border-radius:12px; border:1px solid rgba(255,255,255,0.15); box-shadow:0 15px 30px rgba(0,0,0,0.9); min-width:210px;">
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                <span style="width:8px; height:8px; border-radius:50%; background:#F26A1B;"></span>
                <strong style="font-family:'Sora',sans-serif; font-size:12px; letter-spacing:0.05em; color:#fff;">LUBRICENTROS ESTRADA</strong>
              </div>
              <p style="font-size:11px; color:#9A9A9F; margin:0 0 8px 0; line-height:1.3;">Av. Mariátegui, Huancayo (WQQ9+7JR)</p>
              <span style="display:inline-block; font-size:10px; font-weight:bold; color:#10B981; background:rgba(16,185,129,0.15); padding:2px 6px; border-radius:4px; margin-bottom:8px;">ABIERTO HOY • ATENCIÓN EXPRESS</span>
              <a href="${GOOGLE_MAPS_URL}" target="_blank" style="display:block; text-align:center; background:#F26A1B; color:#fff; text-decoration:none; font-size:11px; font-weight:600; padding:6px 10px; border-radius:8px;">Cómo Llegar →</a>
            </div>
          `);

        new window.mapboxgl.Marker(el)
          .setLngLat(LOCATION_COORDS)
          .setPopup(popup)
          .addTo(map);

        map.on("load", () => {
          setMapLoaded(true);
        });

        mapInstanceRef.current = map;
      } catch (err) {
        console.error("Mapbox init error:", err);
        setMapError(true);
      }
    };

    loadMapboxScript();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleResetLocation = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: LOCATION_COORDS,
        zoom: 16.5,
        pitch: 55,
        bearing: -20,
        essential: true,
      });
    }
  };

  return (
    <section id="ubicacion" className="scroll-mt-20 relative w-full py-24 bg-ink-950 border-t border-white/[0.08] overflow-hidden">
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
              Infraestructura diseñada con fosas de cambio rápido, elevadores hidráulicos y estación de diagnosis electrónica en Huancayo.
            </p>
          </div>

          <div className="lg:col-span-4 flex justify-start lg:justify-end gap-3">
            <button
              type="button"
              onClick={handleResetLocation}
              className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold px-5 py-3 rounded-full border border-white/10 transition-all active:scale-95"
            >
              <Compass className="w-4 h-4 text-ember-500" />
              <span>Centrar Taller</span>
            </button>
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-ember-500 hover:bg-ember-600 text-white text-xs font-semibold px-6 py-3 rounded-full transition-all shadow-lg shadow-ember-500/25 active:scale-95 group"
            >
              <span>Abrir en Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Map Grid: Map Viewport + Info Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Mapbox Canvas Container */}
          <div className="lg:col-span-8 relative min-h-[420px] sm:min-h-[500px] rounded-3xl overflow-hidden border border-white/15 bg-ink-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
            
            {/* Top Overlay HUD Badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-ink-950/85 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MAPBOX 3D • LAT: -12.0618° | LNG: -75.2310°</span>
            </div>

            {/* Bottom Overlay Coordinates */}
            <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ink-950/85 backdrop-blur-md border border-white/10 text-xs font-mono text-text-lo pointer-events-none">
              <MapPin className="w-3.5 h-3.5 text-ember-500" />
              <span>Av. Mariátegui, Huancayo • Plus Code: WQQ9+7JR</span>
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
                  Acceso vehicular directo por Av. Mariátegui. Bahías techadas con altura para camionetas y flotas comerciales.
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
                    <span className="text-white font-medium">8:00 AM – 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingos y Feriados:</span>
                    <span className="text-white font-medium">8:30 AM – 2:00 PM</span>
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
                  <span>Sala de espera con Wi-Fi y monitoreo de servicio</span>
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
