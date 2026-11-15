"use client";

import React, { type ReactNode } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Recetas de clases compartidas de khipu-design-system (src/lib/estilos.ts) ──

export const PRESION = "active:scale-[0.98]";
export const FOCO =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const TRANSICION_CONTROL =
  "transition-all duration-150 ease-out";
const DESHABILITADO =
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";

export const ACCION_PRINCIPAL = `inline-flex h-control items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-control font-semibold whitespace-nowrap text-primary-foreground shadow-sm ${TRANSICION_CONTROL} hover:opacity-90 ${FOCO} ${PRESION} ${DESHABILITADO}`;

export const ACCION_SECUNDARIA = `inline-flex h-control items-center justify-center gap-1.5 rounded-full bg-card px-3.5 text-control font-medium whitespace-nowrap text-foreground ring-1 ring-border ${TRANSICION_CONTROL} hover:bg-secondary ${FOCO} ${PRESION} ${DESHABILITADO}`;

export const BOTON_PRIMARIO = ACCION_PRINCIPAL;
export const BOTON_SECUNDARIO = ACCION_SECUNDARIA;
export const BOTON_DESTRUCTIVO = `inline-flex h-control items-center justify-center gap-1.5 rounded-full bg-destructive px-4 text-control font-semibold text-destructive-foreground shadow-sm ${TRANSICION_CONTROL} hover:opacity-90 ${FOCO} ${PRESION} ${DESHABILITADO}`;

export const CONTROL_FILTRO =
  "h-control rounded-full border border-border bg-card px-3 text-control font-medium text-foreground outline-none transition-colors hover:bg-secondary/60 focus:border-acento";

export const SEGMENTADO =
  "inline-flex min-h-control w-fit flex-wrap items-center gap-0.5 rounded-full bg-secondary p-[3px] border border-border/50";

export const SEGMENTO_BASE =
  "relative inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-control font-medium whitespace-nowrap text-muted-foreground transition-all duration-150 outline-none hover:text-foreground cursor-pointer select-none";

export const SEGMENTO_ACTIVO =
  "bg-card text-foreground shadow-sm dark:bg-input font-semibold";

export const CAMPO =
  "h-control w-full rounded-lg border border-input bg-card px-3 text-control text-foreground transition-all duration-150 outline-none placeholder:text-texto-terciario focus:border-acento focus:ring-2 focus:ring-acento/25 disabled:cursor-not-allowed disabled:opacity-60";

export const SELECT_NATIVO =
  "h-control rounded-lg border border-input bg-card px-2.5 text-control text-foreground transition-all duration-150 outline-none focus:border-acento focus:ring-2 focus:ring-acento/25 disabled:cursor-not-allowed disabled:opacity-60";

export const ETIQUETA_CAMPO = "block text-etiqueta font-medium text-foreground mb-1";
export const AYUDA_CAMPO = "text-etiqueta text-muted-foreground mt-1";

export const ROTULO =
  "text-etiqueta font-semibold uppercase tracking-[0.04em] text-texto-terciario";

export const CABECERA_TABLA = `h-auto px-3 pt-2.5 pb-1 text-left ${ROTULO}`;

export const TARJETA =
  "rounded-xl border border-borde-tarjeta bg-card shadow-tarjeta";

export const TARJETA_ELEVABLE = `${TARJETA} transition-all duration-200 hover:shadow-elevada hover:-translate-y-0.5`;

export const CONTENEDOR_PAGINA =
  "mx-auto flex w-full max-w-[1520px] min-w-0 flex-col gap-3";

export const CONTENEDOR_TABLA =
  "min-w-0 overflow-hidden rounded-xl border border-borde-tarjeta bg-card px-2.5 pb-1.5 shadow-tarjeta transition-opacity";

// ── Patrones de Estado y Código (src/components/patrones/pill-estado.tsx) ──

export type Tono = "ok" | "aviso" | "error" | "neutro";
export type TonoMetrica = Tono | "acento";
export type VisualMetrica =
  | { tipo: "barra"; valor: number }
  | { tipo: "puntos"; total: number; marcados: number };

const ESTILOS_PILL: Record<Tono, string> = {
  ok: "bg-success text-success-foreground",
  aviso: "bg-warning text-warning-foreground",
  error: "bg-destructive-suave text-destructive-texto",
  neutro: "bg-secondary text-muted-foreground",
};

const PUNTOS_TONO: Record<TonoMetrica, string> = {
  ok: "bg-success-solid",
  aviso: "bg-warning-solid",
  error: "bg-destructive",
  neutro: "bg-muted-foreground/50",
  acento: "bg-acento",
};

const TEXTO_TONO: Record<TonoMetrica, string> = {
  ok: "text-success-foreground",
  aviso: "text-warning-foreground",
  error: "text-destructive-texto",
  neutro: "text-muted-foreground",
  acento: "text-acento-2-texto dark:text-acento-2",
};

export function Punto({ tono }: { tono: Tono }) {
  return <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", PUNTOS_TONO[tono])} />;
}

export function PillEstado({
  tono,
  icon: Icono,
  children,
  className,
}: {
  tono: Tono;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-etiqueta font-medium whitespace-nowrap",
        ESTILOS_PILL[tono],
        className
      )}
    >
      {Icono ? (
        <Icono aria-hidden className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", PUNTOS_TONO[tono])} />
      )}
      {children}
    </span>
  );
}

export function Chip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-etiqueta font-medium whitespace-nowrap text-muted-foreground tabular-nums",
        className
      )}
    >
      {children}
    </span>
  );
}

export function ChipCodigo({
  children,
  inactivo,
  className,
}: {
  children: ReactNode;
  inactivo?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-etiqueta font-medium whitespace-nowrap",
        inactivo
          ? "bg-secondary text-muted-foreground line-through"
          : "bg-accent text-accent-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

// ── Patrones de Métricas (src/components/patrones/metricas.tsx) ──

export function AyudaMetrica({
  tono,
  children,
}: {
  tono: Tono;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-1.5",
        tono !== "neutro" && TEXTO_TONO[tono]
      )}
    >
      <Punto tono={tono} />
      <span className="truncate">{children}</span>
    </span>
  );
}

export function ChipVariacion({
  variacion,
  invertir,
  destacada,
}: {
  variacion: number;
  invertir?: boolean;
  destacada?: boolean;
}) {
  const positiva = variacion > 0;
  const negativa = variacion < 0;
  const buena = invertir ? negativa : positiva;
  const mala = invertir ? positiva : negativa;
  const Flecha = positiva ? ArrowUpRight : negativa ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-etiqueta font-semibold tabular-nums",
        destacada
          ? "bg-current/15 text-current"
          : buena
          ? "bg-success text-success-foreground"
          : mala
          ? "bg-destructive-suave text-destructive-texto"
          : "bg-secondary text-foreground"
      )}
    >
      <Flecha className="h-3 w-3" />
      {Math.abs(variacion).toFixed(1)}%
    </span>
  );
}

export function VisualDeMetrica({
  visual,
  tono = "neutro",
  destacada,
}: {
  visual: VisualMetrica;
  tono?: TonoMetrica;
  destacada?: boolean;
}) {
  if (visual.tipo === "barra") {
    const valor = Math.max(0, Math.min(100, visual.valor));
    return (
      <div
        role="progressbar"
        aria-valuenow={valor}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          "h-1.5 overflow-hidden rounded-full",
          destacada ? "bg-current/15" : "bg-secondary"
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            destacada ? "bg-current" : PUNTOS_TONO[tono]
          )}
          style={{ width: `${valor}%` }}
        />
      </div>
    );
  }
  const marcados = Math.max(0, Math.min(visual.total, visual.marcados));
  return (
    <div
      aria-hidden
      className="grid h-1.5 gap-1"
      style={{ gridTemplateColumns: `repeat(${visual.total}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: visual.total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full",
            i < marcados
              ? destacada
                ? "bg-current"
                : PUNTOS_TONO[tono]
              : destacada
              ? "bg-current/15"
              : "bg-secondary"
          )}
        />
      ))}
    </div>
  );
}

export function TarjetaMetrica({
  etiqueta,
  icono: Icono,
  tono = "neutro",
  destacada,
  acciones,
  className,
  children,
}: {
  etiqueta: ReactNode;
  icono?: LucideIcon;
  tono?: TonoMetrica;
  destacada?: boolean;
  acciones?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        TARJETA_ELEVABLE,
        "flex min-w-0 flex-col gap-2 px-[15px] pt-3.5 pb-[13px]",
        destacada &&
          "border-acento-borde bg-acento-superficie text-acento-superficie-texto",
        className
      )}
    >
      <div className="flex min-h-[24px] min-w-0 items-center gap-[7px] text-control font-medium">
        {Icono ? (
          <Icono
            aria-hidden
            className={cn(
              "h-4 w-4 shrink-0",
              destacada ? "text-current" : TEXTO_TONO[tono]
            )}
          />
        ) : null}
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            destacada ? "text-current" : "text-muted-foreground"
          )}
        >
          {etiqueta}
        </span>
        {acciones ? <span className="-my-1 shrink-0">{acciones}</span> : null}
      </div>
      {children}
    </div>
  );
}

export function Metrica({
  etiqueta,
  children,
  sufijo,
  ayuda,
  icono,
  tono,
  visual,
  destacada,
  acciones,
  texto,
}: {
  etiqueta: string;
  children: ReactNode;
  sufijo?: ReactNode;
  ayuda: ReactNode;
  icono?: LucideIcon;
  tono?: TonoMetrica;
  visual?: VisualMetrica;
  destacada?: boolean;
  acciones?: ReactNode;
  texto?: boolean;
}) {
  return (
    <TarjetaMetrica
      etiqueta={etiqueta}
      icono={icono}
      tono={tono}
      destacada={destacada}
      acciones={acciones}
    >
      <div
        className={cn(
          "flex min-w-0 flex-wrap items-baseline gap-x-1.5",
          texto ? "text-metrica-texto" : "text-metrica tabular-nums",
          destacada ? "text-current" : "text-foreground"
        )}
      >
        {children}
        {sufijo ? (
          <span
            className={cn(
              "text-control font-normal",
              destacada ? "opacity-75" : "text-texto-terciario"
            )}
          >
            {sufijo}
          </span>
        ) : null}
      </div>
      {visual ? (
        <VisualDeMetrica visual={visual} tono={tono} destacada={destacada} />
      ) : null}
      <div
        className={cn(
          "flex min-w-0 items-center gap-1.5 truncate text-etiqueta",
          destacada ? "opacity-85" : "text-texto-terciario"
        )}
      >
        {ayuda}
      </div>
    </TarjetaMetrica>
  );
}

export function FilaMetricas({
  children,
  columnas = 4,
}: {
  children: ReactNode;
  columnas?: 2 | 3 | 4 | 5;
}) {
  return (
    <section
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2",
        columnas === 5 && "lg:grid-cols-5",
        columnas === 4 && "lg:grid-cols-4",
        columnas === 3 && "lg:grid-cols-3",
        columnas === 2 && "lg:grid-cols-2"
      )}
    >
      {children}
    </section>
  );
}

// ── Cabeceras de Sección y Pies (src/components/patrones/cabecera-seccion.tsx) ──

export function CabeceraSeccion({
  icon: Icon,
  titulo,
  subtitulo,
  derecha,
  conBorde = true,
  className,
}: {
  icon: LucideIcon;
  titulo: ReactNode;
  subtitulo?: ReactNode;
  derecha?: ReactNode;
  conBorde?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-2 px-4 pt-3.5",
        conBorde ? "pb-2" : "pb-3.5",
        className
      )}
    >
      <Icon
        aria-hidden
        className="h-[18px] w-[18px] shrink-0 text-acento-2-texto dark:text-acento-2"
      />
      <div className="flex min-w-0 flex-1 basis-48 flex-col">
        <h2 className="text-titulo text-foreground">{titulo}</h2>
        {subtitulo ? (
          <span className="truncate text-etiqueta text-texto-terciario">
            {subtitulo}
          </span>
        ) : null}
      </div>
      {derecha}
    </div>
  );
}

export function PieSeccion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pt-1 pb-3 text-etiqueta text-texto-terciario",
        className
      )}
    >
      {children}
    </div>
  );
}

// ── Tablas en Banda Redondeada de khipu-design-system (src/components/ui/table.tsx & pie-tabla.tsx) ──

export function Table({
  className,
  ...props
}: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn(
          "w-full caption-bottom border-separate border-spacing-x-0 border-spacing-y-[3px] text-cuerpo",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("", className)} {...props} />;
}

export function TableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("", className)} {...props} />;
}

export function TableRow({
  className,
  ...props
}: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn("group/fila", className)}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        CABECERA_TABLA,
        "align-middle whitespace-nowrap",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "bg-secondary px-3 py-2.5 align-middle whitespace-nowrap transition-colors duration-150 first:rounded-l-xl last:rounded-r-xl group-hover/fila:bg-secondary/75",
        className
      )}
      {...props}
    />
  );
}

export function FilaVacia({
  columnas,
  icon,
  children,
}: {
  columnas: number;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columnas} className="bg-transparent group-hover/fila:bg-transparent">
        <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          {icon}
          <p className="text-cuerpo">{children}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function PieTablaSimple({
  mostrando,
  total,
  unidad,
  nota,
  pagina = 1,
  ultimaPagina = 1,
  onPagina,
}: {
  mostrando: number;
  total: number;
  unidad: string;
  nota?: ReactNode;
  pagina?: number;
  ultimaPagina?: number;
  onPagina?: (p: number) => void;
}) {
  const desde = mostrando === 0 ? 0 : (pagina - 1) * mostrando + 1;
  const hasta = Math.min(total, desde + mostrando - 1);

  return (
    <div className="flex flex-col items-center justify-between gap-3 bg-transparent px-4 py-2.5 text-control text-muted-foreground sm:flex-row">
      <div className="flex flex-wrap items-center gap-2">
        <span>
          Mostrando{" "}
          <span className="font-mono font-semibold text-foreground tabular-nums">
            {mostrando === 0 ? "0" : `1–${mostrando}`}
          </span>{" "}
          de{" "}
          <span className="font-mono font-semibold text-foreground tabular-nums">
            {total}
          </span>{" "}
          {unidad}
        </span>
        {nota ? (
          <>
            <span className="hidden text-muted-foreground/40 md:inline">·</span>
            <span className="hidden text-etiqueta text-muted-foreground/80 md:inline">
              {nota}
            </span>
          </>
        ) : null}
      </div>

      {onPagina && ultimaPagina > 1 ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={pagina <= 1}
            onClick={() => onPagina(pagina - 1)}
            className="inline-flex h-control items-center gap-1 rounded-full border border-border bg-card px-2.5 text-etiqueta font-medium text-foreground/80 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Anterior
          </button>
          <span className="flex h-control w-control items-center justify-center rounded-full bg-foreground font-mono text-etiqueta font-medium text-background">
            {pagina}
          </span>
          <button
            type="button"
            disabled={pagina >= ultimaPagina}
            onClick={() => onPagina(pagina + 1)}
            className="inline-flex h-control items-center gap-1 rounded-full border border-border bg-card px-2.5 text-etiqueta font-medium text-foreground/80 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            Siguiente <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <span className="flex h-control w-control items-center justify-center rounded-full bg-foreground font-mono text-etiqueta font-medium text-background shadow-sm">
            1
          </span>
        </div>
      )}
    </div>
  );
}

// ── Controles de Barra de Filtros (Segmentado y Buscador Khipu) ──

export function SegmentadoControl<T extends string>({
  opciones,
  valor,
  onChange,
  className,
}: {
  opciones: { valor: T; etiqueta: ReactNode; contador?: number }[];
  valor: T;
  onChange: (nuevo: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn(SEGMENTADO, className)}>
      {opciones.map((op) => {
        const activo = op.valor === valor;
        return (
          <button
            key={op.valor}
            type="button"
            role="tab"
            aria-selected={activo}
            onClick={() => onChange(op.valor)}
            className={cn(SEGMENTO_BASE, activo && SEGMENTO_ACTIVO)}
          >
            <span>{op.etiqueta}</span>
            {op.contador !== undefined ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 font-mono text-[10.5px] tabular-nums",
                  activo
                    ? "bg-acento-suave text-acento-texto dark:text-acento"
                    : "bg-card/60 text-texto-terciario"
                )}
              >
                {op.contador}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function BuscadorKhipu({
  valor,
  onChange,
  placeholder = "Buscar…",
  className,
}: {
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-[200px] flex-1 max-w-sm", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-texto-terciario" />
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          CONTROL_FILTRO,
          "w-full pl-8 pr-8 font-normal placeholder:text-texto-terciario"
        )}
      />
      {valor ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5 text-texto-terciario hover:bg-secondary hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
