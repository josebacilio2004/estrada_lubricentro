"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, ArrowRight } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-ink-950/85 backdrop-blur-md border-b border-white/[0.06] shadow-xl py-3"
          : "bg-gradient-to-b from-ink-950/80 via-ink-950/30 to-transparent py-5"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        
        {/* DOSLA Brand Logo Style */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-display font-extrabold text-2xl tracking-[0.28em] text-white transition-opacity group-hover:opacity-90 drop-shadow-md">
            ESTRAD<span className="text-ember-500">A</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-text-lo tracking-wide">
          <a href="#catalogo" className="hover:text-white transition-colors text-amber-400 font-semibold drop-shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Catálogo
          </a>
          <a href="#modelos" className="hover:text-white transition-colors drop-shadow-sm">Vehículos</a>
          <a href="#tecnologia" className="hover:text-white transition-colors drop-shadow-sm">Tecnología</a>
          <a href="#marcas" className="hover:text-white transition-colors drop-shadow-sm">Homologaciones</a>
          <a href="#ubicacion" className="hover:text-white transition-colors drop-shadow-sm">Ubicación</a>
          <Link href="/portal" className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold drop-shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Portal Clientes
          </Link>
        </nav>

        {/* Right Tools: ERP Estrada + Book a Service CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-mono font-medium text-text-hi hover:text-white transition-all shadow-sm group"
          >
            <span className="w-2 h-2 rounded-full bg-ember-500 animate-pulse" />
            <span>ERP Estrada</span>
            <span className="text-[10px] text-text-dim group-hover:text-white">PRO</span>
          </Link>

          <a
            href="#agenda"
            className="inline-flex items-center gap-2 bg-ember-500 hover:bg-ember-600 text-white text-xs font-semibold px-5 py-2 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-ember-500/30 active:scale-95"
          >
            Agendar Cambio
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-text-lo hover:text-white p-2"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-ink-950/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 space-y-4 text-sm animate-in fade-in slide-in-from-top-3">
          <a href="#catalogo" onClick={() => setMobileMenuOpen(false)} className="block text-amber-400 font-semibold">Catálogo de Productos</a>
          <a href="#modelos" onClick={() => setMobileMenuOpen(false)} className="block text-text-lo hover:text-white">Vehículos & Fórmulas</a>
          <a href="#tecnologia" onClick={() => setMobileMenuOpen(false)} className="block text-text-lo hover:text-white">Tecnología</a>
          <a href="#marcas" onClick={() => setMobileMenuOpen(false)} className="block text-text-lo hover:text-white">Homologaciones OEM</a>
          <a href="#ubicacion" onClick={() => setMobileMenuOpen(false)} className="block text-text-lo hover:text-white">Ubicación</a>
          <Link href="/portal" onClick={() => setMobileMenuOpen(false)} className="block text-emerald-400 font-semibold">Portal Clientes ↗</Link>
          <div className="pt-2 border-t border-white/10 space-y-2">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 bg-white/10 text-white text-xs font-semibold px-4 py-2.5 rounded-full"
            >
              ERP Estrada (Acceso Administrativo)
            </Link>
            <a
              href="#agenda"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 bg-ember-500 text-white text-xs font-semibold px-6 py-3 rounded-full"
            >
              Agendar Cambio
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
