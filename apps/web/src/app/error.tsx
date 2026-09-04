"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

/**
 * Error boundary de segmento (App Router). Captura errores de renderizado
 * en cualquier página que no tenga su propio error.tsx. No sustituye el
 * manejo de errores de autenticación/formularios, que sigue viviendo en
 * cada módulo (setError, try/catch de los use cases).
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Punto único para enviar el error a un servicio de monitoreo
    // (Sentry, LogRocket, etc.) cuando se configure en el futuro.
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <main
      id="contenido-principal"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
        <AlertTriangle className="h-8 w-8" strokeWidth={2} aria-hidden="true" />
      </span>
      <h1 className="text-3xl font-bold text-foreground">Algo salió mal</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Ocurrió un error inesperado al cargar esta página. Puedes intentarlo de
        nuevo o volver al inicio.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-hover"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Intentar de nuevo
        </button>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-background-secondary"
        >
          <Home className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Volver al inicio
        </a>
      </div>
    </main>
  );
}
