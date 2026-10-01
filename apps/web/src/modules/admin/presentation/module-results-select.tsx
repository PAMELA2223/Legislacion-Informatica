"use client";

import { useRouter } from "next/navigation";

/** Selector de módulo para pantallas pequeñas (en escritorio se usa la lista lateral). */
export function ModuleResultsSelect({
  modulos,
  seleccionado,
  rutaBase,
}: {
  rutaBase: string;
  modulos: { id: string; etiqueta: string; deshabilitado: boolean }[];
  seleccionado: string | null;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="selector-modulo" className="text-sm font-medium text-foreground">Módulo</label>
      <select
        id="selector-modulo"
        value={seleccionado ?? ""}
        onChange={(e) => router.push(`${rutaBase}?modulo=${e.target.value}`)}
        className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
      >
        {modulos.map((m) => (
          <option key={m.id} value={m.id} disabled={m.deshabilitado}>{m.etiqueta}</option>
        ))}
      </select>
    </div>
  );
}
