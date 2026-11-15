import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0A0B",
          900: "#121214",
          800: "#1A1A1E",
          700: "#2A2A2E",
        },
        cream: {
          50: "#F8F6F2",
          100: "#EFEBE6",
          200: "#E3DDD5",
          text: "#151516",
          muted: "#6B6966",
        },
        ember: {
          400: "#FF8038",
          500: "#F26A1B",
          600: "#D9560E",
          glow: "rgba(242, 106, 27, 0.35)",
        },
        text: {
          hi: "#F5F5F5",
          lo: "#9A9A9F",
          dim: "#636369",
        },
        // Khipu Design System semantic tokens
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          light: "var(--primary-light)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          border: "var(--accent-border)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
          suave: "var(--destructive-suave)",
          texto: "var(--destructive-texto)",
          border: "var(--destructive-border)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
          border: "var(--success-border)",
          solid: "var(--success-solid)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
          border: "var(--warning-border)",
          solid: "var(--warning-solid)",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
        },
        acento: {
          DEFAULT: "var(--acento)",
          texto: "var(--acento-texto)",
          2: "var(--acento-2)",
          "2-texto": "var(--acento-2-texto)",
          3: "var(--acento-3)",
          suave: "var(--acento-suave)",
          "2-suave": "var(--acento-2-suave)",
          "3-suave": "var(--acento-3-suave)",
          superficie: "var(--acento-superficie)",
          "superficie-texto": "var(--acento-superficie-texto)",
          borde: "var(--acento-borde)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        "borde-tarjeta": "var(--borde-tarjeta)",
        "texto-terciario": "var(--texto-terciario)",
        codigo: {
          DEFAULT: "var(--codigo)",
          foreground: "var(--codigo-foreground)",
        },
      },
      spacing: {
        control: "2rem",
        "objetivo-tactil": "2.75rem",
      },
      fontSize: {
        etiqueta: ["0.71875rem", { lineHeight: "1rem" }],
        control: ["0.8125rem", { lineHeight: "1.25rem" }],
        campo: ["1rem", { lineHeight: "1.25rem" }],
        cuerpo: ["0.8125rem", { lineHeight: "1.25rem" }],
        titulo: ["0.90625rem", { lineHeight: "1.25rem", letterSpacing: "-0.014em", fontWeight: "600" }],
        "titulo-pagina": ["1.3125rem", { lineHeight: "1.5rem", letterSpacing: "-0.028em", fontWeight: "650" }],
        metrica: ["1.375rem", { lineHeight: "1.625rem", letterSpacing: "-0.035em", fontWeight: "650" }],
        "metrica-texto": ["1.125rem", { lineHeight: "1.625rem", letterSpacing: "-0.02em", fontWeight: "600" }],
      },
      boxShadow: {
        tarjeta: "var(--brillo-tarjeta)",
        elevada: "var(--sombra-elevada)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Outfit", "system-ui", "sans-serif"],
        body: ["Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        wideEyebrow: "0.22em",
      },
      backgroundImage: {
        "ember-sunset": "linear-gradient(90deg, #F26A1B 0%, #A33A0D 45%, #180B05 100%)",
        "radial-ember": "radial-gradient(circle at 65% 50%, rgba(242, 106, 27, 0.15) 0%, transparent 60%)",
      },
    },
  },
  plugins: [],
};
export default config;
