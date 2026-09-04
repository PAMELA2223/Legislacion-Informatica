"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AdminNewsRow } from "../domain/admin.entity";

export function NewsForm({ noticia }: { noticia?: AdminNewsRow }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(noticia?.titulo ?? "");
  const [resumen, setResumen] = useState(noticia?.resumen ?? "");
  const [contenido, setContenido] = useState(noticia?.contenido ?? "");
  const [fuente, setFuente] = useState(noticia?.fuente ?? "");
  const [fechaPublicacion, setFechaPublicacion] = useState(
    noticia?.fechaPublicacion?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const url = noticia ? `/api/admin/noticias/${noticia.id}` : "/api/admin/noticias";
      const method = noticia ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, resumen, contenido, fuente, fechaPublicacion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar la noticia.");
      router.push("/admin/noticias");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la noticia.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <Input label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
      <Input label="Resumen" value={resumen} onChange={(e) => setResumen(e.target.value)} required />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Contenido</label>
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={6}
          required
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <Input label="Fuente" value={fuente} onChange={(e) => setFuente(e.target.value)} required />
      <Input
        label="Fecha de publicación"
        type="date"
        value={fechaPublicacion}
        onChange={(e) => setFechaPublicacion(e.target.value)}
        required
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-start">
        {noticia ? "Guardar cambios" : "Publicar noticia"}
      </Button>
    </form>
  );
}
