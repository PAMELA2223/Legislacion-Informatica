"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Link2, ImageOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AdminModuleInfographicRow } from "../domain/admin.entity";

const CLASE_CAMPO =
  "rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

/** Agregar o editar la infografía de un módulo (subir/reemplazar imagen o pegar enlace). */
export function InfographicForm({
  modulos,
  infografia,
  moduloInicial,
}: {
  modulos: { id: string; numero: number; titulo: string }[];
  infografia?: AdminModuleInfographicRow;
  moduloInicial?: string;
}) {
  const router = useRouter();
  const archivoRef = useRef<HTMLInputElement>(null);
  const [courseId, setCourseId] = useState(infografia?.courseId ?? moduloInicial ?? modulos[0]?.id ?? "");
  const [titulo, setTitulo] = useState(infografia?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(infografia?.descripcion ?? "");
  const [urlImagen, setUrlImagen] = useState(infografia?.urlImagen ?? "");
  const [modoEnlace, setModoEnlace] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  async function subir(file: File) {
    setError(null);
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append("archivo", file);
      const res = await fetch("/api/admin/infografias/subir", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo subir la imagen.");
      setUrlImagen(data.url);
      setPreviewError(false);
      if (!titulo) setTitulo(`Infografía: ${modulos.find((m) => m.id === courseId)?.titulo ?? ""}`.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setSubiendo(false);
      if (archivoRef.current) archivoRef.current.value = "";
    }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const res = await fetch(infografia ? `/api/admin/infografias/modulos/${infografia.id}` : "/api/admin/infografias/modulos", {
        method: infografia ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, titulo, descripcion, urlImagen }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo guardar.");
      router.push("/admin/infografias");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="inf-modulo" className="text-sm font-medium text-foreground">Módulo</label>
          <select id="inf-modulo" value={courseId} onChange={(e) => setCourseId(e.target.value)} className={CLASE_CAMPO} required>
            {modulos.map((m) => (
              <option key={m.id} value={m.id}>Módulo {m.numero}: {m.titulo}</option>
            ))}
          </select>
        </div>
        <Input id="inf-titulo" label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Infografía: Protección de datos personales" required />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="inf-desc" className="text-sm font-medium text-foreground">Descripción o pie de imagen (opcional)</label>
          <textarea id="inf-desc" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} className={CLASE_CAMPO} />
          <p className="text-xs text-muted-foreground">Se muestra debajo de la imagen y ayuda a quienes usan lectores de pantalla.</p>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground mb-1">Imagen</legend>
          <div className="flex flex-wrap gap-2">
            <input
              ref={archivoRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              id="inf-archivo"
              onChange={(e) => e.target.files?.[0] && subir(e.target.files[0])}
            />
            <Button type="button" onClick={() => archivoRef.current?.click()} isLoading={subiendo}>
              <Upload className="w-4 h-4 mr-2" aria-hidden /> {urlImagen ? "Reemplazar imagen" : "Subir imagen"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setModoEnlace((v) => !v)}>
              <Link2 className="w-4 h-4 mr-2" aria-hidden /> Usar un enlace
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">PNG, JPG o WebP de hasta 4 MB. Para infografías con mucho texto, usa al menos 1200 px de ancho.</p>
          {modoEnlace && (
            <Input
              id="inf-url"
              label="Enlace de la imagen"
              value={urlImagen}
              onChange={(e) => {
                setUrlImagen(e.target.value);
                setPreviewError(false);
              }}
              placeholder="https://… o /images/infografias/…"
            />
          )}
        </fieldset>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button type="submit" isLoading={guardando} disabled={subiendo || !urlImagen} className="self-start">
          {infografia ? "Guardar cambios" : "Agregar infografía al módulo"}
        </Button>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-1.5">Vista previa</p>
        <div className="rounded-2xl border border-border bg-background-secondary p-3 min-h-48 flex items-center justify-center">
          {urlImagen && !previewError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={urlImagen} alt="Vista previa de la infografía" className="max-h-[60vh] w-full object-contain" onError={() => setPreviewError(true)} />
          ) : (
            <p className="flex flex-col items-center gap-2 text-sm text-muted-foreground text-center">
              <ImageOff className="w-6 h-6" aria-hidden />
              {previewError ? "No se pudo cargar la imagen desde ese enlace." : "Todavía no hay imagen."}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
