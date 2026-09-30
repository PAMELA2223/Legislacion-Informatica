"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X, ZoomIn, ZoomOut, ExternalLink, ImageOff } from "lucide-react";

/**
 * Infografía dentro del módulo.
 * - Se adapta al ancho disponible sin deformarse (proporción original).
 * - "Ampliar" (o clic en la imagen) abre una vista a pantalla completa donde se
 *   puede alternar entre "ajustar a la pantalla" y "tamaño real" (con
 *   desplazamiento), para leer infografías con mucho texto en el celular.
 */
export function InfographicViewer({ url, titulo, descripcion }: { url: string; titulo: string; descripcion?: string | null }) {
  const [ampliada, setAmpliada] = useState(false);
  const [error, setError] = useState(false);
  const [cargada, setCargada] = useState(false);

  if (error) {
    return (
      <div className="rounded-xl bg-background-secondary p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
        <ImageOff className="w-6 h-6" aria-hidden />
        No se pudo cargar la infografía.
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
          Intentar abrirla en otra pestaña <ExternalLink className="w-3.5 h-3.5" aria-hidden />
        </a>
      </div>
    );
  }

  return (
    <figure className="flex flex-col gap-2">
      <div className="relative rounded-xl bg-background-secondary overflow-hidden">
        {!cargada && <div className="absolute inset-0 animate-pulse bg-foreground/5" aria-hidden />}
        <button
          type="button"
          onClick={() => setAmpliada(true)}
          className="block w-full cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          aria-label={`Ampliar la infografía: ${titulo}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={descripcion ? `${titulo}. ${descripcion}` : titulo}
            loading="lazy"
            decoding="async"
            onLoad={() => setCargada(true)}
            onError={() => setError(true)}
            className="mx-auto block h-auto w-full max-h-[75vh] object-contain"
          />
        </button>
        <button
          type="button"
          onClick={() => setAmpliada(true)}
          className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg bg-navy/85 px-3 py-2 text-xs font-medium text-white shadow-card-md backdrop-blur hover:bg-navy"
        >
          <Maximize2 className="w-3.5 h-3.5" aria-hidden /> Ampliar
        </button>
      </div>
      {descripcion && <figcaption className="text-sm text-muted-foreground">{descripcion}</figcaption>}
      {ampliada && <VistaAmpliada url={url} titulo={titulo} onCerrar={() => setAmpliada(false)} />}
    </figure>
  );
}

function VistaAmpliada({ url, titulo, onCerrar }: { url: string; titulo: string; onCerrar: () => void }) {
  const [tamanoReal, setTamanoReal] = useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const cerrar = useCallback(() => onCerrar(), [onCerrar]);

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // evita que la página se desplace detrás
    cerrarRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "+" || e.key === "=") setTamanoReal(true);
      if (e.key === "-") setTamanoReal(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
      previo?.focus?.();
    };
  }, [cerrar]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`Infografía ampliada: ${titulo}`} className="fixed inset-0 z-[80] flex flex-col bg-neutral-950">
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-white" style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}>
        <p className="min-w-0 truncate text-sm font-medium">{titulo}</p>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setTamanoReal((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm hover:bg-white/10"
            aria-pressed={tamanoReal}
          >
            {tamanoReal ? <ZoomOut className="w-4 h-4" aria-hidden /> : <ZoomIn className="w-4 h-4" aria-hidden />}
            <span className="hidden sm:inline">{tamanoReal ? "Ajustar a la pantalla" : "Tamaño real"}</span>
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label="Abrir la imagen en otra pestaña"
            title="Abrir en otra pestaña"
          >
            <ExternalLink className="w-4 h-4" aria-hidden />
          </a>
          <button ref={cerrarRef} type="button" onClick={cerrar} className="rounded-lg p-2 hover:bg-white/10" aria-label="Cerrar vista ampliada">
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Zona de la imagen: en "tamaño real" se desplaza en ambas direcciones
          (solo dentro de esta vista ampliada, nunca en la página). */}
      <div
        className={`flex-1 overscroll-contain ${tamanoReal ? "overflow-auto" : "overflow-hidden flex items-center justify-center p-2 sm:p-6"}`}
        onClick={(e) => {
          if (!tamanoReal && e.target === e.currentTarget) cerrar();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={titulo}
          onClick={() => setTamanoReal((v) => !v)}
          className={tamanoReal ? "max-w-none cursor-zoom-out" : "max-h-full max-w-full object-contain cursor-zoom-in"}
        />
      </div>
      <p className="px-3 py-2 text-center text-xs text-white/70" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
        {tamanoReal ? "Desliza para recorrer la imagen · toca para ajustarla" : "Toca la imagen para verla en tamaño real · Esc para cerrar"}
      </p>
    </div>,
    document.body
  );
}
