"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Play, Pause, Volume2, VolumeX, Gauge, Flame, Activity, ShieldAlert, Cpu } from "lucide-react";

interface EngineDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EngineDetailModal({ isOpen, onClose }: EngineDetailModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<"zones" | "telemetry" | "tribology">("zones");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl bg-ink-950 border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.9)] text-text-hi p-6 sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.2] text-text-lo hover:text-white transition-all z-30"
          aria-label="Cerrar análisis de motor"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Eyebrow */}
        <div className="flex items-center gap-3 text-xs font-mono text-ember-400 font-semibold mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-ember-500 animate-ping" />
          <span>ANÁLISIS DINÁMICO DE PROPULSIÓN // ESTRADA ENGINEERING LAB</span>
        </div>

        <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight uppercase mb-6">
          ARQUITECTURA MECÁNICA & CINÉTICA DE LUBRICACIÓN
        </h2>

        {/* Video Player Box with Controls */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl mb-8 group">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/media/motor1.mp4" type="video/mp4" />
          </video>

          {/* Top Video HUD Info */}
          <div className="absolute top-4 left-4 flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ESTRADA MOTOR LAB • 1080P PRO-RES</span>
          </div>

          {/* Bottom Floating Control Bar */}
          <div className="absolute bottom-4 inset-x-4 flex items-center justify-between px-4 py-2.5 rounded-xl bg-ink-950/80 backdrop-blur-md border border-white/15">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="p-2 rounded-lg bg-white/10 hover:bg-ember-500 text-white transition-all"
                title={isPlaying ? "Pausar video" : "Reproducir video"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={toggleSound}
                className="p-2 rounded-lg bg-white/10 hover:bg-ember-500 text-white transition-all"
                title={isMuted ? "Activar sonido" : "Silenciar sonido"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-text-lo" /> : <Volume2 className="w-4 h-4 text-white" />}
              </button>
              <span className="text-xs font-mono text-text-lo">MOTOR V8 BITURBO // PRUEBA DE CORTE HTHS</span>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-emerald-400">
              <span>● VISCOSIDAD: 10.4 cSt</span>
              <span>● ESTABILIDAD: 100%</span>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("zones")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "zones"
                ? "bg-ember-500 text-white font-bold shadow-md shadow-ember-500/30"
                : "bg-white/[0.04] text-text-lo hover:text-white"
            }`}
          >
            4 Zonas de Lubricación Crítica
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("telemetry")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "telemetry"
                ? "bg-ember-500 text-white font-bold shadow-md shadow-ember-500/30"
                : "bg-white/[0.04] text-text-lo hover:text-white"
            }`}
          >
            Telemetría y Tolerancias Térmicas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tribology")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "tribology"
                ? "bg-ember-500 text-white font-bold shadow-md shadow-ember-500/30"
                : "bg-white/[0.04] text-text-lo hover:text-white"
            }`}
          >
            Tribología Molecular y Aditivos
          </button>
        </div>

        {/* Tab 1: 4 Critical Zones */}
        {activeTab === "zones" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 text-ember-400 font-mono text-xs font-bold mb-1">
                <Flame className="w-4 h-4" />
                <span>1. CÁMARA DE COMBUSTIÓN & PISTONES</span>
              </div>
              <p className="text-xs text-text-lo leading-relaxed">
                Los aros de compresión alcanzan velocidades lineales superiores a 25 m/s bajo presiones de pico de 180 bar. La fórmula Estrada crea una película de cizallamiento ultra-fina que previene micro-soldaduras y pérdida de compresión.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-1">
                <Gauge className="w-4 h-4" />
                <span>2. COJINETES DE BIELA & CIGÜEÑAL</span>
              </div>
              <p className="text-xs text-text-lo leading-relaxed">
                Régimen hidrodinámico puro: soporta cargas rotacionales de hasta 18,000 N por bancada. Evita el contacto metal-metal con un flujo volumétrico continuo garantizado por la estabilidad de bomba a 4.8 bar.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold mb-1">
                <Activity className="w-4 h-4" />
                <span>3. TURBOCARGADOR & RODAMIENTOS CERÁMICOS</span>
              </div>
              <p className="text-xs text-text-lo leading-relaxed">
                El eje del turbo gira hasta a 220,000 RPM en contacto con gases de escape a más de 950°C. La base PAO 100% sintética resiste la carbonización y la coquización en los conductos de retorno de aceite.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold mb-1">
                <Cpu className="w-4 h-4" />
                <span>4. TREN DE VÁLVULAS & DISTRIBUCIÓN VARIABLE</span>
              </div>
              <p className="text-xs text-text-lo leading-relaxed">
                Actuación hidráulica precisa de solenoides VVT-i / VANOS / VTEC. Tiempo de respuesta de 0.02s en arranques a temperaturas bajo cero, eliminando el desgaste del árbol de levas durante el encendido.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Telemetry */}
        {activeTab === "telemetry" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-ink-900 border border-white/10 space-y-2">
              <span className="text-text-dim text-[10px] block uppercase">Punto de Inflamación Flash Point</span>
              <p className="text-2xl font-bold text-white">242°C</p>
              <p className="text-[11px] text-text-lo">Resistencia superior contra descomposición química por hipertermia.</p>
            </div>
            <div className="p-4 rounded-xl bg-ink-900 border border-white/10 space-y-2">
              <span className="text-text-dim text-[10px] block uppercase">Viscosidad HTHS (150°C)</span>
              <p className="text-2xl font-bold text-white">3.6 mPa·s</p>
              <p className="text-[11px] text-text-lo">Grosor de película protectora bajo alto esfuerzo de corte a alta temperatura.</p>
            </div>
            <div className="p-4 rounded-xl bg-ink-900 border border-white/10 space-y-2">
              <span className="text-text-dim text-[10px] block uppercase">Pérdida por Evaporación (Noack)</span>
              <p className="text-2xl font-bold text-emerald-400">7.8%</p>
              <p className="text-[11px] text-text-lo">Consumo mínimo de aceite entre mantenimientos (hasta 45% menos vaporización).</p>
            </div>
          </div>
        )}

        {/* Tab 3: Tribology */}
        {activeTab === "tribology" && (
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <h4 className="font-display font-bold text-base text-white">
              Paquete de Aditivos Químicos de Nivel Competición
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-mono text-amber-400 font-semibold block">Ditiomolibdeno (MoDTC)</span>
                <p className="text-text-lo">Micro-partículas que pulen nano-rugosidades reduciendo el coeficiente de fricción de 0.08 a 0.02.</p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-cyan-400 font-semibold block">ZDDP Anti-Desgaste Primario</span>
                <p className="text-text-lo">Crea una película de fosfato sacrificial de 100nm sobre árboles de levas y seguidores de balancín.</p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-emerald-400 font-semibold block">Dispersantes de Boro sin Cenizas</span>
                <p className="text-text-lo">Encapsulan hollín y micro-carbón manteniéndolo en suspensión hasta el filtro sin taponar conductos.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
