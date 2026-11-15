"use client";

import React, { useState } from "react";
import { X, BookOpen, CheckCircle2, ShieldCheck, AlertCircle, Send } from "lucide-react";

interface ClaimsBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClaimsBookModal({ isOpen, onClose }: ClaimsBookModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [claimNumber, setClaimNumber] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    documentType: "DNI",
    documentNumber: "",
    phone: "",
    email: "",
    address: "",
    type: "RECLAMO", // RECLAMO o QUEJA
    serviceContracted: "SERVICIO_LUBRICACION",
    plate: "",
    claimedAmount: "",
    detail: "",
    request: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedCode = `LR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setClaimNumber(generatedCode);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-ink-950 border border-white/15 shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/4 w-96 h-40 bg-ember-500/10 blur-[100px] pointer-events-none rounded-full" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-5 mb-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-ember-500/10 border border-ember-500/30 flex items-center justify-center text-ember-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-xl text-white">
                  Libro de Reclamaciones Virtual
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-text-lo">
                  D.S. 011-2011-PCM / INDECOPI
                </span>
              </div>
              <p className="text-xs text-text-lo font-mono">
                Lubricentros Estrada S.A.C. • R.U.C. 20608945123 • Av. José Carlos Mariátegui 1290, Huancayo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-xl text-text-dim hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto pr-2 space-y-6 flex-1 text-xs">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-display">
                  Hoja de Reclamación Registrada
                </h3>
                <p className="text-text-lo text-xs max-w-md mx-auto">
                  Su reclamo ha sido recibido conforme a ley. Hemos enviado una copia certificada a su correo electrónico.
                </p>
              </div>
              <div className="inline-block p-4 rounded-2xl bg-ink-900 border border-white/10 font-mono text-sm text-ember-400 font-bold">
                CÓDIGO DE SEGUIMIENTO: {claimNumber}
              </div>
              <p className="text-[11px] text-text-dim max-w-sm mx-auto">
                Conforme al Art. 24 de la Ley N° 29571, la empresa dará respuesta a su requerimiento en un plazo no mayor a 15 días hábiles.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-full bg-ember-500 hover:bg-ember-600 text-white font-semibold shadow-lg shadow-ember-500/25"
                >
                  Entendido y Finalizar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3 text-text-lo">
                <ShieldCheck className="w-5 h-5 text-ember-400 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-white">Importante:</strong> La formulación de un reclamo no impide acudir a otras vías de controversia ni es condición previa para interponer una denuncia ante el INDECOPI.
                </p>
              </div>

              {/* Seccion 1: Datos del Consumidor */}
              <div className="space-y-3">
                <h4 className="font-mono uppercase text-[11px] text-ember-400 tracking-wider font-bold">
                  1. Identificación del Consumidor Reclamante
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-text-dim font-mono text-[10px] block mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Pérez Estrada"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-ink-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-text-dim focus:border-ember-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-text-dim font-mono text-[10px] block mb-1">Tipo Doc.</label>
                      <select
                        value={formData.documentType}
                        onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                        className="w-full bg-ink-900 border border-white/15 rounded-xl px-2 py-2.5 text-white font-mono focus:border-ember-500 focus:outline-none"
                      >
                        <option value="DNI">DNI</option>
                        <option value="CE">C.E.</option>
                        <option value="RUC">RUC</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-text-dim font-mono text-[10px] block mb-1">N° de Documento *</label>
                      <input
                        type="text"
                        required
                        placeholder="70123456"
                        value={formData.documentNumber}
                        onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                        className="w-full bg-ink-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-text-dim focus:border-ember-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-text-dim font-mono text-[10px] block mb-1">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+51 987 654 321"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-ink-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-text-dim focus:border-ember-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-text-dim font-mono text-[10px] block mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      placeholder="correo@ejemplo.pe"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-ink-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-text-dim focus:border-ember-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-text-dim font-mono text-[10px] block mb-1">Dirección de Domicilio</label>
                    <input
                      type="text"
                      placeholder="Av. / Jr. / Calle, Distrito, Ciudad"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-ink-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-text-dim focus:border-ember-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Seccion 2: Identificacion del Bien Contratado */}
              <div className="space-y-3 pt-2">
                <h4 className="font-mono uppercase text-[11px] text-ember-400 tracking-wider font-bold">
                  2. Identificación del Bien o Servicio Contratado
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-text-dim font-mono text-[10px] block mb-1">Tipo de Atención</label>
                    <select
                      value={formData.serviceContracted}
                      onChange={(e) => setFormData({ ...formData, serviceContracted: e.target.value })}
                      className="w-full bg-ink-900 border border-white/15 rounded-xl px-3 py-2.5 text-white font-mono focus:border-ember-500 focus:outline-none"
                    >
                      <option value="SERVICIO_LUBRICACION">Servicio de Cambio de Aceite / Filtro</option>
                      <option value="COMPRA_PRODUCTO">Compra de Lubricante / Aditivo en Mostrador</option>
                      <option value="ATENCION_POS">Facturación Electrónica / POS</option>
                      <option value="OTRO">Otro Servicio Vehicular</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-text-dim font-mono text-[10px] block mb-1">Placa del Vehículo</label>
                    <input
                      type="text"
                      placeholder="Ej. ABC-123"
                      value={formData.plate}
                      onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                      className="w-full bg-ink-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-text-dim uppercase focus:border-ember-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-text-dim font-mono text-[10px] block mb-1">Monto Reclamado (S/)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.claimedAmount}
                      onChange={(e) => setFormData({ ...formData, claimedAmount: e.target.value })}
                      className="w-full bg-ink-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-text-dim focus:border-ember-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Seccion 3: Detalle de la Reclamación */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono uppercase text-[11px] text-ember-400 tracking-wider font-bold">
                    3. Detalle de la Reclamación y Pedido del Consumidor
                  </h4>
                  <div className="flex items-center gap-4 text-white">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="claimType"
                        value="RECLAMO"
                        checked={formData.type === "RECLAMO"}
                        onChange={() => setFormData({ ...formData, type: "RECLAMO" })}
                        className="accent-ember-500"
                      />
                      <span className="font-mono text-[11px]">Reclamo</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="claimType"
                        value="QUEJA"
                        checked={formData.type === "QUEJA"}
                        onChange={() => setFormData({ ...formData, type: "QUEJA" })}
                        className="accent-ember-500"
                      />
                      <span className="font-mono text-[11px]">Queja</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-text-dim font-mono text-[10px] block mb-1">
                    Detalle del Reclamo (Disconformidad con el producto o servicio) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describa claramente los hechos ocurridos..."
                    value={formData.detail}
                    onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                    className="w-full bg-ink-900 border border-white/15 rounded-xl p-3 text-white font-mono placeholder:text-text-dim focus:border-ember-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-text-dim font-mono text-[10px] block mb-1">
                    Pedido Concreto del Consumidor *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Especifique qué solución o respuesta solicita a Lubricentros Estrada..."
                    value={formData.request}
                    onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                    className="w-full bg-ink-900 border border-white/15 rounded-xl p-3 text-white font-mono placeholder:text-text-dim focus:border-ember-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-white/15 text-text-lo hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-ember-500 hover:bg-ember-600 text-white font-semibold shadow-lg shadow-ember-500/25 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Reclamación</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}