"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AdminInternationalReferenceRow } from "../domain/admin.entity";

export function InternationalReferenceForm({ referencia }: { referencia?: AdminInternationalReferenceRow }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(referencia?.titulo ?? "");
  const [organismo, setOrganismo] = useState(referencia?.organismo ?? "");
  const [tema, setTema] = useState(referencia?.tema ?? "");
  const [categoria, setCategoria] = useState(referencia?.categoria ?? "");
  const [resumen, setResumen] = useState(referencia?.resumen ?? "");
  const [urlOficial, setUrlOficial] = useState(referencia?.urlOficial ?? "");
  const [publicado, setPublicado] = useState(referencia?.publicado ?? true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const url = referencia
        ? `/api/admin/referencias-internacionales/${referencia.id}`
        : "/api/admin/referencias-internacionales";
      const method = referencia ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, organismo, tema, categoria, resumen, urlOficial, publicado }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar la referencia.");
      router.push("/admin/referencias-internacionales");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la referencia.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <Input label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Organismo emisor" value={organismo} onChange={(e) => setOrganismo(e.target.value)} placeholder="Consejo de Europa, UNCITRAL..." required />
        <Input label="Tema" value={tema} onChange={(e) => setTema(e.target.value)} required />
      </div>
      <Input
        label="Categoría"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        placeholder="Protección de datos, Ciberseguridad, Comercio electrónico..."
        required
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Resumen</label>
        <textarea
          value={resumen}
          onChange={(e) => setResumen(e.target.value)}
          rows={4}
          required
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <Input
        label="URL oficial del organismo"
        value={urlOficial}
        onChange={(e) => setUrlOficial(e.target.value)}
        placeholder="https://..."
        required
      />
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={publicado} onChange={(e) => setPublicado(e.target.checked)} />
        Publicada (visible en la sección pública)
      </label>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-start">
        {referencia ? "Guardar cambios" : "Crear referencia"}
      </Button>
    </form>
  );
}
