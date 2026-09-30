"use client";

import { useSyncExternalStore } from "react";
import { CheckCircle2, X } from "lucide-react";
import { cerrarAviso, obtenerAvisos, obtenerAvisosServidor, suscribirAvisos } from "@/lib/avisos";

/** Muestra los avisos globales; se monta una vez en el layout. */
export function Avisos() {
  const avisos = useSyncExternalStore(suscribirAvisos, obtenerAvisos, obtenerAvisosServidor);
  if (avisos.length === 0) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] flex w-[min(32rem,calc(100vw-2rem))] flex-col gap-2">
      {avisos.map((a) => (
        <div key={a.id} role="status" className="flex items-start gap-2 rounded-xl bg-navy px-4 py-3 text-sm text-white shadow-card-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-success" aria-hidden />
          <span className="flex-1">{a.texto}</span>
          <button type="button" onClick={() => cerrarAviso(a.id)} aria-label="Cerrar aviso" className="shrink-0 rounded p-0.5 hover:bg-white/10">
            <X className="w-4 h-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
