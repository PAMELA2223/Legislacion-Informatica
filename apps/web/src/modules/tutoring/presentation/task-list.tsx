"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Clock, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TutoringTask } from "../domain/tutoring.entity";

const COLOR_PRIORIDAD: Record<string, string> = {
  BAJA: "text-muted-foreground bg-background-secondary",
  MEDIA: "text-accent bg-accent/10",
  ALTA: "text-red-600 bg-red-50",
};

function estaVencida(tarea: TutoringTask) {
  return tarea.estado !== "COMPLETADA" && new Date(tarea.fechaLimite) < new Date();
}

export function TaskList({
  assignmentId,
  tareas,
  puedeCrear,
  puedeCompletar,
}: {
  assignmentId: string;
  tareas: TutoringTask[];
  puedeCrear: boolean;
  puedeCompletar: boolean;
}) {
  const router = useRouter();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [prioridad, setPrioridad] = useState("MEDIA");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function crearTarea(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch(`/api/tutoria/${assignmentId}/tareas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descripcion, fechaLimite, prioridad, estado: "PENDIENTE" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear la tarea.");
      setTitulo("");
      setDescripcion("");
      setFechaLimite("");
      setMostrarForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la tarea.");
    } finally {
      setEnviando(false);
    }
  }

  async function marcarCompletada(taskId: string, completada: boolean) {
    await fetch(`/api/tutoria/tareas/${taskId}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: completada ? "COMPLETADA" : "PENDIENTE" }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {puedeCrear && (
        <div>
          {!mostrarForm ? (
            <Button variant="outline" onClick={() => setMostrarForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva tarea
            </Button>
          ) : (
            <form onSubmit={crearTarea} className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3">
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
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Fecha límite"
                  type="date"
                  value={fechaLimite}
                  onChange={(e) => setFechaLimite(e.target.value)}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Prioridad</label>
                  <select
                    value={prioridad}
                    onChange={(e) => setPrioridad(e.target.value)}
                    className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                  </select>
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" isLoading={enviando}>Crear tarea</Button>
                <Button type="button" variant="ghost" onClick={() => setMostrarForm(false)}>Cancelar</Button>
              </div>
            </form>
          )}
        </div>
      )}

      {tareas.map((t) => {
        const vencida = estaVencida(t);
        return (
          <div key={t.id} className="rounded-xl border border-border bg-surface p-4 flex items-start gap-3">
            <button
              onClick={() => puedeCompletar && marcarCompletada(t.id, t.estado !== "COMPLETADA")}
              disabled={!puedeCompletar}
              className="mt-0.5 shrink-0"
            >
              {t.estado === "COMPLETADA" ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`text-sm font-medium ${t.estado === "COMPLETADA" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {t.titulo}
                </p>
                <span className={`text-xs rounded-full px-2 py-0.5 ${COLOR_PRIORIDAD[t.prioridad]}`}>
                  {t.prioridad}
                </span>
                {vencida && (
                  <span className="flex items-center gap-1 text-xs text-red-600">
                    <AlertTriangle className="w-3 h-3" /> Vencida
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t.descripcion}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {new Date(t.fechaLimite).toLocaleDateString("es-EC")}
                {t.courseTitulo && <span>· {t.courseTitulo}</span>}
              </div>
            </div>
          </div>
        );
      })}
      {tareas.length === 0 && <p className="text-sm text-muted-foreground">No hay tareas todavía.</p>}
    </div>
  );
}
