"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AdminCourseDetailRow } from "../domain/admin.entity";

const CLASE_CAMPO =
  "rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function AreaTexto({
  id,
  label,
  value,
  onChange,
  rows = 3,
  required,
  ayuda,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  required?: boolean;
  ayuda?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
      <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={rows} required={required} className={CLASE_CAMPO} />
      {ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>}
    </div>
  );
}

/** Crear o editar la información general de un módulo. Las lecciones
 * (contenido y recursos: videos, infografías, PDF...) se gestionan desde la
 * página de detalle del módulo. */
export function CourseForm({ curso }: { curso?: AdminCourseDetailRow }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(curso?.titulo ?? "");
  const [slug, setSlug] = useState(curso?.slug ?? "");
  const [descripcion, setDescripcion] = useState(curso?.descripcion ?? "");
  const [resumen, setResumen] = useState(curso?.resumen ?? "");
  const [propositoAcademico, setProposito] = useState(curso?.propositoAcademico ?? "");
  const [bibliografia, setBibliografia] = useState(curso?.bibliografia ?? "");
  const [activo, setActivo] = useState(curso?.activo ?? false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch(curso ? `/api/admin/cursos/${curso.id}` : "/api/admin/cursos", {
        method: curso ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          slug: slug || undefined,
          descripcion,
          resumen,
          propositoAcademico,
          bibliografia,
          ...(curso ? { activo } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el módulo.");
      router.push(`/admin/cursos/${curso?.id ?? data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el módulo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
      <Input id="curso-titulo" label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
      <Input
        id="curso-slug"
        label="Identificador en la URL (opcional)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="se genera a partir del título"
      />
      <AreaTexto id="curso-desc" label="Descripción breve" value={descripcion} onChange={setDescripcion} rows={2} required />
      <AreaTexto id="curso-resumen" label="Resumen" value={resumen} onChange={setResumen} rows={4} />
      <AreaTexto id="curso-proposito" label="Propósito académico" value={propositoAcademico} onChange={setProposito} rows={3} />
      <AreaTexto
        id="curso-biblio"
        label="Bibliografía"
        value={bibliografia}
        onChange={setBibliografia}
        rows={3}
        ayuda="Una referencia por línea."
      />
      {curso ? (
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
          Módulo activo (visible para los estudiantes y parte del itinerario obligatorio)
        </label>
      ) : (
        <p className="text-xs text-muted-foreground">
          El módulo se crea <strong>inactivo</strong>. Después agrégale lecciones (contenido, videos,
          infografías…) y su evaluación, y actívalo desde su página.
        </p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-start">
        {curso ? "Guardar cambios" : "Crear módulo"}
      </Button>
    </form>
  );
}
