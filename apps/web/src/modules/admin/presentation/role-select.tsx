"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Rol } from "@prisma/client";

const ETIQUETAS: Record<Rol, string> = {
  ADMINISTRADOR: "Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
  INVITADO: "Invitado",
};

export function RoleSelect({ userId, rolActual }: { userId: string; rolActual: Rol }) {
  const router = useRouter();
  const [rol, setRol] = useState(rolActual);
  const [cargando, setCargando] = useState(false);

  async function handleChange(nuevoRol: Rol) {
    setCargando(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rol: nuevoRol }),
      });
      if (res.ok) {
        setRol(nuevoRol);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "No se pudo cambiar el rol.");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <select
      value={rol}
      disabled={cargando}
      onChange={(e) => handleChange(e.target.value as Rol)}
      className="text-xs rounded-lg border border-border-strong bg-surface px-2 py-1.5 outline-none focus:border-primary disabled:opacity-50"
    >
      {(Object.keys(ETIQUETAS) as Rol[]).map((r) => (
        <option key={r} value={r}>
          {ETIQUETAS[r]}
        </option>
      ))}
    </select>
  );
}
