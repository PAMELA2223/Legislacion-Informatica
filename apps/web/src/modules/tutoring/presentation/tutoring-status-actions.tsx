"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function TutoringStatusActions({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function cambiarEstado(estado: "FINALIZADA" | "CANCELADA") {
    const mensaje =
      estado === "FINALIZADA"
        ? "¿Finalizar esta tutoría? El estudiante dejará de aparecer en tu lista."
        : "¿Cancelar esta tutoría?";
    if (!confirm(mensaje)) return;

    setCargando(true);
    try {
      const res = await fetch(`/api/tutoria/${assignmentId}/estado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "No se pudo actualizar la tutoría.");
        return;
      }
      router.push("/docente/estudiantes");
      router.refresh();
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => cambiarEstado("FINALIZADA")} isLoading={cargando}>
        Finalizar tutoría
      </Button>
    </div>
  );
}
