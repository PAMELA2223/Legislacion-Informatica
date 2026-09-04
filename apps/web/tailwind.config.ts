import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cada color se define via variable CSS (ver globals.css), lo que
        // permite que /10, /20, /90, etc. sigan funcionando (<alpha-value>)
        // Y que el modo oscuro cambie los valores sin tocar ningun componente.

        // Identidad de tesis: navy (estructural), azul tecnologico (accion),
        // turquesa (innovacion/exito), dorado (detalle academico, uso minimo)
        navy: "rgb(var(--color-navy) / <alpha-value>)",
        "navy-light": "rgb(var(--color-navy-light) / <alpha-value>)",

        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-hover": "rgb(var(--color-primary-hover) / <alpha-value>)",
        "primary-dark": "rgb(var(--color-primary-dark) / <alpha-value>)",

        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        gold: "rgb(var(--color-gold) / <alpha-value>)",

        background: "rgb(var(--color-background) / <alpha-value>)",
        "background-secondary": "rgb(var(--color-background-secondary) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",

        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        "muted-foreground": "rgb(var(--color-muted-foreground) / <alpha-value>)",
        "disabled-foreground": "rgb(var(--color-disabled-foreground) / <alpha-value>)",

        border: "rgb(var(--color-border) / <alpha-value>)",
        "border-strong": "rgb(var(--color-border-strong) / <alpha-value>)",

        // Identidad dedicada del panel de inicio de sesión (independiente
        // del tema claro/oscuro general). Ver comentario en globals.css.
        "login-bg": "rgb(var(--color-login-bg) / <alpha-value>)",
        "login-bg-secondary": "rgb(var(--color-login-bg-secondary) / <alpha-value>)",
        "login-surface": "rgb(var(--color-login-surface) / <alpha-value>)",
        "login-border": "rgb(var(--color-login-border) / <alpha-value>)",
        "login-text": "rgb(var(--color-login-text) / <alpha-value>)",
        "login-text-secondary": "rgb(var(--color-login-text-secondary) / <alpha-value>)",
        "login-indigo": "rgb(var(--color-login-indigo) / <alpha-value>)",
        "login-violet": "rgb(var(--color-login-violet) / <alpha-value>)",
        "login-magenta": "rgb(var(--color-login-magenta) / <alpha-value>)",
        "login-pink": "rgb(var(--color-login-pink) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        "card-sm": "0 4px 10px rgba(0,0,0,.05)",
        "card-md": "0 8px 25px rgba(0,0,0,.08)",
        "card-lg": "0 12px 35px rgba(0,0,0,.10)",
        "glow-primary": "0 0 40px rgba(37,99,235,.15)",
        "glow-magenta": "0 0 40px rgba(217,70,239,.20)",
        "glow-magenta-sm": "0 0 20px rgba(217,70,239,.35)",
        "glow-indigo": "0 0 60px rgba(49,46,129,.45)",
        "login-card": "0 20px 60px rgba(0,0,0,.45)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(148,163,184,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-slow": {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "login-fade-in-left": {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "login-fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out both",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "login-fade-in-left": "login-fade-in-left 0.7s ease-out both",
        "login-fade-in-right": "login-fade-in-right 0.7s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
