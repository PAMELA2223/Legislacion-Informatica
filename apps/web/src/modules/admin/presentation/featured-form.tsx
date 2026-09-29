"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ETIQUETAS_TIPO_DESTACADO, TIPOS_DESTACADO, type FeaturedItem, type TipoDestacado } from "@/modules/featured/domain/featured.entity";

const CLASE_CAMPO =
  "rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function FeaturedForm({
  item,
  cursos,
}: {
  item?: FeaturedItem;
  cursos: { id: string; titulo: string; slug: string }[];
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(item?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(item?.descripcion ?? "");
  const [tipo, setTipo] = useState<TipoDestacado>(item?.tipo ?? "RECURSO");
  const [url, setUrl] = useState(item?.url ?? "");
  const [imagenUrl, setImagenUrl] = useState(item?.imagenUrl ?? "");
  const [fuente, setFuente] = useState(item?.fuente ?? "");
  const [courseId, setCourseId] = useState(item?.courseId ?? "");
  const [orden, setOrden] = useState(item?.orden ?? 0);
  const [activo, setActivo] = useState(item?.activo ?? true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function elegirCurso(id: string) {
    setCourseId(id);
    // Atajo: si es un destacado de tipo Módulo, el enlace apunta al módulo.
    const c = cursos.find((x) => x.id === id);
    if (c && tipo === "MODULO") setUrl(`/modulos/${c.slug}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch(item ? `/api/admin/destacados/${item.id}` : "/api/admin/destacados", {
        method: item ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descripcion, tipo, url, imagenUrl, fuente, courseId: courseId || null, orden, activo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar.");
      router.push("/admin/destacados");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <Input label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="dest-desc" className="text-sm font-medium text-foreground">Descripción</label>
        <textarea id="dest-desc" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} required className={CLASE_CAMPO} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="dest-tipo" className="text-sm font-medium text-foreground">Tipo de contenido</label>
        <select id="dest-tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoDestacado)} className={CLASE_CAMPO}>
          {TIPOS_DESTACADO.map((t) => (
            <option key={t} value={t}>{ETIQUETAS_TIPO_DESTACADO[t]}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="dest-curso" className="text-sm font-medium text-foreground">Módulo relacionado (opcional)</label>
        <select id="dest-curso" value={courseId} onChange={(e) => elegirCurso(e.target.value)} className={CLASE_CAMPO}>
          <option value="">— Ninguno —</option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>{c.titulo}</option>
          ))}
        </select>
      </div>
      <Input label="Enlace" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://... o /modulos/..." required />
      <Input label="Imagen de portada (opcional)" value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} placeholder="https://... o /images/..." />
      <Input label="Fuente (opcional)" value={fuente} onChange={(e) => setFuente(e.target.value)} placeholder="Institución u organización" />
      <Input label="Orden (menor aparece primero)" type="number" value={orden} onChange={(e) => setOrden(Number(e.target.value))} />
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
        Activo (visible en &quot;Lo más destacado&quot;)
      </label>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-start">
        {item ? "Guardar cambios" : "Agregar destacado"}
      </Button>
    </form>
  );
}
