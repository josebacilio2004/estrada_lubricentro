"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, AlertCircle, Sparkles, Car, ArrowLeft, Lock, UserPlus, LogIn, Phone, User, Calendar, Fuel, Gauge, CheckCircle2 } from "lucide-react";

export default function PortalLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login form state
  const [plate, setPlate] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Registration form state
  const [regForm, setRegForm] = useState({
    license_plate: "",
    full_name: "",
    phone_whatsapp: "",
    email: "",
    brand: "Toyota",
    model: "Corolla",
    year: 2022,
    engine_fuel: "Gasolina",
    current_km: 45000,
    password: "",
  });

  const handleFormatPlate = (val: string, isReg = false) => {
    let clean = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length > 3) {
      clean = clean.slice(0, 3) + "-" + clean.slice(3, 6);
    }
    if (isReg) {
      setRegForm({ ...regForm, license_plate: clean });
    } else {
      setPlate(clean);
    }
  };

  const handleQuickFill = (demoPlate: string, demoPass: string) => {
    setActiveTab("login");
    setPlate(demoPlate);
    setPassword(demoPass);
    setError(null);
  };

  // Safe relative API URL prevents CORS / Failed to fetch on public tunnels and mobile
  const getApiUrl = () => {
    return typeof window !== "undefined" ? "/v1" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !password) {
      setError("Por favor ingrese su placa y contraseña");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${getApiUrl()}/portal/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_plate: plate,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Placa o contraseña incorrectas");
      }

      // Guardar sesión en localStorage
      localStorage.setItem("estrada_portal_token", data.data.token);
      localStorage.setItem("estrada_portal_vehicle", JSON.stringify(data.data.vehicle));
      localStorage.setItem("estrada_portal_customer", JSON.stringify(data.data.customer));

      router.push("/portal/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.license_plate || !regForm.full_name || !regForm.phone_whatsapp || !regForm.password) {
      setError("Por favor completa los campos obligatorios (Placa, Nombre, Celular y Contraseña)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${getApiUrl()}/portal/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_plate: regForm.license_plate,
          full_name: regForm.full_name,
          phone_whatsapp: regForm.phone_whatsapp,
          email: regForm.email,
          brand: regForm.brand,
          model: regForm.model,
          year: Number(regForm.year),
          engine_fuel: regForm.engine_fuel,
          current_km: Number(regForm.current_km),
          password: regForm.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Error al registrar vehículo");
      }

      // Auto login after registration
      localStorage.setItem("estrada_portal_token", data.data.token);
      localStorage.setItem("estrada_portal_vehicle", JSON.stringify(data.data.vehicle));
      localStorage.setItem("estrada_portal_customer", JSON.stringify(data.data.customer));

      setSuccessMsg("¡Vehículo registrado con éxito! Accediendo a tu telemetría...");
      setTimeout(() => {
        router.push("/portal/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Error al registrar el vehículo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 text-text-hi flex flex-col justify-between font-body relative overflow-hidden select-none">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-ember-500/10 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-ink-950 via-transparent to-transparent pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-6 max-w-[1400px] w-full mx-auto flex items-center justify-between relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-text-lo hover:text-white transition-colors text-xs font-mono">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la portada principal</span>
        </Link>
        <span className="font-display font-extrabold text-xl tracking-[0.25em] text-white">
          ESTRAD<span className="text-ember-500">A</span>
        </span>
      </header>

      {/* Center Card */}
      <main className="w-full max-w-lg mx-auto px-6 py-8 relative z-10 flex-1 flex flex-col justify-center">
        
        <div className="rounded-3xl bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] border border-white/15 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
          
          {/* Badge & Title */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-ember-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PORTAL DE AUTOSERVICIO // CLIENTES</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white uppercase">
              MI VEHÍCULO ESTRADA
            </h1>
            <p className="text-xs text-text-lo">
              Accede a la telemetría, historial de servicios y alertas de tu motor.
            </p>
          </div>

          {/* Toggle Tabs: Iniciar Sesión / Registrar Vehículo */}
          <div className="grid grid-cols-2 p-1 bg-ink-900 border border-white/10 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab("login"); setError(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "login"
                  ? "bg-ember-500 text-white shadow-lg shadow-ember-500/20"
                  : "text-text-lo hover:text-white"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("register"); setError(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "register"
                  ? "bg-ember-500 text-white shadow-lg shadow-ember-500/20"
                  : "text-text-lo hover:text-white"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Registro</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. LOGIN TAB */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* License Plate Input with Peruvian Embossed Style */}
              <div>
                <label className="block text-xs font-mono text-text-dim mb-2 text-center uppercase tracking-wider">
                  Placa Vehicular
                </label>
                <div className="relative flex items-center justify-center">
                  <div className="w-full max-w-[280px] bg-gradient-to-b from-white to-gray-200 border-4 border-black rounded-xl p-2.5 shadow-2xl flex flex-col items-center">
                    <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-black border-b border-black/30 pb-1 mb-1">
                      <span className="text-red-600">PERÚ</span>
                      <span className="text-gray-700">LUBRICENTROS ESTRADA</span>
                    </div>
                    <input
                      type="text"
                      maxLength={7}
                      required
                      value={plate}
                      onChange={(e) => handleFormatPlate(e.target.value, false)}
                      placeholder="ABC-123"
                      className="w-full text-center bg-transparent text-black font-display font-black text-3xl tracking-[0.2em] focus:outline-none placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-mono text-text-dim mb-1.5 flex items-center justify-between">
                  <span>Contraseña o PIN</span>
                  <span className="text-[10px] text-text-dim">Por defecto: estrada123</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-ink-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-white focus:border-ember-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-ember-500 hover:bg-ember-600 text-white font-semibold text-xs py-3.5 px-6 rounded-full transition-all shadow-xl shadow-ember-500/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <span>{loading ? "Validando credenciales..." : "Acceder a Mi Vehículo"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 2. REGISTRATION TAB */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Placa y Contacto Telefónico */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-text-dim mb-1">
                    Placa Vehicular *
                  </label>
                  <input
                    type="text"
                    maxLength={7}
                    required
                    value={regForm.license_plate}
                    onChange={(e) => handleFormatPlate(e.target.value, true)}
                    placeholder="XYZ-789"
                    className="w-full bg-ink-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white uppercase focus:border-ember-500 focus:outline-none tracking-widest text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-dim mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>WhatsApp / Celular *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone_whatsapp}
                    onChange={(e) => setRegForm({ ...regForm, phone_whatsapp: e.target.value })}
                    placeholder="964 123 456"
                    className="w-full bg-ink-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:border-ember-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Nombre Propietario */}
              <div>
                <label className="block text-xs font-mono text-text-dim mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-text-lo" />
                  <span>Nombre Completo del Propietario *</span>
                </label>
                <input
                  type="text"
                  required
                  value={regForm.full_name}
                  onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })}
                  placeholder="Ej: José Carlos Martínez"
                  className="w-full bg-ink-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-sans text-white focus:border-ember-500 focus:outline-none"
                />
              </div>

              {/* Marca, Modelo y Año */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-mono text-text-dim mb-1">Marca</label>
                  <input
                    type="text"
                    required
                    value={regForm.brand}
                    onChange={(e) => setRegForm({ ...regForm, brand: e.target.value })}
                    placeholder="Toyota"
                    className="w-full bg-ink-900 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:border-ember-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-dim mb-1">Modelo</label>
                  <input
                    type="text"
                    required
                    value={regForm.model}
                    onChange={(e) => setRegForm({ ...regForm, model: e.target.value })}
                    placeholder="Corolla"
                    className="w-full bg-ink-900 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:border-ember-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-dim mb-1">Año</label>
                  <input
                    type="number"
                    min={1990}
                    max={2027}
                    required
                    value={regForm.year}
                    onChange={(e) => setRegForm({ ...regForm, year: Number(e.target.value) })}
                    className="w-full bg-ink-900 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:border-ember-500 focus:outline-none text-center"
                  />
                </div>
              </div>

              {/* Combustible & Kilometraje Actual */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-text-dim mb-1 flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-amber-400" />
                    <span>Combustible</span>
                  </label>
                  <select
                    value={regForm.engine_fuel}
                    onChange={(e) => setRegForm({ ...regForm, engine_fuel: e.target.value })}
                    className="w-full bg-ink-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-ember-500 focus:outline-none"
                  >
                    <option value="Gasolina">Gasolina</option>
                    <option value="GLP">GLP (Dual)</option>
                    <option value="GNV">GNV (Dual)</option>
                    <option value="Diésel">Diésel Turbo</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-dim mb-1 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-cyan-400" />
                    <span>Km Actual</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={regForm.current_km}
                    onChange={(e) => setRegForm({ ...regForm, current_km: Number(e.target.value) })}
                    placeholder="45000"
                    className="w-full bg-ink-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:border-ember-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Contraseña para el Portal */}
              <div>
                <label className="block text-xs font-mono text-text-dim mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-ember-400" />
                  <span>Crear Contraseña Personal *</span>
                </label>
                <input
                  type="password"
                  required
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-ink-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:border-ember-500 focus:outline-none"
                />
              </div>

              {/* Botón de Registro */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-ember-500 to-amber-500 hover:from-ember-600 hover:to-amber-600 text-white font-semibold text-xs py-3.5 px-6 rounded-full transition-all shadow-xl shadow-ember-500/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-2"
              >
                <span>{loading ? "Creando expediente vehicular..." : "Registrar Mi Vehículo y Entrar"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Vehicles Box */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <span className="text-[10px] font-mono text-text-dim uppercase tracking-wider block text-center mb-3">
              Vehículos de Demostración (Acceso Rápido)
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("ABC-123", "estrada123")}
                className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-ember-500" />
                  <div>
                    <span className="font-mono font-bold text-white">ABC-123</span>
                    <span className="text-text-dim text-[11px] block">Toyota RAV4 (Carlos Mendoza • 964883921)</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Cargar</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("W1A-982", "estrada123")}
                className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="font-mono font-bold text-white">W1A-982</span>
                    <span className="text-text-dim text-[11px] block">Hyundai Tucson GLP (Vanessa Torres)</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">Cargar</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("BCX-456", "estrada123")}
                className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-mono font-bold text-white">BCX-456</span>
                    <span className="text-text-dim text-[11px] block">Nissan Frontier Diésel (Flota)</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Cargar</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-xs text-text-dim font-mono relative z-10">
        © 2026 Lubricentros Estrada • Huancayo, Junín, Perú • Conexión Cifrada SSL
      </footer>

    </div>
  );
}