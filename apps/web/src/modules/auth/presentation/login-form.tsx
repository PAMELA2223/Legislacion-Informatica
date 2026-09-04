"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { SupabaseAuthRepository } from "../infrastructure/supabase-auth.repository";
import { LoginUseCase } from "../application/auth.use-cases";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estado puramente visual (no forma parte de la lógica de autenticación)
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const repo = new SupabaseAuthRepository(supabase);
      const useCase = new LoginUseCase(repo);
      await useCase.execute({ email, password });

      const redirectTo = searchParams.get("redirectTo") || "/dashboard";
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-5" noValidate>
      {/* Correo electrónico */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-login-text">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-login-text-secondary"
            strokeWidth={2}
            aria-hidden="true"
          />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nombre@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-login-border/70 bg-login-bg-secondary/60 py-2.5 pl-10 pr-3.5 text-sm text-login-text placeholder:text-login-text-secondary/60 outline-none transition-colors duration-200 focus:border-login-magenta focus:ring-2 focus:ring-login-magenta/25"
          />
        </div>
      </div>

      {/* Contraseña */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-login-text">
          Contraseña
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-login-text-secondary"
            strokeWidth={2}
            aria-hidden="true"
          />
          <input
            id="password"
            key={showPassword ? "text" : "password"}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-login-border/70 bg-login-bg-secondary/60 py-2.5 pl-10 pr-11 text-sm text-login-text placeholder:text-login-text-secondary/60 outline-none transition-colors duration-200 focus:border-login-magenta focus:ring-2 focus:ring-login-magenta/25"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-login-text-secondary transition-colors duration-200 hover:text-login-text"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Recordarme / olvidaste tu contraseña */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-login-text-secondary">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-login-border/70 bg-login-bg-secondary text-login-magenta accent-login-magenta focus:ring-login-magenta/30"
          />
          Recordarme
        </label>
        <a
          href="/recuperar-password"
          className="text-login-pink transition-colors duration-200 hover:text-login-magenta hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {/* Error de autenticación */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Botón principal */}
      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-login-magenta to-login-pink px-4 py-3 text-sm font-semibold text-white shadow-glow-magenta-sm transition-all duration-200",
          "hover:brightness-110 hover:shadow-glow-magenta",
          "disabled:opacity-50 disabled:pointer-events-none"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden="true" />
            Iniciando sesión...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Iniciar sesión
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-login-text-secondary">
        <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        Acceso seguro y autorizado
      </p>

      <p className="text-center text-sm text-login-text-secondary">
        ¿No tienes una cuenta?{" "}
        <a
          href="/registro"
          className="font-medium text-login-pink transition-colors duration-200 hover:text-login-magenta hover:underline"
        >
          Crear cuenta
        </a>
      </p>
    </form>
  );
}
