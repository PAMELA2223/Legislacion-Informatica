"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ETIQUETAS_TIPO_OBSERVACION, type TutoringObservation, type TipoObservacion } from "../domain/tutoring.entity";

const TIPOS = Object.keys(ETIQUETAS_TIPO_OBSERVACION) as TipoObservacion[];

export function ObservationList({
  assignmentId,
  observaciones,
}: {
  assignmentId: string;
  observaciones: TutoringObservation[];
}) {
  const router = useRouter();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipo, setTipo] = useState<TipoObservacion>("SEGUIMIENTO");
  const [contenido, setContenido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function crearObservacion(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch(`/api/tutoria/${assignmentId}/observaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, contenido }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar la observación.");
      setContenido("");
      setMostrarForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la observación.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-background-secondary p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3.5 h-3.5" />
        Estas notas son privadas: el estudiante nunca las ve.
      </div>

      {!mostrarForm ? (
        <Button variant="outline" onClick={() => setMostrarForm(true)} className="self-start">
          <Plus className="w-4 h-4 mr-2" />
          Nueva observación
        </Button>
      ) : (
        <form onSubmit={crearObservacion} className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoObservacion)}
              className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>{ETIQUETAS_TIPO_OBSERVACION[t]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Contenido</label>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={3}
              required
              className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" isLoading={enviando}>Guardar</Button>
            <Button type="button" variant="ghost" onClick={() => setMostrarForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {observaciones.map((o) => (
        <div key={o.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">
              {ETIQUETAS_TIPO_OBSERVACION[o.tipo]}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(o.createdAt).toLocaleDateString("es-EC")}
            </span>
          </div>
          <p className="text-sm text-foreground whitespace-pre-line">{o.contenido}</p>
        </div>
      ))}
      {observaciones.length === 0 && <p className="text-sm text-muted-foreground">No hay observaciones todavía.</p>}
    </div>
  );
}
