import { Scale } from "lucide-react";
import { LoginBrand } from "./login-brand";
import { LoginIllustration } from "./login-illustration";

/**
 * Panel visual izquierdo del login (solo visible desde tablet en
 * adelante). Comunica tecnología + derecho + seguridad + educación.
 * No contiene lógica: es puramente presentacional.
 */
export function LoginVisualPanel() {
  return (
    <div
      className="relative hidden lg:flex lg:w-[48%] flex-col justify-between overflow-hidden bg-login-bg px-10 py-10 xl:px-14 xl:py-12 animate-login-fade-in-left motion-reduce:animate-none"
    >
      {/* fondo: gradientes + patrón de cuadrícula tecnológica muy sutil */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.06]" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-login-violet/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-login-magenta/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-login-bg via-login-bg to-login-bg-secondary/60" />
      </div>

      <LoginBrand className="relative z-10" />

      <div className="relative z-10 mx-auto -my-4 w-full max-w-md flex-1 flex items-center justify-center">
        <LoginIllustration />
      </div>

      <div className="relative z-10 flex items-start gap-3 rounded-2xl border border-login-border/60 bg-login-bg-secondary/40 p-4 backdrop-blur-sm">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-login-indigo/40 text-login-pink ring-1 ring-login-border">
          <Scale className="h-4 w-4" strokeWidth={2} />
        </span>
        <p className="text-sm leading-snug text-login-text-secondary">
          <span className="text-login-text">La tecnología avanza,</span>{" "}
          <span className="text-login-text">el derecho la guía.</span>
          <br />
          Conoce, entiende y aplica la legislación informática.
        </p>
      </div>
    </div>
  );
}
