"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ETIQUETAS_CATEGORIA, ETIQUETAS_ESTADO_NORMA, type CategoriaDocumento, type EstadoNorma } from "@/modules/library/domain/library.entity";
import type { AdminLibraryRow } from "../domain/admin.entity";

const CATEGORIAS = Object.keys(ETIQUETAS_CATEGORIA) as CategoriaDocumento[];
const ESTADOS = Object.keys(ETIQUETAS_ESTADO_NORMA) as EstadoNorma[];

export function LibraryDocumentForm({ documento }: { documento?: AdminLibraryRow }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(documento?.titulo ?? "");
  const [categoria, setCategoria] = useState<CategoriaDocumento>(
    (documento?.categoria as CategoriaDocumento) ?? "NORMATIVA"
  );
  const [tags, setTags] = useState(documento?.tags.join(", ") ?? "");
  const [contenido, setContenido] = useState(documento?.contenido ?? "");
  const [archivoUrl, setArchivoUrl] = useState(documento?.archivoUrl ?? "");

  // Ficha de fuente oficial de la norma
  const [numeroIdentificacion, setNumeroIdentificacion] = useState(documento?.numeroIdentificacion ?? "");
  const [pais, setPais] = useState(documento?.pais ?? "");
  const [institucionEmisora, setInstitucionEmisora] = useState(documento?.institucionEmisora ?? "");
  const [fechaEmision, setFechaEmision] = useState(documento?.fechaEmision?.slice(0, 10) ?? "");
  const [fechaReforma, setFechaReforma] = useState(documento?.fechaReforma?.slice(0, 10) ?? "");
  const [estado, setEstado] = useState<EstadoNorma>((documento?.estado as EstadoNorma) ?? "VIGENTE");
  const [fuenteOficial, setFuenteOficial] = useState(documento?.fuenteOficial ?? "");
  const [enlaceOficial, setEnlaceOficial] = useState(documento?.enlaceOficial ?? "");

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const url = documento ? `/api/admin/biblioteca/${documento.id}` : "/api/admin/biblioteca";
      const method = documento ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          categoria,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          contenido,
          archivoUrl: archivoUrl || undefined,
          numeroIdentificacion: numeroIdentificacion || undefined,
          pais: pais || undefined,
          institucionEmisora: institucionEmisora || undefined,
          fechaEmision: fechaEmision || undefined,
          fechaReforma: fechaReforma || undefined,
          estado,
          fuenteOficial: fuenteOficial || undefined,
          enlaceOficial: enlaceOficial || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el documento.");
      router.push("/admin/biblioteca");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el documento.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <Input label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Categoría</label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as CategoriaDocumento)}
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat}>
              {ETIQUETAS_CATEGORIA[cat]}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Tags (separados por coma)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="privacidad, datos personales"
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          Contenido indexable (usado por el buscador)
        </label>
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={4}
          required
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <Input
        label="URL del archivo PDF (Supabase Storage, opcional)"
        value={archivoUrl}
        onChange={(e) => setArchivoUrl(e.target.value)}
        placeholder="https://..."
      />

      <hr className="border-border my-2" />
      <p className="text-sm font-medium text-foreground -mb-2">Ficha de fuente oficial</p>
      <p className="text-xs text-muted-foreground -mt-1">
        Completa solo lo que puedas verificar. Si no cuentas con un enlace
        oficial confirmado, déjalo vacío — la plataforma indicará que el
        registro requiere revisión administrativa en vez de mostrar un dato
        inventado.
      </p>

      <Input
        label="Número o identificación (ej. Registro Oficial 459)"
        value={numeroIdentificacion}
        onChange={(e) => setNumeroIdentificacion(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="País" value={pais} onChange={(e) => setPais(e.target.value)} placeholder="Ecuador" />
        <Input
          label="Institución emisora"
          value={institucionEmisora}
          onChange={(e) => setInstitucionEmisora(e.target.value)}
          placeholder="Asamblea Nacional"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Fecha de emisión"
          type="date"
          value={fechaEmision}
          onChange={(e) => setFechaEmision(e.target.value)}
        />
        <Input
          label="Fecha de reforma (si aplica)"
          type="date"
          value={fechaReforma}
          onChange={(e) => setFechaReforma(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Estado de la norma</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoNorma)}
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          {ESTADOS.map((est) => (
            <option key={est} value={est}>
              {ETIQUETAS_ESTADO_NORMA[est]}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Nombre de la fuente oficial"
        value={fuenteOficial}
        onChange={(e) => setFuenteOficial(e.target.value)}
        placeholder="Registro Oficial del Ecuador"
      />
      <Input
        label="Enlace oficial verificado"
        value={enlaceOficial}
        onChange={(e) => setEnlaceOficial(e.target.value)}
        placeholder="https://www.registroficial.gob.ec/..."
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-start">
        {documento ? "Guardar cambios" : "Crear documento"}
      </Button>
    </form>
  );
}
