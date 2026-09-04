"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteButton({
  url,
  confirmMessage = "¿Seguro que quieres eliminar este elemento? Esta acción no se puede deshacer.",
}: {
  url: string;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmMessage)) return;
    setCargando(true);
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "No se pudo eliminar.");
        return;
      }
      router.refresh();
    } finally {
      setCargando(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={cargando}
      aria-label="Eliminar"
      className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
