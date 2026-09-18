"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AdminJurisprudenceRow } from "../domain/admin.entity";

export function JurisprudenceForm({ caso }: { caso?: AdminJurisprudenceRow }) {
  const router = useRouter();
  const [nombreCaso, setNombreCaso] = useState(caso?.nombreCaso ?? "");
  const [pais, setPais] = useState(caso?.pais ?? "");
  const [anio, setAnio] = useState(caso?.anio ?? new Date().getFullYear());
  const [tema, setTema] = useState(caso?.tema ?? "");
  const [resumen, setResumen] = useState(caso?.resumen ?? "");
  const [problemaJuridico, setProblemaJuridico] = useState(caso?.problemaJuridico ?? "");
  const [decision, setDecision] = useState(caso?.decision ?? "");
  const [importancia, setImportancia] = useState(caso?.importancia ?? "");
  const [fuenteOficial, setFuenteOficial] = useState(caso?.fuenteOficial ?? "");
  const [enlaceOficial, setEnlaceOficial] = useState(caso?.enlaceOficial ?? "");
  const [verificado, setVerificado] = useState(caso?.verificado ?? false);
  const [publicado, setPublicado] = useState(caso?.publicado ?? true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const url = caso ? `/api/admin/jurisprudencia/${caso.id}` : "/api/admin/jurisprudencia";
      const method = caso ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreCaso,
          pais,
          anio: Number(anio),
          tema,
          resumen,
          problemaJuridico,
          decision,
          importancia,
          fuenteOficial,
          enlaceOficial: enlaceOficial || undefined,
          verificado,
          publicado,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el caso.");
      router.push("/admin/jurisprudencia");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el caso.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <Input label="Nombre del caso" value={nombreCaso} onChange={(e) => setNombreCaso(e.target.value)} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="País / jurisdicción" value={pais} onChange={(e) => setPais(e.target.value)} required />
        <Input
          label="Año"
          type="number"
          value={anio}
          onChange={(e) => setAnio(Number(e.target.value))}
          required
        />
      </div>
      <Input label="Tema" value={tema} onChange={(e) => setTema(e.target.value)} required />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Resumen</label>
        <textarea
          value={resumen}
          onChange={(e) => setResumen(e.target.value)}
          rows={3}
          required
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Problema jurídico</label>
        <textarea
          value={problemaJuridico}
          onChange={(e) => setProblemaJuridico(e.target.value)}
          rows={3}
          required
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Decisión / resolución</label>
        <textarea
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          rows={3}
          required
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Importancia para el derecho informático</label>
        <textarea
          value={importancia}
          onChange={(e) => setImportancia(e.target.value)}
          rows={3}
          required
          className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <hr className="border-border my-2" />
      <p className="text-sm font-medium text-foreground -mb-2">Fuente oficial</p>
      <p className="text-xs text-muted-foreground -mt-1">
        Solo marca &quot;verificado&quot; si el enlace oficial fue confirmado — nunca inventes ni un caso ni una URL.
      </p>
      <Input label="Nombre de la fuente" value={fuenteOficial} onChange={(e) => setFuenteOficial(e.target.value)} required />
      <Input
        label="Enlace oficial (documento completo)"
        value={enlaceOficial}
        onChange={(e) => setEnlaceOficial(e.target.value)}
        placeholder="https://..."
      />
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={verificado} onChange={(e) => setVerificado(e.target.checked)} />
        Fuente verificada (requiere enlace oficial completado)
      </label>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={publicado} onChange={(e) => setPublicado(e.target.checked)} />
        Publicado (visible en la sección pública de jurisprudencia)
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" isLoading={enviando} className="self-start">
        {caso ? "Guardar cambios" : "Crear caso"}
      </Button>
    </form>
  );
}
