"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RecursoBase {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  url: string;
  fuente: string;
  publicado: boolean;
}

/** Formulario genérico para recursos con la misma forma (video, infografía):
 * título, descripción, categoría, URL real, fuente y estado de publicación.
 * Se reutiliza en vez de duplicar el mismo formulario dos veces. */
export function MediaResourceForm({
  recurso,
  apiBasePath,
  redirectPath,
  urlLabel,
  urlPlaceholder,
  fuenteLabel,
  crearLabel,
}: {
  recurso?: RecursoBase;
  apiBasePath: string; // ej. "/api/admin/videos"
  redirectPath: string; // ej. "/admin/videos"
  urlLabel: string;
  urlPlaceholder: string;
  fuenteLabel: string;
  crearLabel: string;
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(recurso?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(recurso?.descripcion ?? "");
  const [categoria, setCategoria] = useState(recurso?.categoria ?? "");
  const [url, setUrl] = useState(recurso?.url ?? "");
  const [fuente, setFuente] = useState(recurso?.fuente ?? "");
  const [publicado, setPublicado] = useState(recurso?.publicado ?? true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const endpoint = recurso ? `${apiBasePath}/${recurso.id}` : apiBasePath;
      const method = recurso ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descripcion, categoria, url, fuente, publicado }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el recurso.");
      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el recurso.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <Input label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          required
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <Input
        label="Categoría"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        placeholder="Ciberseguridad, Protección de datos, Firma electrónica..."
        required
      />
      <Input label={urlLabel} value={url} onChange={(e) => setUrl(e.target.value)} placeholder={urlPlaceholder} required />
      <Input label={fuenteLabel} value={fuente} onChange={(e) => setFuente(e.target.value)} required />
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={publicado} onChange={(e) => setPublicado(e.target.checked)} />
        Publicado (visible en la sección pública)
      </label>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-start">
        {recurso ? "Guardar cambios" : crearLabel}
      </Button>
    </form>
  );
}
