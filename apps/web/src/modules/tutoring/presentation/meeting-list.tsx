"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TutoringMeeting } from "../domain/tutoring.entity";

const ETIQUETAS_ESTADO: Record<string, string> = {
  PROGRAMADA: "text-primary bg-primary/10",
  REALIZADA: "text-success bg-success/10",
  CANCELADA: "text-red-600 bg-red-50",
  REPROGRAMADA: "text-accent bg-accent/10",
};

export function MeetingList({
  assignmentId,
  reuniones,
  puedeCrear,
}: {
  assignmentId: string;
  reuniones: TutoringMeeting[];
  puedeCrear: boolean;
}) {
  const router = useRouter();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [duracionMin, setDuracionMin] = useState(30);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function crearReunion(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch(`/api/tutoria/${assignmentId}/reuniones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descripcion, fecha, duracionMin: Number(duracionMin), estado: "PROGRAMADA" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al programar la reunión.");
      setTitulo("");
      setDescripcion("");
      setFecha("");
      setMostrarForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al programar la reunión.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {puedeCrear && (
        <div>
          {!mostrarForm ? (
            <Button variant="outline" onClick={() => setMostrarForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Programar tutoría
            </Button>
          ) : (
            <form onSubmit={crearReunion} className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3">
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
                  label="Fecha y hora"
                  type="datetime-local"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
                <Input
                  label="Duración (min)"
                  type="number"
                  value={duracionMin}
                  onChange={(e) => setDuracionMin(Number(e.target.value))}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" isLoading={enviando}>Programar</Button>
                <Button type="button" variant="ghost" onClick={() => setMostrarForm(false)}>Cancelar</Button>
              </div>
            </form>
          )}
        </div>
      )}

      {reuniones.map((r) => (
        <div key={r.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-foreground">{r.titulo}</p>
            <span className={`text-xs rounded-full px-2.5 py-1 ${ETIQUETAS_ESTADO[r.estado]}`}>{r.estado}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{r.descripcion}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="w-3.5 h-3.5" />
            {new Date(r.fecha).toLocaleString("es-EC")} · {r.duracionMin} min
          </div>
          {r.acuerdos && <p className="text-xs text-foreground mt-2">Acuerdos: {r.acuerdos}</p>}
        </div>
      ))}
      {reuniones.length === 0 && <p className="text-sm text-muted-foreground">No hay reuniones programadas.</p>}
    </div>
  );
}
