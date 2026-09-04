"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { SupabaseAuthRepository } from "../infrastructure/supabase-auth.repository";
import { RegisterUseCase } from "../application/auth.use-cases";
import {
  User,
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

export function RegisterForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estado puramente visual (no forma parte de la lógica de autenticación)
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validaciones de UI (no reemplazan ni duplican las reglas del dominio,
    // que se siguen aplicando dentro de RegisterUseCase.execute)
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!acceptedTerms) {
      setError("Debes aceptar los Términos y Condiciones para continuar.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const repo = new SupabaseAuthRepository(supabase);
      const useCase = new RegisterUseCase(repo);
      await useCase.execute({ nombre, email, password });

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
        <span>
          Cuenta creada. Revisa tu correo para confirmar tu cuenta. Redirigiendo
          al inicio de sesión...
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-5" noValidate>
      {/* Nombre completo */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombre" className="text-sm font-medium text-login-text">
          Nombre completo
        </label>
        <div className="relative">
          <User
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-login-text-secondary"
            strokeWidth={2}
            aria-hidden="true"
          />
          <input
            id="nombre"
            type="text"
            autoComplete="name"
            placeholder="Ingresa tu nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full rounded-xl border border-login-border/70 bg-login-bg-secondary/60 py-2.5 pl-10 pr-3.5 text-sm text-login-text placeholder:text-login-text-secondary/60 outline-none transition-colors duration-200 focus:border-login-magenta focus:ring-2 focus:ring-login-magenta/25"
          />
        </div>
      </div>

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
            autoComplete="new-password"
            placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
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

      {/* Confirmar contraseña (validación de UI, misma regla del dominio se aplica al enviar) */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm-password" className="text-sm font-medium text-login-text">
          Confirmar contraseña
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-login-text-secondary"
            strokeWidth={2}
            aria-hidden="true"
          />
          <input
            id="confirm-password"
            key={showConfirmPassword ? "text" : "password"}
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-login-border/70 bg-login-bg-secondary/60 py-2.5 pl-10 pr-11 text-sm text-login-text placeholder:text-login-text-secondary/60 outline-none transition-colors duration-200 focus:border-login-magenta focus:ring-2 focus:ring-login-magenta/25"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-login-text-secondary transition-colors duration-200 hover:text-login-text"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Términos y condiciones */}
      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-login-text-secondary">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-login-border/70 bg-login-bg-secondary text-login-magenta accent-login-magenta focus:ring-login-magenta/30"
        />
        <span>
          Acepto los{" "}
          <a href="/terminos" className="text-login-pink hover:text-login-magenta hover:underline">
            Términos y Condiciones
          </a>{" "}
          y la{" "}
          <a href="/privacidad" className="text-login-pink hover:text-login-magenta hover:underline">
            Política de Privacidad
          </a>
        </span>
      </label>

      {/* Error */}
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
            Creando cuenta...
          </>
        ) : (
          <>
            <User className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Crear cuenta
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </>
        )}
      </button>

      <p className="text-center text-sm text-login-text-secondary">
        ¿Ya tienes una cuenta?{" "}
        <a
          href="/login"
          className="font-medium text-login-pink transition-colors duration-200 hover:text-login-magenta hover:underline"
        >
          Iniciar sesión
        </a>
      </p>
    </form>
  );
}
