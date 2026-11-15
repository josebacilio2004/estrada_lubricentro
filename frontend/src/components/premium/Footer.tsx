"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Instagram, Youtube, Linkedin, Twitter, BookOpen, ShieldCheck, Cookie, FileText } from "lucide-react";
import { ClaimsBookModal } from "@/components/legal/ClaimsBookModal";
import { TermsModal } from "@/components/legal/TermsModal";
import { CookieConsentModal } from "@/components/legal/CookieConsentModal";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Legal Modal states
  const [isClaimsOpen, setIsClaimsOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isCookiesOpen, setIsCookiesOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-ink-950 text-text-lo text-xs border-t border-white/[0.06] pt-16 pb-12 px-6">
      <div className="max-w-[1400px] mx-auto space-y-14">
        
        {/* Main Grid: 4 columns matching DOSLA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Col 1: Brand & Social (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-display font-extrabold text-2xl tracking-[0.28em] text-white">
                ESTRAD<span className="text-ember-500">A</span>
              </span>
            </Link>
            <p className="text-text-lo/80 max-w-xs font-light leading-relaxed">
              Impulsando un motor más limpio, potente y protegido con ingeniería de lubricación de vanguardia.
            </p>
            <div className="flex items-center gap-4 pt-2 text-white/60">
              <a href="#" aria-label="Instagram" className="hover:text-ember-500 transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" aria-label="YouTube" className="hover:text-ember-500 transition-colors"><Youtube className="w-4 h-4" /></a>
              <a href="#" aria-label="LinkedIn" className="hover:text-ember-500 transition-colors"><Linkedin className="w-4 h-4" /></a>
              <a href="#" aria-label="X" className="hover:text-ember-500 transition-colors"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Col 2: Models / Lines (2 cols) */}
          <div className="lg:col-span-2 space-y-3 font-mono">
            <span className="text-white text-[11px] font-bold uppercase tracking-wider block">
              Líneas
            </span>
            <ul className="space-y-2 text-text-lo/70">
              <li><a href="#modelos" className="hover:text-white transition-colors">Estrada S (Sintético)</a></li>
              <li><a href="#modelos" className="hover:text-white transition-colors">Estrada X (Semisintético)</a></li>
              <li><a href="#modelos" className="hover:text-white transition-colors">Estrada R (Mineral)</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Filtros Homologados</a></li>
            </ul>
          </div>

          {/* Col 3: Company (2 cols) */}
          <div className="lg:col-span-2 space-y-3 font-mono">
            <span className="text-white text-[11px] font-bold uppercase tracking-wider block">
              Empresa
            </span>
            <ul className="space-y-2 text-text-lo/70">
              <li><a href="#historias" className="hover:text-white transition-colors">Nuestra Historia</a></li>
              <li><a href="#taller" className="hover:text-white transition-colors">Taller Central</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sustentabilidad</a></li>
              <li><Link href="/admin/login" className="text-ember-500 hover:text-ember-400 font-bold">ERP Estrada</Link></li>
              <li><Link href="/admin/pos" className="text-text-lo hover:text-white">Terminal POS</Link></li>
            </ul>
          </div>

          {/* Col 4: Support & Compliance (2 cols) */}
          <div className="lg:col-span-2 space-y-3 font-mono">
            <span className="text-white text-[11px] font-bold uppercase tracking-wider block">
              Soporte & Legal
            </span>
            <ul className="space-y-2 text-text-lo/70">
              <li><a href="#agenda" className="hover:text-white transition-colors">Agendar Cambio</a></li>
              <li><a href="#agenda" className="hover:text-white transition-colors">Consultar Placa</a></li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsClaimsOpen(true)}
                  className="hover:text-ember-400 transition-colors flex items-center gap-1.5 text-white/90"
                >
                  <BookOpen className="w-3.5 h-3.5 text-ember-500" />
                  <span>Libro de Reclamaciones</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="hover:text-white transition-colors"
                >
                  Términos de Servicio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsCookiesOpen(true)}
                  className="hover:text-white transition-colors"
                >
                  Ajuste de Cookies
                </button>
              </li>
              <li><a href="https://wa.me/51987654321" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">WhatsApp Soporte</a></li>
            </ul>
          </div>

          {/* Col 5: Join our journey (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-white text-[11px] font-mono font-bold uppercase tracking-wider block">
              Únete al viaje
            </span>
            <p className="text-text-lo/70 font-light">
              Recibe recordatorios de mantenimiento predictivo y novedades técnicas de Lubricentros Estrada.
            </p>
            <form onSubmit={handleSubmit} className="flex items-center gap-1.5 pt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo"
                className="bg-ink-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-text-lo/40 outline-none focus:border-ember-500 flex-1"
                required
              />
              <button
                type="submit"
                aria-label="Suscribirse"
                className="bg-ember-500 hover:bg-ember-600 text-white p-2.5 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {subscribed && (
              <span className="text-[11px] text-emerald-400 font-mono block">
                ¡Gracias por suscribirte al ecosistema Estrada!
              </span>
            )}
          </div>

        </div>

        {/* Bottom Legal Row */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-text-lo/50 font-mono">
          <p>© 2026 Lubricentros Estrada S.A.C. Todos los derechos reservados. RUC 20608945123.</p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setIsTermsOpen(true)}
              className="hover:text-white transition-colors"
            >
              Privacidad
            </button>
            <button
              type="button"
              onClick={() => setIsTermsOpen(true)}
              className="hover:text-white transition-colors"
            >
              Términos y Condiciones
            </button>
            <button
              type="button"
              onClick={() => setIsCookiesOpen(true)}
              className="hover:text-white transition-colors"
            >
              Ajuste de Cookies
            </button>
            <button
              type="button"
              onClick={() => setIsClaimsOpen(true)}
              className="hover:text-ember-400 text-ember-500/90 transition-colors flex items-center gap-1 font-semibold"
            >
              <BookOpen className="w-3.5 h-3.5" /> Libro de Reclamaciones
            </button>
            <span className="text-white/30 hidden sm:inline">|</span>
            <span className="text-white/60">Perú (ES)</span>
          </div>
        </div>

      </div>

      {/* Legal Modals Component Invocations */}
      <ClaimsBookModal isOpen={isClaimsOpen} onClose={() => setIsClaimsOpen(false)} />
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <CookieConsentModal isOpen={isCookiesOpen} onClose={() => setIsCookiesOpen(false)} />
    </footer>
  );
}
