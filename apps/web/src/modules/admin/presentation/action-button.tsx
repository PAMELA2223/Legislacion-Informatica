"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Botón genérico que envía una petición a la API y refresca la página
 * (reordenar, activar/desactivar, importar...). Mismo patrón que DeleteButton.
 */
export function ActionButton({
  url,
  method = "POST",
  body,
  children,
  confirmMessage,
  successMessage,
  className,
  ariaLabel,
  title,
}: {
  url: string;
  method?: "POST" | "PUT" | "PATCH";
  body?: unknown;
  children: React.ReactNode;
  confirmMessage?: string;
  /** Si se indica, se muestra tras el éxito; `{n}` se reemplaza por data.importados. */
  successMessage?: string;
  className?: string;
  ariaLabel?: string;
  title?: string;
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function handleClick() {
    if (confirmMessage && !confirm(confirmMessage)) return;
    setCargando(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "No se pudo completar la acción.");
        return;
      }
      if (successMessage) alert(successMessage.replace("{n}", String(data.importados ?? "")));
      router.refresh();
    } finally {
      setCargando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={cargando}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      className={cn("disabled:opacity-50", className)}
    >
      {children}
    </button>
  );
}
