"use client";

// Paso 2 de la recuperación de contraseña: el estudiante llega aquí desde el
// enlace del correo. El cliente de Supabase procesa el enlace automáticamente
// (código o token en la URL) y abre una sesión temporal de recuperación; con
// ella se guarda la nueva contraseña.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { SupabaseAuthRepository } from "../infrastructure/supabase-auth.repository";
import { UpdatePasswordUseCase } from "../application/auth.use-cases";

type Estado = "verificando" | "listo" | "sin-enlace" | "guardado";

/** Lee un error que Supabase haya dejado en la URL (p. ej. enlace vencido). */
function errorEnUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const codigo = params.get("error_code") ?? query.get("error_code");
  const descripcion = params.get("error_description") ?? query.get("error_description");
  if (!codigo && !descripcion) return null;
  return codigo === "otp_expired" || /expired|invalid/i.test(descripcion ?? "")
    ? "El enlace de recuperación venció o ya fue usado."
    : "No se pudo validar el enlace de recuperación.";
}

export function NewPasswordForm() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("verificando");
  const [motivo, setMotivo] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [ver, setVer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const errorUrl = errorEnUrl();
    if (errorUrl) {
      setMotivo(errorUrl);
      setEstado("sin-enlace");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    let resuelto = false;
    const marcarListo = () => {
      resuelto = true;
      setEstado((e) => (e === "verificando" ? "listo" : e));
    };
    const { data } = supabase.auth.onAuthStateChange((evento, sesion) => {
      if (evento === "PASSWORD_RECOVERY" || sesion) marcarListo();
    });
    supabase.auth.getSession().then(({ data: d }) => {
      if (d.session) marcarListo();
    });
    // Si en unos segundos no hay sesión, el enlace no era válido (o se abrió en otro navegador).
    const t = setTimeout(() => {
      if (!resuelto) {
        setMotivo("No encontramos un enlace de recuperación válido.");
        setEstado((e) => (e === "verificando" ? "sin-enlace" : e));
      }
    }, 5000);
    return () => {
      clearTimeout(t);
      data.subscription.unsubscribe();
    };
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setGuardando(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await new UpdatePasswordUseCase(new SupabaseAuthRepository(supabase)).execute(password);
      setEstado("guardado");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la contraseña.");
    } finally {
      setGuardando(false);
    }
  }

  if (estado === "verificando") {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Verificando el enlace de recuperación…
      </p>
    );
  }

  if (estado === "sin-enlace") {
    return (
      <div className="flex flex-col gap-3 max-w-sm">
        <div role="alert" className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
          {motivo} Solicita un nuevo enlace y ábrelo en este mismo navegador.
        </div>
        <a href="/recuperar-password" className="text-sm text-primary hover:underline">
          Solicitar un nuevo enlace
        </a>
      </div>
    );
  }

  if (estado === "guardado") {
    return (
      <div role="status" className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-700 text-sm max-w-sm">
        Tu contraseña se actualizó correctamente. Entrando a la plataforma…
      </div>
    );
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-4 w-full max-w-sm">
      <Input
        id="nueva-password"
        type={ver ? "text" : "password"}
        label="Nueva contraseña"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Input
        id="confirmar-nueva-password"
        type={ver ? "text" : "password"}
        label="Confirmar nueva contraseña"
        autoComplete="new-password"
        value={confirmacion}
        onChange={(e) => setConfirmacion(e.target.value)}
        required
      />
      <button
        type="button"
        onClick={() => setVer((v) => !v)}
        className="self-start inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        {ver ? <EyeOff className="w-3.5 h-3.5" aria-hidden /> : <Eye className="w-3.5 h-3.5" aria-hidden />}
        {ver ? "Ocultar contraseñas" : "Mostrar contraseñas"}
      </button>
      <p className="text-xs text-muted-foreground -mt-2">Mínimo 8 caracteres, con al menos una mayúscula y un número.</p>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={guardando} className="mt-2">
        Guardar nueva contraseña
      </Button>
    </form>
  );
}
