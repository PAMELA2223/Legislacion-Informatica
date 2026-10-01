"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { mostrarAviso } from "@/lib/avisos";
import { ETIQUETAS_FUENTE, FUENTES_CHATBOT, type ConfigChatbot, type FuenteChatbot } from "@/modules/chatbot/domain/chatbot-config";

/** Activar/desactivar el asistente y elegir los contenidos que puede usar. */
export function ChatbotConfigForm({ inicial }: { inicial: ConfigChatbot }) {
  const router = useRouter();
  const [activo, setActivo] = useState(inicial.activo);
  const [fuentes, setFuentes] = useState<FuenteChatbot[]>(inicial.fuentes);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const res = await fetch("/api/admin/chatbot", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo, fuentes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo guardar.");
      mostrarAviso(activo ? "Configuración del asistente guardada." : "El asistente quedó desactivado para los estudiantes.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-5">
      <label className="flex items-start gap-3 rounded-xl border border-border p-4 cursor-pointer">
        <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
        <span>
          <span className="block text-sm font-medium text-foreground">Asistente activo</span>
          <span className="block text-xs text-muted-foreground">
            Si lo desactivas, la bolita del chat deja de mostrarse en la plataforma. No afecta a módulos, evaluaciones ni autoevaluaciones.
          </span>
        </span>
      </label>

      <fieldset disabled={!activo} className="flex flex-col gap-2 disabled:opacity-50">
        <legend className="text-sm font-medium text-foreground mb-2">Contenidos que puede utilizar</legend>
        {FUENTES_CHATBOT.map((f) => (
          <label key={f} className="flex items-start gap-3 rounded-xl px-3 py-2 hover:bg-background-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={fuentes.includes(f)}
              onChange={(e) => setFuentes((prev) => (e.target.checked ? [...prev, f] : prev.filter((x) => x !== f)))}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <span>
              <span className="block text-sm text-foreground">{ETIQUETAS_FUENTE[f].nombre}</span>
              <span className="block text-xs text-muted-foreground">{ETIQUETAS_FUENTE[f].detalle}</span>
            </span>
          </label>
        ))}
        <p className="text-xs text-muted-foreground mt-1">
          El asistente responde solo con los contenidos marcados; si no encuentra información suficiente, lo indica en lugar de inventar.
        </p>
      </fieldset>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <Button type="submit" isLoading={guardando} className="self-start">Guardar configuración</Button>
    </form>
  );
}
