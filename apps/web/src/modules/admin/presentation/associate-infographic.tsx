"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Copia una infografía de la sección antigua (sin módulo) al módulo elegido. */
export function AssociateInfographic({ id, modulos }: { id: string; modulos: { id: string; numero: number; titulo: string }[] }) {
  const router = useRouter();
  const [courseId, setCourseId] = useState(modulos[0]?.id ?? "");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function asociar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/infografias/${id}/asociar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo asociar.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo asociar.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`asoc-${id}`} className="sr-only">Módulo destino</label>
        <select
          id={`asoc-${id}`}
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="max-w-full rounded-lg border border-border-strong bg-surface px-2 py-1.5 text-sm"
        >
          {modulos.map((m) => (
            <option key={m.id} value={m.id}>Módulo {m.numero}: {m.titulo}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={asociar}
          disabled={cargando || !courseId}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {cargando ? "Asociando…" : "Asociar al módulo"}
        </button>
      </div>
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
