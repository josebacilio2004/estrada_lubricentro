import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0A0B", // Darkest obsidian background
          900: "#121214", // Elevated dark surface
          800: "#1A1A1E",
          700: "#2A2A2E", // Border & divider lines
        },
        cream: {
          50: "#F8F6F2",
          100: "#EFEBE6", // DOSLA light section background
          200: "#E3DDD5",
          text: "#151516", // High contrast dark text on cream
          muted: "#6B6966",
        },
        ember: {
          400: "#FF8038",
          500: "#F26A1B", // Signature DOSLA vibrant orange
          600: "#D9560E",
          glow: "rgba(242, 106, 27, 0.35)",
        },
        text: {
          hi: "#F5F5F5", // Pure white typography
          lo: "#9A9A9F", // Sophisticated subdued grey
          dim: "#636369",
        },
      },
      fontFamily: {
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
