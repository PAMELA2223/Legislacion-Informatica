"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ETIQUETAS_CATEGORIA, type CategoriaDocumento } from "@/modules/library/domain/library.entity";

const CATEGORIAS = Object.keys(ETIQUETAS_CATEGORIA) as CategoriaDocumento[];

export function LibraryDocumentForm() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState<CategoriaDocumento>("NORMATIVA");
  const [tags, setTags] = useState("");
  const [contenido, setContenido] = useState("");
  const [archivoUrl, setArchivoUrl] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/admin/biblioteca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          categoria,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          contenido,
          archivoUrl: archivoUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear el documento.");
      router.push("/admin/biblioteca");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el documento.");
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
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-start">
        Crear documento
      </Button>
    </form>
  );
}
