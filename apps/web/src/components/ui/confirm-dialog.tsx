"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

/**
 * Diálogo de confirmación accesible (reemplaza a window.confirm):
 * - role="alertdialog", foco inicial en "Cancelar" (la opción segura);
 * - Escape o clic fuera cancelan; Tab se mantiene dentro del diálogo;
 * - muestra el error real si la operación falla, sin cerrarse.
 */
export function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = "Eliminar",
  peligroso = true,
  cargando = false,
  error,
  onConfirmar,
  onCancelar,
}: {
  abierto: boolean;
  titulo: string;
  mensaje: React.ReactNode;
  textoConfirmar?: string;
  peligroso?: boolean;
  cargando?: boolean;
  error?: string | null;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const cancelarRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const previo = document.activeElement as HTMLElement | null;
    cancelarRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !cargando) onCancelar();
      if (e.key === "Tab" && panelRef.current) {
        const focos = panelRef.current.querySelectorAll<HTMLElement>("button:not([disabled])");
        if (focos.length === 0) return;
        const primero = focos[0];
        const ultimo = focos[focos.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previo?.focus?.();
    };
  }, [abierto, cargando, onCancelar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !cargando) onCancelar();
      }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-titulo"
        aria-describedby="confirm-mensaje"
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-card-lg"
      >
        <div className="flex items-start gap-3">
          {peligroso && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="w-5 h-5" aria-hidden />
            </span>
          )}
          <div className="min-w-0">
            <h2 id="confirm-titulo" className="font-semibold text-foreground">
              {titulo}
            </h2>
            <div id="confirm-mensaje" className="mt-1 text-sm text-muted-foreground break-words">
              {mensaje}
            </div>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 break-words">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button ref={cancelarRef} variant="outline" onClick={onCancelar} disabled={cargando}>
            Cancelar
          </Button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={cargando}
            className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 ${
              peligroso ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary-hover"
            }`}
          >
            {cargando ? "Procesando…" : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
