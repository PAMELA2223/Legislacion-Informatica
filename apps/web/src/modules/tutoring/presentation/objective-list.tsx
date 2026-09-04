"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { TutoringObjective } from "../domain/tutoring.entity";

export function ObjectiveList({
  assignmentId,
  objetivos,
  puedeEditar,
}: {
  assignmentId: string;
  objetivos: TutoringObjective[];
  puedeEditar: boolean;
}) {
  const router = useRouter();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaObjetivo, setFechaObjetivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function crearObjetivo(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch(`/api/tutoria/${assignmentId}/objetivos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descripcion, fechaObjetivo, progreso: 0, estado: "NO_INICIADO" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear el objetivo.");
      setTitulo("");
      setDescripcion("");
      setFechaObjetivo("");
      setMostrarForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el objetivo.");
    } finally {
      setEnviando(false);
    }
  }

  async function actualizarProgreso(objectiveId: string, progreso: number) {
    const estado = progreso >= 100 ? "COMPLETADO" : progreso > 0 ? "EN_PROGRESO" : "NO_INICIADO";
    await fetch(`/api/tutoria/objetivos/${objectiveId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progreso, estado }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {puedeEditar && (
        <div>
          {!mostrarForm ? (
            <Button variant="outline" onClick={() => setMostrarForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo objetivo
            </Button>
          ) : (
            <form onSubmit={crearObjetivo} className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3">
              <Input label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={2}
                  required
                  className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <Input
                label="Fecha objetivo"
                type="date"
                value={fechaObjetivo}
                onChange={(e) => setFechaObjetivo(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" isLoading={enviando}>Crear objetivo</Button>
                <Button type="button" variant="ghost" onClick={() => setMostrarForm(false)}>Cancelar</Button>
              </div>
            </form>
          )}
        </div>
      )}

      {objetivos.map((o) => (
        <div key={o.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium text-foreground">{o.titulo}</p>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{o.descripcion}</p>
          <ProgressBar value={o.progreso} />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              Meta: {new Date(o.fechaObjetivo).toLocaleDateString("es-EC")}
            </span>
            {puedeEditar ? (
              <input
                type="number"
                min={0}
                max={100}
                defaultValue={o.progreso}
                onBlur={(e) => actualizarProgreso(o.id, Number(e.target.value))}
                className="w-16 text-xs rounded-lg border border-border-strong bg-surface px-2 py-1 text-right outline-none focus:border-primary"
              />
            ) : (
              <span className="text-xs font-medium text-foreground">{o.progreso}%</span>
            )}
          </div>
        </div>
      ))}
      {objetivos.length === 0 && <p className="text-sm text-muted-foreground">No hay objetivos todavía.</p>}
    </div>
  );
}
