"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ETIQUETAS_CATEGORIA_FORO, type CategoriaForo } from "../domain/forum.entity";

const CATEGORIAS = Object.keys(ETIQUETAS_CATEGORIA_FORO) as CategoriaForo[];

export function NewThreadForm() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState<CategoriaForo>("GENERAL");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/foro/hilos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, categoria }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear el hilo.");
      router.push(`/foro/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el hilo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      <Input
        label="Título"
        placeholder="¿De qué quieres hablar?"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Categoría</label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as CategoriaForo)}
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat}>
              {ETIQUETAS_CATEGORIA_FORO[cat]}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando}>
        Crear hilo
      </Button>
    </form>
  );
}
