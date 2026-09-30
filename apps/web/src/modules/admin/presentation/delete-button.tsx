"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { mostrarAviso } from "@/lib/avisos";

/**
 * Botón de eliminar del panel. Pide confirmación en un diálogo propio
 * ([Cancelar] [Eliminar]); si el servidor rechaza la operación, muestra el
 * motivo DENTRO del diálogo (antes un fallo podía pasar desapercibido); si
 * tiene éxito, muestra un aviso breve y actualiza la página.
 */
export function DeleteButton({
  url,
  confirmMessage = "Esta acción no se puede deshacer.",
  titulo = "¿Está seguro de que desea eliminar este elemento?",
  etiqueta,
  redirectTo,
  className,
}: {
  url: string;
  confirmMessage?: React.ReactNode;
  titulo?: string;
  /** Si se indica, el botón muestra texto además del ícono (ej. "Eliminar módulo"). */
  etiqueta?: string;
  /** A dónde ir tras eliminar (ej. volver al listado desde la página de detalle). */
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelar = useCallback(() => {
    setAbierto(false);
    setError(null);
  }, []);

  async function confirmar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `No se pudo eliminar (error ${res.status}). Inténtalo de nuevo.`);
        return;
      }
      setAbierto(false);
      // Aviso global: sigue visible aunque esta fila desaparezca de la lista.
      mostrarAviso(data.mensaje || "Elemento eliminado correctamente.");
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label={etiqueta ?? "Eliminar"}
        title={etiqueta ?? "Eliminar"}
        className={
          className ??
          (etiqueta
            ? "inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            : "rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600")
        }
      >
        <Trash2 className="w-4 h-4" aria-hidden />
        {etiqueta && <span>{etiqueta}</span>}
      </button>

      <ConfirmDialog
        abierto={abierto}
        titulo={titulo}
        mensaje={confirmMessage}
        cargando={cargando}
        error={error}
        onConfirmar={confirmar}
        onCancelar={cancelar}
      />

    </>
  );
}
