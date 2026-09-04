import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginBrandProps {
  className?: string;
  compact?: boolean;
}

/**
 * Identidad de marca de la plataforma (escudo + "Legislación Informática")
 * usada en el panel visual del login. Puramente presentacional.
 */
export function LoginBrand({ className, compact = false }: LoginBrandProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span
        className={cn(
          "flex items-center justify-center rounded-xl bg-login-indigo/40 text-login-pink ring-1 ring-login-border shrink-0",
          compact ? "h-9 w-9" : "h-11 w-11"
        )}
      >
        <ShieldCheck className={compact ? "h-5 w-5" : "h-6 w-6"} strokeWidth={2} />
      </span>
      <div>
        <p
          className={cn(
            "font-bold leading-tight text-login-text",
            compact ? "text-base" : "text-xl"
          )}
        >
          Legislación{" "}
          <span className="bg-gradient-to-r from-login-magenta to-login-pink bg-clip-text text-transparent">
            Informática
          </span>
        </p>
        {!compact && (
          <p className="mt-1 text-sm text-login-text-secondary">
            Conocimiento y normas para un mundo digital seguro
          </p>
        )}
      </div>
    </div>
  );
}
