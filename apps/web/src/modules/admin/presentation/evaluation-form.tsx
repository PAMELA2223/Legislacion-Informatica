"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EvaluationForm({ cursos }: { cursos: { id: string; titulo: string }[] }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [courseId, setCourseId] = useState(cursos[0]?.id ?? "");
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
        body: JSON.stringify({ titulo, courseId, tipo: "modulo", tiempoLimite: Number(tiempoLimite) }),
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

  if (cursos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todos los módulos ya tienen su evaluación. Para las autoevaluaciones inicial y final ve a{" "}
        <Link href="/admin/autoevaluaciones" className="text-primary hover:underline">Autoevaluaciones</Link>.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ev-curso" className="text-sm font-medium text-foreground">Módulo</label>
        <select
          id="ev-curso"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>{c.titulo}</option>
          ))}
        </select>
      </div>
      <Input
        id="ev-titulo"
        label="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Ej. Evaluación módulo 3: Protección de datos"
        required
      />
      <Input
        id="ev-tiempo"
        label="Tiempo límite (minutos, 0 = sin límite)"
        type="number"
        min={0}
        value={tiempoLimite}
        onChange={(e) => setTiempoLimite(Number(e.target.value))}
      />
      <p className="text-xs text-muted-foreground -mt-2">
        Después de crearla podrás agregarle preguntas desde su página de detalle.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-start">
        Crear evaluación
      </Button>
    </form>
  );
}
