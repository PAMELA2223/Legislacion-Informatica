"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { EstadoTutoria } from "../domain/tutoring.entity";

interface DocenteOpcion {
  id: string;
  nombre: string;
}

export function AdminTutoringActions({
  assignmentId,
  estado,
  docentes,
}: {
  assignmentId: string;
  estado: EstadoTutoria;
  docentes: DocenteOpcion[];
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [mostrarReasignar, setMostrarReasignar] = useState(false);
  const [nuevoDocenteId, setNuevoDocenteId] = useState("");

  async function cambiarEstado(nuevoEstado: EstadoTutoria) {
    setCargando(true);
    try {
      const res = await fetch(`/api/tutoria/${assignmentId}/estado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "No se pudo actualizar la tutoría.");
        return;
      }
      router.refresh();
    } finally {
      setCargando(false);
    }
  }

  async function reasignar() {
    if (!nuevoDocenteId) return;
    setCargando(true);
    try {
      const res = await fetch(`/api/admin/tutorias/${assignmentId}/reasignar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevoDocenteId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "No se pudo reasignar la tutoría.");
        return;
      }
      setMostrarReasignar(false);
      router.refresh();
    } finally {
      setCargando(false);
    }
  }

  if (mostrarReasignar) {
    return (
      <div className="flex items-center gap-2">
        <select
          value={nuevoDocenteId}
          onChange={(e) => setNuevoDocenteId(e.target.value)}
          className="text-xs rounded-lg border border-border-strong bg-surface px-2 py-1.5 outline-none focus:border-primary"
        >
          <option value="">Selecciona un docente...</option>
          {docentes.map((d) => (
            <option key={d.id} value={d.id}>{d.nombre}</option>
          ))}
        </select>
        <Button onClick={reasignar} isLoading={cargando} disabled={!nuevoDocenteId}>
          Confirmar
        </Button>
        <Button variant="ghost" onClick={() => setMostrarReasignar(false)}>Cancelar</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {estado === "PENDIENTE" && (
        <>
          <Button onClick={() => cambiarEstado("ACTIVA")} isLoading={cargando}>Aprobar</Button>
          <Button variant="outline" onClick={() => cambiarEstado("RECHAZADA")} isLoading={cargando}>Rechazar</Button>
        </>
      )}
      {estado === "ACTIVA" && (
        <>
          <Button variant="outline" onClick={() => setMostrarReasignar(true)}>Reasignar</Button>
          <Button variant="outline" onClick={() => cambiarEstado("FINALIZADA")} isLoading={cargando}>Finalizar</Button>
          <Button variant="ghost" onClick={() => cambiarEstado("CANCELADA")} isLoading={cargando}>Cancelar</Button>
        </>
      )}
    </div>
  );
}
