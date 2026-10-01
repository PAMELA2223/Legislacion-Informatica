"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mostrarAviso } from "@/lib/avisos";

/** Título, instrucciones y tiempo límite de una evaluación o autoevaluación. */
export function EvaluationSettingsForm({
  evaluacion,
}: {
  evaluacion: { id: string; titulo: string; descripcion: string | null; tiempoLimite: number };
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(evaluacion.titulo);
  const [descripcion, setDescripcion] = useState(evaluacion.descripcion ?? "");
  const [tiempoLimite, setTiempoLimite] = useState(evaluacion.tiempoLimite);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);
    setEnviando(true);
    try {
      const res = await fetch(`/api/admin/evaluaciones/${evaluacion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descripcion, tiempoLimite: Number(tiempoLimite) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar.");
      mostrarAviso("Configuración guardada.");
      router.refresh();
    } catch (err) {
      setMensaje({ ok: false, texto: err instanceof Error ? err.message : "Error al guardar." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-4">
      <Input id="ev-titulo" label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ev-desc" className="text-sm font-medium text-foreground">Instrucciones para el estudiante (opcional)</label>
        <textarea
          id="ev-desc"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>
      <Input
        id="ev-tiempo"
        label="Tiempo límite (minutos, 0 = sin límite)"
        type="number"
        min={0}
        value={tiempoLimite}
        onChange={(e) => setTiempoLimite(Number(e.target.value))}
      />
      {mensaje && <p className={`text-sm ${mensaje.ok ? "text-success" : "text-red-500"}`}>{mensaje.texto}</p>}
      <Button type="submit" isLoading={enviando} className="self-start" variant="outline">
        Guardar configuración
      </Button>
    </form>
  );
}
