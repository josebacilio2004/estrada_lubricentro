"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Receipt,
  Store,
  Package,
  Boxes,
  Users,
  Building2,
  ChevronDown,
  ChevronsUpDown,
  LogOut,
  Plus,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FolderTree,
  Menu,
  X,
} from "lucide-react";

interface ErpLayoutProps {
  children: React.ReactNode;
  title?: string;
  categoryTitle?: string;
  actionButton?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export function ErpLayout({
  children,
  title = "Comprobantes",
  categoryTitle = "Facturación",
  actionButton,
}: ErpLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("estrada_admin_token");
    const rawUser = localStorage.getItem("estrada_admin_user");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    if (rawUser) {
      try {
        setAdminUser(JSON.parse(rawUser));
      } catch {
        setAdminUser({
          name: "Administración Estrada",
          email: "admin@estrada.pe",
          company: "Lubricentros Estrada S.A.C.",
          ruc: "20608945123",
        });
      }
    } else {
      setAdminUser({
        name: "Administración Estrada",
        email: "admin@estrada.pe",
        company: "Lubricentros Estrada S.A.C.",
        ruc: "20608945123",
      });
    }

    setCheckingAuth(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("estrada_admin_token");
    localStorage.removeItem("estrada_admin_user");
    router.push("/admin/login");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-ember-500 animate-ping" />
          <span>Verificando credenciales administrativas...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      group: "PANEL",
      items: [
        {
          name: "Inicio",
          href: "/admin",
          icon: LayoutGrid,
          badge: null,
        },
      ],
    },
    {
      group: "EMISIÓN & SUNAT",
      items: [
        {
          name: "Comprobantes",
          href: "/admin/invoices",
          icon: Receipt,
          badge: null,
        },
        {
          name: "Terminal POS",
          href: "/admin/pos",
          icon: Store,
          badge: "ACTIVO",
        },
      ],
    },
    {
      group: "GESTIÓN & INVENTARIO",
      items: [
        {
          name: "Productos",
          href: "/admin/products",
          icon: Package,
          badge: null,
        },
        {
          name: "Categorías",
          href: "/admin/categories",
          icon: FolderTree,
          badge: null,
        },
        {
          name: "Inventario",
          href: "/admin/inventory",
          icon: Boxes,
          badge: null,
        },
        {
          name: "Clientes & CRM",
          href: "/admin/crm",
          icon: Users,
          badge: null,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0e1015] text-gray-200 flex font-sans selection:bg-ember-500 selection:text-white">
      
      {/* 1. LEFT SIDEBAR (Matching khipu.pe reference screenshot) */}
      <aside className="w-64 bg-[#12141a] border-r border-white/[0.06] flex flex-col justify-between flex-shrink-0 z-30 select-none hidden md:flex">
        
        {/* Top Header & Brand */}
        <div>
          <div className="p-4 flex items-center justify-between border-b border-white/[0.06]">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-white text-black font-black flex items-center justify-center text-sm shadow-md">
                E
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white text-base">
                  estrada<span className="text-gray-400">.pe</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.08] text-gray-400 font-mono">
                  Beta
                </span>
              </div>
            </Link>

            <Link
              href="/"
              title="Ir a la web principal"
              className="text-gray-500 hover:text-white p-1 rounded-md transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {/* Company / RUC Switcher Pill */}
          <div className="p-3">
            <button
              type="button"
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#171a22] border border-white/[0.06] hover:border-white/15 transition-all text-left group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-ember-500/20 border border-ember-500/30 text-ember-400 flex items-center justify-center font-bold text-xs flex-shrink-0 font-mono">
                  E
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-white truncate">
                    Lubricentros Estrada S.A.C.
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    RUC 20608945123
                  </div>
                </div>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 flex-shrink-0" />
            </button>
          </div>

          {/* Navigation Links Grouped */}
          <nav className="px-3 py-2 space-y-5">
            {navItems.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-3 text-[10px] font-mono tracking-wider text-gray-400 font-semibold uppercase">
                  {group.group}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? "bg-[#1c212b] text-white shadow-sm border border-white/[0.06]"
                            : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-gray-400"}`} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#171a22] border border-white/[0.06]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-ember-500/20 border border-ember-500/30 text-ember-400 font-bold text-xs flex items-center justify-center flex-shrink-0 font-mono">
                LE
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">
                  Administración Estrada
                </div>
                <div className="text-[10px] text-gray-400 truncate font-mono">
                  admin@estrada.pe
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* MOBILE DRAWER OVERLAY (for smartphones and small tablets) */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-72 max-w-[85vw] h-full bg-[#12141a] border-r border-white/10 flex flex-col justify-between p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <Link 
                  href="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-black font-black flex items-center justify-center text-sm shadow-md">
                    E
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold tracking-tight text-white text-base">
                      estrada<span className="text-gray-400">.pe</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.08] text-gray-400 font-mono">
                      ERP
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Company pill */}
              <div className="py-3">
                <div className="p-2.5 rounded-xl bg-[#171a22] border border-white/[0.06] text-left">
                  <div className="text-xs font-semibold text-white">
                    Lubricentros Estrada S.A.C.
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    RUC 20608945123
                  </div>
                </div>
              </div>

              {/* Nav links */}
              <nav className="py-2 space-y-4">
                {navItems.map((group, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="px-2 text-[10px] font-mono tracking-wider text-gray-400 font-semibold uppercase">
                      {group.group}
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                              isActive
                                ? "bg-[#1c212b] text-white border border-white/[0.08]"
                                : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-gray-400"}`} />
                              <span>{item.name}</span>
                            </div>
                            {item.badge && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* User logout */}
            <div className="pt-3 border-t border-white/[0.08]">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#171a22] border border-white/[0.06]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-ember-500/20 border border-ember-500/30 text-ember-400 font-bold text-xs flex items-center justify-center font-mono">
                    LE
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white truncate">
                      Administración Estrada
                    </div>
                    <div className="text-[10px] text-gray-400 truncate font-mono">
                      admin@estrada.pe
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-white/[0.06] bg-[#101218]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          
          {/* Breadcrumb & Sunat Status Badge & Hamburger Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] md:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-gray-400">{categoryTitle}</span>
              <span className="text-gray-600">/</span>
              <span className="text-white font-semibold">{title}</span>
            </div>

            {/* Golden Sunat Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>BETA Sunat</span>
            </div>
          </div>

          {/* Action Button Top-Right (Matching white pill from screenshot) */}
          <div className="flex items-center gap-3">
            {actionButton && (
              actionButton.href ? (
                <Link
                  href={actionButton.href}
                  className="inline-flex items-center gap-1.5 sm:gap-2 bg-white hover:bg-gray-100 text-black font-semibold text-xs px-3 sm:px-4 py-2 rounded-full transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{actionButton.label.replace(/^\+\s*/, '')}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={actionButton.onClick}
                  className="inline-flex items-center gap-1.5 sm:gap-2 bg-white hover:bg-gray-100 text-black font-semibold text-xs px-3 sm:px-4 py-2 rounded-full transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{actionButton.label.replace(/^\+\s*/, '')}</span>
                </button>
              )
            )}
          </div>

        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>

      </div>

    </div>
  );
}