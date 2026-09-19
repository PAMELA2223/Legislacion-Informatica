"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AdminLessonRow, TipoLeccion } from "../domain/admin.entity";

const TIPOS: { value: TipoLeccion; label: string }[] = [
  { value: "VIDEO", label: "Video" },
  { value: "PDF", label: "PDF" },
  { value: "INFOGRAFIA", label: "Infografía" },
  { value: "PODCAST", label: "Podcast (audio)" },
  { value: "TEXTO", label: "Texto" },
  { value: "LINEA_TIEMPO", label: "Línea de tiempo" },
  { value: "MAPA_CONCEPTUAL", label: "Mapa conceptual" },
  { value: "PRESENTACION", label: "Presentación" },
];

const TIPOS_CON_URL = new Set<TipoLeccion>([
  "VIDEO",
  "PDF",
  "INFOGRAFIA",
  "PODCAST",
  "LINEA_TIEMPO",
  "MAPA_CONCEPTUAL",
  "PRESENTACION",
]);

const AYUDA_POR_TIPO: Partial<Record<TipoLeccion, string>> = {
  VIDEO: "Pega un enlace normal de YouTube (watch?v=... o youtu.be/...) — se muestra embebido automáticamente.",
  PDF: "Pega el enlace directo a un PDF (debe empezar con http:// o https://).",
  INFOGRAFIA: "Pega el enlace directo a una imagen (.png, .jpg) o una ruta interna como /images/....",
  PODCAST: "Pega el enlace directo a un archivo de audio (.mp3). Los enlaces de Spotify/Apple Podcasts no funcionan aquí todavía.",
};

export function LessonForm({
  courseId,
  leccion,
}: {
  courseId: string;
  leccion?: AdminLessonRow;
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(leccion?.titulo ?? "");
  const [tipo, setTipo] = useState<TipoLeccion>((leccion?.tipo as TipoLeccion) ?? "VIDEO");
  const [urlRecurso, setUrlRecurso] = useState(leccion?.urlRecurso ?? "");
  const [contenido, setContenido] = useState(leccion?.contenido ?? "");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const necesitaUrl = TIPOS_CON_URL.has(tipo);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const url = leccion
        ? `/api/admin/lecciones/${leccion.id}`
        : `/api/admin/cursos/${courseId}/lecciones`;
      const method = leccion ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          tipo,
          urlRecurso: necesitaUrl ? urlRecurso : null,
          contenido: tipo === "TEXTO" ? contenido : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar la lección.");
      router.push(`/admin/cursos/${courseId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la lección.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <Input label="Título de la lección" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Tipo</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoLeccion)}
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {necesitaUrl && (
        <div className="flex flex-col gap-1.5">
          <Input
            label="Enlace del recurso"
            value={urlRecurso}
            onChange={(e) => setUrlRecurso(e.target.value)}
            placeholder="https://..."
          />
          {AYUDA_POR_TIPO[tipo] && (
            <p className="text-xs text-muted-foreground">{AYUDA_POR_TIPO[tipo]}</p>
          )}
        </div>
      )}

      {tipo === "TEXTO" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Contenido</label>
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            rows={8}
            className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-start">
        {leccion ? "Guardar cambios" : "Agregar lección"}
      </Button>
    </form>
  );
}
