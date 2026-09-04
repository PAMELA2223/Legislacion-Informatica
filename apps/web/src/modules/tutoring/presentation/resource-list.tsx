"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TutoringResource } from "../domain/tutoring.entity";

export function ResourceList({
  assignmentId,
  recursos,
  puedeCrear,
}: {
  assignmentId: string;
  recursos: TutoringResource[];
  puedeCrear: boolean;
}) {
  const router = useRouter();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [url, setUrl] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function compartirRecurso(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch(`/api/tutoria/${assignmentId}/recursos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, url, descripcion: descripcion || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al compartir el recurso.");
      setTitulo("");
      setUrl("");
      setDescripcion("");
      setMostrarForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al compartir el recurso.");
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
              Compartir recurso
            </Button>
          ) : (
            <form onSubmit={compartirRecurso} className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3">
              <Input label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
              <Input label="URL" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." required />
              <Input label="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" isLoading={enviando}>Compartir</Button>
                <Button type="button" variant="ghost" onClick={() => setMostrarForm(false)}>Cancelar</Button>
              </div>
            </form>
          )}
        </div>
      )}

      {recursos.map((r) => (
        <a
          key={r.id}
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-3">
            <Link2 className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{r.titulo}</p>
              {r.descripcion && <p className="text-xs text-muted-foreground">{r.descripcion}</p>}
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
        </a>
      ))}
      {recursos.length === 0 && <p className="text-sm text-muted-foreground">No hay recursos compartidos todavía.</p>}
    </div>
  );
}
