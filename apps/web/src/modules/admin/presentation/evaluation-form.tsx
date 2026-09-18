"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EvaluationForm() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
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
        body: JSON.stringify({ titulo, tiempoLimite: Number(tiempoLimite) }),
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <Input
        label="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Ej. Evaluación módulo 3: Protección de datos"
        required
      />
      <Input
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
