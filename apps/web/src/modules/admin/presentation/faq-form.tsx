"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AdminFaqRow } from "../domain/admin.entity";

export function FaqForm({ item }: { item?: AdminFaqRow }) {
  const router = useRouter();
  const [pregunta, setPregunta] = useState(item?.pregunta ?? "");
  const [respuesta, setRespuesta] = useState(item?.respuesta ?? "");
  const [categoria, setCategoria] = useState(item?.categoria ?? "");
  const [orden, setOrden] = useState(item?.orden ?? 1);
  const [publicado, setPublicado] = useState(item?.publicado ?? true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const url = item ? `/api/admin/faq/${item.id}` : "/api/admin/faq";
      const method = item ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta, respuesta, categoria, orden: Number(orden), publicado }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar la pregunta.");
      router.push("/admin/faq");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la pregunta.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <Input label="Pregunta" value={pregunta} onChange={(e) => setPregunta(e.target.value)} required />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Respuesta</label>
        <textarea
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          rows={5}
          required
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <Input
        label="Categoría"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        placeholder="Protección de datos, Ciberseguridad, Firma electrónica..."
        required
      />
      <Input
        label="Orden"
        type="number"
        value={orden}
        onChange={(e) => setOrden(Number(e.target.value))}
        required
      />
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={publicado} onChange={(e) => setPublicado(e.target.checked)} />
        Publicada (visible en la sección pública de preguntas frecuentes)
      </label>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-start">
        {item ? "Guardar cambios" : "Crear pregunta"}
      </Button>
    </form>
  );
}
