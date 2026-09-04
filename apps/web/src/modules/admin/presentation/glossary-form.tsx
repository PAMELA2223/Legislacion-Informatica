"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AdminGlossaryRow } from "../domain/admin.entity";

export function GlossaryForm({ termino: item }: { termino?: AdminGlossaryRow }) {
  const router = useRouter();
  const [termino, setTermino] = useState(item?.termino ?? "");
  const [definicion, setDefinicion] = useState(item?.definicion ?? "");
  const [categoria, setCategoria] = useState(item?.categoria ?? "");
  const [orden, setOrden] = useState(item?.orden ?? 1);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const url = item ? `/api/admin/glosario/${item.id}` : "/api/admin/glosario";
      const method = item ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termino, definicion, categoria, orden: Number(orden) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el término.");
      router.push("/admin/glosario");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el término.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <Input label="Término" value={termino} onChange={(e) => setTermino(e.target.value)} required />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Definición</label>
        <textarea
          value={definicion}
          onChange={(e) => setDefinicion(e.target.value)}
          rows={4}
          required
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <Input label="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)} required />
      <Input
        label="Orden"
        type="number"
        value={orden}
        onChange={(e) => setOrden(Number(e.target.value))}
        required
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-start">
        {item ? "Guardar cambios" : "Crear término"}
      </Button>
    </form>
  );
}
