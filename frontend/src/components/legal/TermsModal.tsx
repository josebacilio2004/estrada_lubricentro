"use client";

import React from "react";
import { X, FileText, Check, ShieldCheck } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-ink-950 border border-white/15 shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[88vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-5 mb-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-white">
                Términos y Condiciones del Servicio
              </h2>
              <p className="text-xs text-text-lo font-mono">
                Lubricentros Estrada S.A.C. • R.U.C. 20608945123 • Última actualización: Noviembre 2026
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar términos"
            className="p-2 rounded-xl text-text-dim hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto pr-2 space-y-5 flex-1 text-xs text-text-lo leading-relaxed font-light">
          <section className="space-y-2">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-ember-500">1.</span> Objeto y Ámbito de Aplicación
            </h3>
            <p>
              El presente documento establece las condiciones generales que regulan el uso del portal web, la consulta del historial de mantenimiento por placa, la emisión de comprobantes de pago electrónicos y los servicios presenciales de lubricación automotriz brindados por <strong className="text-white">Lubricentros Estrada S.A.C.</strong> en sus instalaciones de Huancayo, Junín.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-ember-500">2.</span> Especificaciones Técnicas y Garantía de Insumos
            </h3>
            <p>
              Todos los lubricantes de motor, fluidos de transmisión, refrigerantes y elementos filtrantes comercializados por Lubricentros Estrada cuentan con certificación de origen oficial de sus respectivos fabricantes (Mobil, Castrol, Motul, Shell, Liqui Moly, Mann Filter, Bosch). Las viscosidades y especificaciones (API SP, ILSAC GF-6, ACEA C3) recomendadas al cliente son verificadas en manuales de taller automotriz OEM.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-ember-500">3.</span> Recepción e Inspección Vehicular en Bahía
            </h3>
            <p>
              Al ingresar a la bahía de servicio express, el vehículo es sometido a un protocolo de verificación visual que incluye: nivel de aceite previo, estado del tapón de cárter, presencia de fugas preexistentes y odómetro. El cliente es notificado en caso de detectarse deformaciones en roscas o desgastes anómalos previos a la intervención.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-ember-500">4.</span> Portal de Clientes y Consulta por Placa
            </h3>
            <p>
              El acceso al portal de autoservicio para consulta de historial y mantenimiento predictivo es de carácter informativo. El cliente es responsable de custodiar la clave de acceso asociada a su placa vehicular. Lubricentros Estrada implementa cifrado TLS y hashing seguro de contraseñas.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-ember-500">5.</span> Protección de Datos Personales (Ley N° 29733)
            </h3>
            <p>
              En cumplimiento de la Ley de Protección de Datos Personales de la República del Perú, los datos proporcionados (nombres, teléfono, placa, kilometraje y correo) son utilizados exclusivamente para la gestión de su comprobante electrónico SUNAT y el recordatorio técnico de sus próximos servicios. No compartimos información con terceros no autorizados.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-ember-500 hover:bg-ember-600 text-white text-xs font-semibold shadow-lg shadow-ember-500/25 transition-all"
          >
            He leído y acepto los términos
          </button>
        </div>
      </div>
    </div>
  );
}