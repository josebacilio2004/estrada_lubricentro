"use client";

import React, { useState } from "react";
import { X, Volume2, VolumeX, Sparkles, Play } from "lucide-react";

interface FilmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilmModal({ isOpen, onClose }: FilmModalProps) {
  const [muted, setMuted] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-ink-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-ink-900/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-ember-500 animate-pulse" />
            <span className="font-display font-bold text-sm tracking-widest text-white uppercase">
              ESTRADA FILM • LA INGENIERÍA DEL RENDIMIENTO
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted(!muted)}
              className="p-2 rounded-full hover:bg-white/10 text-text-lo hover:text-white transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-ember-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-text-lo hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cinematic Motion Video / Canvas Stage */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          
          {/* Animated Motion Canvas Simulation */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Dynamic visual aura */}
            <div className="absolute w-[500px] h-[300px] bg-ember-500/20 blur-[120px] rounded-full animate-pulse" />
            
            {/* Engine Motion Layer */}
            <div className="relative z-10 text-center space-y-4 p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-ember-400 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                Render Cinematográfico Ultra-HD
              </div>
              
              <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight uppercase leading-tight">
                PROTECCIÓN EXTREMA.<br />
                <span className="text-ember-500">MOLÉCULA A MOLÉCULA.</span>
              </h2>

              <p className="text-text-lo text-xs sm:text-sm max-w-md mx-auto font-light">
                Descubre cómo los aditivos de zinc y molibdeno puro crean una película que soporta 150°C y 10,000 km de exigencia continua.
              </p>

              <div className="pt-2">
                <a
                  href="#agenda"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 bg-ember-500 hover:bg-ember-600 text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-all"
                >
                  Agendar Cambio Ahora
                </a>
              </div>
            </div>
          </div>

          {/* Film Grain & Scanline Aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
        </div>

      </div>
    </div>
  );
}
