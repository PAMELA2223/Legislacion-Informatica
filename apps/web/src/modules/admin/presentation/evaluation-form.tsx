"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EvaluationForm({ cursos }: { cursos: { id: string; titulo: string }[] }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [courseId, setCourseId] = useState("");
  const [tiempoLimite, setTiempoLimite] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/admin/evaluaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, courseId: courseId || undefined, tiempoLimite: Number(tiempoLimite) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear la evaluación.");
      router.push(`/admin/evaluaciones/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la evaluación.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      <Input label="Título de la evaluación" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Módulo asociado (opcional)</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="">Sin módulo específico</option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>{c.titulo}</option>
          ))}
        </select>
      </div>

      <Input
        label="Tiempo límite en minutos (0 = sin límite)"
        type="number"
        min={0}
        value={tiempoLimite}
        onChange={(e) => setTiempoLimite(Number(e.target.value))}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-start">
        Crear y continuar agregando preguntas
      </Button>
    </form>
  );
}
