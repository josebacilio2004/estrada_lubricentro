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
  ChevronDown,
  ChevronsUpDown,
  LogOut,
  Plus,
  ExternalLink,
  ShieldCheck,
  FolderTree,
  Menu,
  X,
  Palette,
  Sun,
  Moon,
  Smartphone,
  Search,
  Check,
} from "lucide-react";
import {
  cn,
  ACCION_PRINCIPAL,
  ACCION_SECUNDARIA,
  ROTULO,
  CONTENEDOR_PAGINA,
  FOCO,
} from "@/components/khipu/khipu-ui";

interface ErpLayoutProps {
  children: React.ReactNode;
  title?: string;
  categoryTitle?: string;
  actionButton?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryActions?: React.ReactNode;
}

type PaletaKhipu = "coral" | "lima" | "indigo" | "oceano" | "violeta";
type TonoOscuroKhipu = "medianoche" | "grafito" | "tintado";

const PALETAS_DISPONIBLES: { id: PaletaKhipu; nombre: string; color: string }[] = [
  { id: "coral", nombre: "Coral Estrada", color: "#ffc6b3" },
  { id: "lima", nombre: "Lima Khipu", color: "#d4f06b" },
  { id: "oceano", nombre: "Océano", color: "#9fe3dc" },
  { id: "indigo", nombre: "Índigo", color: "#c9c8ff" },
  { id: "violeta", nombre: "Violeta", color: "#dacbff" },
];

const TONOS_OSCUROS: { id: TonoOscuroKhipu; nombre: string }[] = [
  { id: "medianoche", nombre: "Medianoche" },
  { id: "grafito", nombre: "Grafito" },
  { id: "tintado", nombre: "Tintado" },
];

const SEDES_ESTRADA = [
  {
    id: "principal",
    nombre: "Lubricentros Estrada S.A.C.",
    detalle: "RUC 20608945123 · Av. Mariátegui",
    inicial: "E",
  },
  {
    id: "almacen",
    nombre: "Almacén Central Estrada",
    detalle: "RUC 20608945123 · El Tambo, HYO",
    inicial: "A",
  },
];

export function ErpLayout({
  children,
  title = "Comprobantes",
  categoryTitle = "Facturación",
  actionButton,
  secondaryActions,
}: ErpLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Khipu Design System appearance preferences
  const [modoOscuro, setModoOscuro] = useState<boolean>(true);
  const [paleta, setPaleta] = useState<PaletaKhipu>("lima");
  const [tonoOscuro, setTonoOscuro] = useState<TonoOscuroKhipu>("medianoche");
  const [sedeActiva, setSedeActiva] = useState<string>("principal");
  const [sedeMenuOpen, setSedeMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [quickSearch, setQuickSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("estrada_admin_token");
    const rawUser = localStorage.getItem("estrada_admin_user");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    const savedPaleta = localStorage.getItem("khipu_estrada_paleta") as PaletaKhipu | null;
    const savedTono = localStorage.getItem("khipu_estrada_tono") as TonoOscuroKhipu | null;
    const savedModo = localStorage.getItem("khipu_estrada_modo");

    if (savedPaleta) setPaleta(savedPaleta);
    if (savedTono) setTonoOscuro(savedTono);
    if (savedModo !== null) setModoOscuro(savedModo === "dark");

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

  const cambiarPaleta = (nueva: PaletaKhipu) => {
    setPaleta(nueva);
    localStorage.setItem("khipu_estrada_paleta", nueva);
  };

  const cambiarTonoOscuro = (nuevo: TonoOscuroKhipu) => {
    setTonoOscuro(nuevo);
    localStorage.setItem("khipu_estrada_tono", nuevo);
  };

  const cambiarModo = (oscuro: boolean) => {
    setModoOscuro(oscuro);
    localStorage.setItem("khipu_estrada_modo", oscuro ? "dark" : "light");
  };

  const handleLogout = () => {
    localStorage.removeItem("estrada_admin_token");
    localStorage.removeItem("estrada_admin_user");
    router.push("/admin/login");
  };

  const toggleGroup = (groupTitle: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  if (checkingAuth) {
    return (
      <div
        data-paleta={paleta}
        data-oscuro={tonoOscuro}
        className="khipu-erp dark min-h-screen bg-background text-foreground flex items-center justify-center font-mono text-etiqueta"
      >
        <div className="flex items-center gap-2.5 rounded-full bg-card px-4 py-2 border border-border shadow-tarjeta">
          <div className="h-2 w-2 rounded-full bg-acento animate-ping" />
          <span>Verificando sesión en Lubricentros Estrada S.A.C.…</span>
        </div>
      </div>
    );
  }

  const navGroups: {
    titulo: string;
    colapsable: boolean;
    items: {
      name: string;
      href: string;
      icon: any;
      exact?: boolean;
      chip?: string;
    }[];
  }[] = [
    {
      titulo: "General",
      colapsable: false,
      items: [
        {
          name: "Resumen y Analítica",
          href: "/admin",
          icon: LayoutGrid,
          exact: true,
        },
      ],
    },
    {
      titulo: "Emisión y SUNAT",
      colapsable: true,
      items: [
        {
          name: "Comprobantes",
          href: "/admin/invoices",
          icon: Receipt,
        },
        {
          name: "Terminal POS",
          href: "/admin/pos",
          icon: Store,
          chip: "Escáner",
        },
      ],
    },
    {
      titulo: "Catálogo y Kardex",
      colapsable: true,
      items: [
        {
          name: "Productos",
          href: "/admin/products",
          icon: Package,
        },
        {
          name: "Categorías",
          href: "/admin/categories",
          icon: FolderTree,
        },
        {
          name: "Inventario",
          href: "/admin/inventory",
          icon: Boxes,
        },
        {
          name: "Clientes y Vehículos",
          href: "/admin/crm",
          icon: Users,
        },
      ],
    },
  ];

  const sedeSeleccionada =
    SEDES_ESTRADA.find((s) => s.id === sedeActiva) ?? SEDES_ESTRADA[0];

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden select-none">
      {/* 1. Cabecera del Sidebar: LogoMarca + ChipSidebar (khipu-design-system/sidebar.tsx) */}
      <div className="flex h-14 w-full min-w-0 shrink-0 items-center justify-between gap-2 overflow-hidden px-4">
        <Link
          href="/admin"
          onClick={() => isMobile && setMobileMenuOpen(false)}
          className="inline-flex min-w-0 items-center gap-2.5 group"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-acento font-heading text-control font-bold text-acento-texto shadow-sm transition-transform group-hover:scale-105">
            E
          </span>
          <span className="truncate font-heading text-titulo tracking-tight text-foreground">
            estrada<span className="text-texto-terciario font-normal">.pe</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex shrink-0 items-center rounded border border-border/60 bg-secondary px-1.5 py-0.5 font-mono text-etiqueta font-medium whitespace-nowrap text-secondary-foreground/80">
            UBL 2.1
          </span>
          {isMobile ? (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* 2. SelectorContexto: Empresa activa Lubricentros Estrada S.A.C. */}
      <div className="relative shrink-0 px-3 pt-2 pb-2">
        <button
          type="button"
          onClick={() => setSedeMenuOpen((v) => !v)}
          className={cn(
            "flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-lg border border-border/60 bg-muted/80 p-2 text-left transition-colors outline-none select-none hover:bg-secondary",
            FOCO
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-etiqueta font-bold text-primary-foreground shadow-sm">
              {sedeSeleccionada.inicial}
            </div>
            <div className="min-w-0 overflow-hidden">
              <p className="truncate text-control leading-tight font-medium text-foreground">
                {sedeSeleccionada.nombre}
              </p>
              <p className="truncate font-mono text-etiqueta leading-tight text-muted-foreground">
                {sedeSeleccionada.detalle}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
        </button>

        {sedeMenuOpen ? (
          <div className="absolute left-3 right-3 top-full z-40 mt-1 rounded-xl bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-border">
            <div className="px-2 pt-1.5 pb-1 text-etiqueta font-medium text-muted-foreground">
              Sede operativa activa
            </div>
            {SEDES_ESTRADA.map((s) => {
              const active = s.id === sedeSeleccionada.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSedeActiva(s.id);
                    setSedeMenuOpen(false);
                  }}
                  className={cn(
                    "relative flex w-full items-center gap-2.5 rounded-lg py-1.5 pr-7 pl-2 text-left transition-colors",
                    active
                      ? "bg-accent/70 text-accent-foreground"
                      : "hover:bg-secondary"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-etiqueta font-bold",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground/80"
                    )}
                  >
                    {s.inicial}
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <span className="block truncate text-control leading-tight font-medium">
                      {s.nombre}
                    </span>
                    <span className="block truncate font-mono text-etiqueta leading-tight text-muted-foreground">
                      {s.detalle}
                    </span>
                  </div>
                  {active ? (
                    <Check className="absolute right-2 h-3.5 w-3.5 text-foreground" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* 3. SidebarNav: Navegación por grupos (khipu-design-system/sidebar-nav.tsx) */}
      <div className="min-h-0 w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        <nav aria-label="Menú principal ERP" className="grid w-full grid-cols-1 gap-4 px-2.5 pt-2 pb-3">
          {navGroups.map((grupo) => {
            const isCollapsed = Boolean(collapsedGroups[grupo.titulo]);
            return (
              <div key={grupo.titulo} className="grid w-full grid-cols-1 gap-0.5">
                {grupo.colapsable ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(grupo.titulo)}
                    className={cn(
                      "flex min-h-[28px] w-full min-w-0 items-center justify-between gap-2 rounded-full px-3 pt-1 pb-1.5 text-left transition-colors hover:text-foreground",
                      FOCO,
                      ROTULO
                    )}
                  >
                    <span className="truncate">{grupo.titulo}</span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 shrink-0 transition-transform duration-200",
                        !isCollapsed ? "rotate-180" : ""
                      )}
                    />
                  </button>
                ) : (
                  <span className={cn("truncate px-3 pt-1 pb-1.5", ROTULO)}>
                    {grupo.titulo}
                  </span>
                )}

                {!isCollapsed ? (
                  <div className="grid grid-cols-1 gap-0.5">
                    {grupo.items.map((item) => {
                      const active = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => isMobile && setMobileMenuOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "relative isolate flex w-full min-w-0 items-center gap-2.5 rounded-full px-3 py-[7px] text-control transition-colors duration-150",
                            active
                              ? "border border-acento-borde bg-sidebar-primary font-semibold text-sidebar-primary-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-[17px] w-[17px] shrink-0",
                              active ? "text-current" : "text-muted-foreground"
                            )}
                          />
                          <span className="min-w-0 flex-1 truncate">{item.name}</span>
                          {item.chip ? (
                            <span
                              className={cn(
                                "shrink-0 rounded-full px-2 py-0.5 text-etiqueta font-medium whitespace-nowrap",
                                active
                                  ? "bg-current/15 text-current"
                                  : "bg-secondary text-muted-foreground"
                              )}
                            >
                              {item.chip}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>

      {/* 4. Pie del Sidebar: Tarjeta de Estado + MenuUsuario con Apariencia Khipu */}
      <div className="relative flex w-full min-w-0 shrink-0 flex-col gap-2.5 border-t border-border/60 p-3">
        {/* Tarjeta de estado app móvil y SUNAT */}
        <Link
          href="/estrada_erp_mobile.apk"
          download
          title="Descargar APK Escáner Móvil Estrada v1.2.1"
          className="grid w-full grid-cols-1 gap-1.5 overflow-hidden rounded-lg border border-border/60 bg-muted/90 p-2.5 transition-colors hover:bg-secondary"
        >
          <div className="flex items-center justify-between gap-2 text-etiqueta">
            <span className="flex items-center gap-1.5 truncate font-medium text-foreground/90">
              <Smartphone className="h-3.5 w-3.5 text-success-foreground" />
              App Escáner POS
            </span>
            <span className="shrink-0 font-mono text-etiqueta text-success-foreground">
              v1.2.1 APK
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full w-full rounded-full bg-success-solid" />
          </div>
        </Link>

        {/* Popover de Usuario y Apariencia Khipu */}
        {userMenuOpen ? (
          <div className="absolute bottom-16 left-3 right-3 z-50 rounded-xl bg-popover p-2 text-popover-foreground shadow-xl ring-1 ring-border">
            <div className="flex items-start gap-2.5 rounded-lg bg-accent p-2 text-accent-foreground">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-acento text-etiqueta font-bold text-acento-texto">
                LE
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-control leading-tight font-semibold">
                  Administración Estrada
                </p>
                <p className="mt-0.5 font-mono text-etiqueta leading-snug break-all opacity-80">
                  admin@estrada.pe
                </p>
              </div>
              <ShieldCheck className="h-4 w-4 shrink-0" />
            </div>

            {/* Selector de Tema Claro / Oscuro */}
            <div className="mt-2 border-t border-border pt-2">
              <div className="flex items-center justify-between px-1 py-1">
                <span className={ROTULO}>Tema</span>
                <div className="inline-flex items-center gap-0.5 rounded-full bg-secondary p-0.5">
                  <button
                    type="button"
                    onClick={() => cambiarModo(false)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-etiqueta font-medium transition-colors",
                      !modoOscuro
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Sun className="h-3 w-3" /> Claro
                  </button>
                  <button
                    type="button"
                    onClick={() => cambiarModo(true)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-etiqueta font-medium transition-colors",
                      modoOscuro
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Moon className="h-3 w-3" /> Oscuro
                  </button>
                </div>
              </div>

              {/* Selector de Tono Oscuro (Medianoche, Grafito, Tintado) */}
              {modoOscuro ? (
                <div className="mt-1.5 px-1">
                  <span className={cn(ROTULO, "block mb-1")}>Tono oscuro</span>
                  <div className="grid grid-cols-3 gap-1">
                    {TONOS_OSCUROS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => cambiarTonoOscuro(t.id)}
                        className={cn(
                          "rounded-full py-1 text-center text-etiqueta font-medium transition-colors",
                          tonoOscuro === t.id
                            ? "bg-acento-superficie text-acento-superficie-texto font-semibold border border-acento-borde"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {t.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Selector de Paleta Khipu */}
              <div className="mt-2 px-1">
                <span className={cn(ROTULO, "block mb-1")}>Paleta Khipu</span>
                <div className="flex items-center justify-between gap-1">
                  {PALETAS_DISPONIBLES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      title={p.nombre}
                      onClick={() => cambiarPaleta(p.id)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1 rounded-full py-1 text-etiqueta font-medium transition-all border",
                        paleta === p.id
                          ? "border-foreground bg-secondary text-foreground font-semibold"
                          : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: p.color }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-2 border-t border-border pt-1.5 flex items-center justify-between gap-1">
              <Link
                href="/"
                className="flex flex-1 items-center gap-1.5 rounded-lg px-2 py-1.5 text-control text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Web Pública
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-control font-medium text-destructive-texto hover:bg-destructive-suave"
              >
                <LogOut className="h-3.5 w-3.5" /> Salir
              </button>
            </div>
          </div>
        ) : null}

        {/* Disparador MenuUsuario */}
        <button
          type="button"
          onClick={() => setUserMenuOpen((v) => !v)}
          className={cn(
            "flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-xl bg-secondary p-2 text-left transition-colors outline-none select-none hover:bg-secondary/80",
            FOCO
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-acento text-etiqueta font-bold text-acento-texto shadow-sm">
              LE
            </div>
            <div className="min-w-0 overflow-hidden">
              <p className="truncate text-control leading-tight font-medium text-foreground">
                Administración Estrada
              </p>
              <p className="truncate text-etiqueta leading-tight text-muted-foreground">
                admin@estrada.pe
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Palette className="h-3.5 w-3.5" />
            <ChevronsUpDown className="h-3.5 w-3.5" />
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div
      data-paleta={paleta}
      data-oscuro={tonoOscuro}
      className={cn(
        "khipu-erp flex h-dvh overflow-hidden bg-background text-cuerpo text-foreground font-sans",
        modoOscuro ? "dark" : ""
      )}
    >
      {/* 1. SIDEBAR FLOTANTE KHIPU (248px en desktop, con margen y bordes redondeados) */}
      <aside className="hidden shrink-0 flex-col bg-sidebar text-sidebar-foreground md:my-2 md:ml-2 md:flex md:w-[248px] md:rounded-xl md:border md:border-sidebar-border md:shadow-sm">
        {renderSidebarContent(false)}
      </aside>

      {/* CAJÓN MÓVIL */}
      {mobileMenuOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="h-full w-[264px] max-w-[85vw] bg-sidebar text-sidebar-foreground shadow-2xl border-r border-sidebar-border"
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarContent(true)}
          </div>
        </div>
      ) : null}

      {/* 2. ÁREA PRINCIPAL CON TOPBAR PEGAJOSA Y CONTENEDOR_PAGINA */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* TopBar (khipu-design-system/top-bar.tsx) */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 bg-background/80 px-3 backdrop-blur md:px-5 border-b border-border/40">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú de navegación"
              className={cn(ACCION_SECUNDARIA, "px-2.5 md:hidden")}
            >
              <Menu className="h-4 w-4" />
            </button>

            <nav
              aria-label="Ubicación"
              className="flex min-w-0 shrink items-center gap-1.5 overflow-hidden text-control whitespace-nowrap"
            >
              <span className="hidden text-texto-terciario sm:inline">
                {categoryTitle}
              </span>
              <span className="hidden text-texto-terciario/50 sm:inline">/</span>
              <h1 className="truncate font-heading text-titulo text-foreground">
                {title}
              </h1>
            </nav>

            {/* Pills de entorno Khipu */}
            <span
              title="Facturación Electrónica SUNAT UBL 2.1 activa"
              className="hidden shrink-0 items-center gap-1.5 rounded-full bg-warning px-2.5 py-0.5 text-etiqueta font-semibold whitespace-nowrap text-warning-foreground lg:inline-flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-warning-solid" />
              SUNAT UBL 2.1
            </span>

            <span
              title="Base de datos PostgreSQL y cola de escáner móvil sincronizados"
              className="hidden shrink-0 items-center gap-1.5 rounded-full bg-success px-2.5 py-0.5 text-etiqueta font-semibold whitespace-nowrap text-success-foreground xl:inline-flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-success-solid animate-pulse" />
              PostgreSQL · RUC 20608945123
            </span>
          </div>

          {/* Zona derecha TopBar: Buscador rápido + Acciones */}
          <div className="flex shrink-0 items-center gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!quickSearch.trim()) return;
                const q = quickSearch.toLowerCase();
                if (q.includes("pos") || q.includes("venta")) router.push("/admin/pos");
                else if (q.includes("fact") || q.includes("boleta") || q.includes("comp"))
                  router.push("/admin/invoices");
                else if (q.includes("inv") || q.includes("stock"))
                  router.push("/admin/inventory");
                else if (q.includes("cli") || q.includes("placa"))
                  router.push("/admin/crm");
                else if (q.includes("cat")) router.push("/admin/categories");
                else router.push("/admin/products");
              }}
              className="relative hidden w-60 lg:block"
            >
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-texto-terciario" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Ir a módulo, SKU o comprobante…"
                className="h-control w-full rounded-full bg-card pr-11 pl-8 text-control text-foreground ring-1 ring-border placeholder:text-texto-terciario outline-none focus:ring-2 focus:ring-acento/40"
              />
              <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-border bg-secondary px-1.5 py-0.2 font-mono text-[10px] text-texto-terciario">
                ↵
              </kbd>
            </form>

            {secondaryActions}

            <Link
              href="/"
              className={cn(ACCION_SECUNDARIA, "hidden sm:inline-flex")}
              title="Ver portal web de Lubricentros Estrada"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Web Pública</span>
            </Link>

            {actionButton ? (
              actionButton.href ? (
                <Link href={actionButton.href} className={ACCION_PRINCIPAL}>
                  <Plus className="h-3.5 w-3.5" />
                  <span>{actionButton.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={actionButton.onClick}
                  className={ACCION_PRINCIPAL}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{actionButton.label}</span>
                </button>
              )
            ) : null}
          </div>
        </header>

        {/* Lienzo Principal Khipu */}
        <main className="flex-1 p-3 md:px-5 md:pt-2 md:pb-6">
          <div className={CONTENEDOR_PAGINA}>{children}</div>
        </main>
      </div>
    </div>
  );
}
