"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { SupabaseAuthRepository } from "../infrastructure/supabase-auth.repository";
import { RequestPasswordResetUseCase } from "../application/auth.use-cases";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const repo = new SupabaseAuthRepository(supabase);
      const useCase = new RequestPasswordResetUseCase(repo);
      await useCase.execute(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el correo");
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-700 text-sm max-w-sm">
        Si el correo existe en nuestro sistema, recibirás un enlace para
        restablecer tu contraseña.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <Input
        id="email"
        type="email"
        label="Correo electrónico"
        placeholder="nombre@ejemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={isLoading} className="mt-2">
        Enviar enlace de recuperación
      </Button>
      <a href="/login" className="text-sm text-primary hover:underline text-center mt-2">
        Volver a inicio de sesión
      </a>
    </form>
  );
}
