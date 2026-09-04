// Autorización de servidor para el módulo de tutoría (Sección 20 del pedido):
// un docente SOLO puede consultar/modificar a sus propios tutorados. Un
// administrador puede consultar cualquier estudiante. Esta verificación se
// hace SIEMPRE en el servidor — nunca se confía en la URL ni en la UI.

import { getAuthContext } from "./authorization";
import { prisma } from "./prisma";

interface ResultadoAutorizacion {
  autorizado: boolean;
  esAdmin: boolean;
  docenteId: string | null;
  assignmentId: string | null;
}

export async function requireTutorDe(estudianteId: string): Promise<ResultadoAutorizacion> {
  const ctx = await getAuthContext();
  if (!ctx) return { autorizado: false, esAdmin: false, docenteId: null, assignmentId: null };

  if (ctx.rol === "ADMINISTRADOR") {
    return { autorizado: true, esAdmin: true, docenteId: null, assignmentId: null };
  }

  if (ctx.rol !== "DOCENTE") {
    return { autorizado: false, esAdmin: false, docenteId: null, assignmentId: null };
  }

  const asignacion = await prisma.tutoringAssignment.findFirst({
    where: { docenteId: ctx.id, estudianteId, estado: "ACTIVA" },
  });

  return {
    autorizado: Boolean(asignacion),
    esAdmin: false,
    docenteId: ctx.id,
    assignmentId: asignacion?.id ?? null,
  };
}

/** Variante que autoriza directamente por assignmentId (para acciones sobre tareas/objetivos/etc.) */
export async function requireTutorDeAssignment(assignmentId: string): Promise<ResultadoAutorizacion> {
  const asignacion = await prisma.tutoringAssignment.findUnique({ where: { id: assignmentId } });
  if (!asignacion) return { autorizado: false, esAdmin: false, docenteId: null, assignmentId: null };
  return requireTutorDe(asignacion.estudianteId);
}
