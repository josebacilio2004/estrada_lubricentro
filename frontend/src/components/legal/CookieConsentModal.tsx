"use client";

import React, { useState, useEffect } from "react";
import { Cookie, Check, X, Shield, Sliders } from "lucide-react";

interface CookieConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CookieConsentModal({ isOpen, onClose }: CookieConsentModalProps) {
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    analytics: true,
    telemetry: true,
    marketing: false,
  });

  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem("estrada_cookie_preferences", JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleAcceptAll = () => {
    const all = { essential: true, analytics: true, telemetry: true, marketing: true };
    setPreferences(all);
    localStorage.setItem("estrada_cookie_preferences", JSON.stringify(all));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-ink-950 border border-white/15 shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[88vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-5 mb-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-white">
                Ajuste de Cookies & Privacidad
              </h2>
              <p className="text-xs text-text-lo font-mono">
                Control de preferencias de almacenamiento local y telemetría
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de cookies"
            className="p-2 rounded-xl text-text-dim hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto pr-2 space-y-4 flex-1 text-xs">
          <p className="text-text-lo leading-relaxed">
            Lubricentros Estrada utiliza cookies técnicas esenciales y telemetría vehicular segura para garantizar el correcto funcionamiento del portal de clientes, la sesión del terminal POS y la persistencia de sus consultas por placa.
          </p>

          <div className="space-y-3 pt-2">
            {/* Esenciales */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white font-mono">Cookies Técnicas Esenciales</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    OBLIGATORIAS
                  </span>
                </div>
                <p className="text-[11px] text-text-dim">
                  Requeridas para la autenticación de placas, tokens de sesión y seguridad contra ataques CSRF.
                </p>
              </div>
              <input
                type="checkbox"
                checked={true}
                disabled
                className="w-4 h-4 accent-emerald-500 cursor-not-allowed"
              />
            </div>

            {/* Rendimiento & Telemetría */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div className="space-y-1 pr-4">
                <span className="font-bold text-white font-mono">Telemetría de Servicio y Caché POS</span>
                <p className="text-[11px] text-text-dim">
                  Permite sincronización instantánea del catálogo en offline y tiempos de carga reducidos.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.telemetry}
                onChange={(e) => setPreferences({ ...preferences, telemetry: e.target.checked })}
                className="w-4 h-4 accent-ember-500 cursor-pointer"
              />
            </div>

            {/* Analítica */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div className="space-y-1 pr-4">
                <span className="font-bold text-white font-mono">Analítica de Experiencia y Diagnóstico</span>
                <p className="text-[11px] text-text-dim">
                  Recopila métricas anónimas sobre tiempos de respuesta para mejorar la interfaz.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="w-4 h-4 accent-ember-500 cursor-pointer"
              />
            </div>
          </div>

          {saved && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-center flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Preferencias guardadas correctamente
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-text-lo hover:text-white text-xs font-mono transition-colors"
          >
            Rechazar opcionales
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2.5 rounded-full border border-white/15 text-white hover:bg-white/10 text-xs font-semibold transition-colors"
            >
              Guardar Selección
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-5 py-2.5 rounded-full bg-ember-500 hover:bg-ember-600 text-white text-xs font-semibold shadow-lg shadow-ember-500/25 transition-all"
            >
              Aceptar Todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}