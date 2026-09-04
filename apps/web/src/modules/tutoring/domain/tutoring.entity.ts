// Capa de DOMINIO: entidades y reglas de negocio de la tutoría.
// No depende de Prisma ni de Next.js — solo de tipos y lógica pura.

export type EstadoTutoria = "PENDIENTE" | "ACTIVA" | "RECHAZADA" | "FINALIZADA" | "CANCELADA";
export type EstadoTarea = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA" | "VENCIDA";
export type PrioridadTarea = "BAJA" | "MEDIA" | "ALTA";
export type EstadoObjetivo = "NO_INICIADO" | "EN_PROGRESO" | "COMPLETADO" | "CANCELADO";
export type TipoObservacion = "SEGUIMIENTO" | "ACUERDO" | "RECOMENDACION" | "DIFICULTAD" | "AVANCE";
export type EstadoReunion = "PROGRAMADA" | "REALIZADA" | "CANCELADA" | "REPROGRAMADA";

export const ETIQUETAS_ESTADO_TUTORIA: Record<EstadoTutoria, string> = {
  PENDIENTE: "Pendiente de aprobación",
  ACTIVA: "Activa",
  RECHAZADA: "Rechazada",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
};

export const ETIQUETAS_TIPO_OBSERVACION: Record<TipoObservacion, string> = {
  SEGUIMIENTO: "Seguimiento académico",
  ACUERDO: "Acuerdo",
  RECOMENDACION: "Recomendación",
  DIFICULTAD: "Dificultad observada",
  AVANCE: "Avance",
};

export interface TutoringAssignment {
  id: string;
  docenteId: string;
  docenteNombre: string;
  estudianteId: string;
  estudianteNombre: string;
  estudianteEmail: string;
  estado: EstadoTutoria;
  fechaSolicitud: string;
  fechaAsignacion?: string | null;
  fechaFinalizacion?: string | null;
}

export interface TutoringTask {
  id: string;
  assignmentId: string;
  courseId?: string | null;
  courseTitulo?: string | null;
  titulo: string;
  descripcion: string;
  fechaLimite: string;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
}

export interface TutoringObjective {
  id: string;
  assignmentId: string;
  titulo: string;
  descripcion: string;
  progreso: number;
  estado: EstadoObjetivo;
  fechaObjetivo: string;
}

export interface TutoringObservation {
  id: string;
  assignmentId: string;
  autorNombre: string;
  tipo: TipoObservacion;
  contenido: string;
  createdAt: string;
}

export interface TutoringMeeting {
  id: string;
  assignmentId: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  duracionMin: number;
  estado: EstadoReunion;
  acuerdos?: string | null;
}

export interface TutoringResource {
  id: string;
  assignmentId: string;
  titulo: string;
  url: string;
  descripcion?: string | null;
}

/** Resumen académico calculado a partir de datos YA existentes en la plataforma (nunca duplicados) */
export interface ResumenAcademicoEstudiante {
  progresoGeneral: number;
  modulosCompletados: number;
  totalModulos: number;
  evaluacionesRealizadas: number;
  promedioCalificaciones: number;
  casosResueltos: number;
  casosCorrectos: number;
  perfilInicial: number | null; // promedio simple de los 6 ejes, para la vista resumida
  perfilFinal: number | null;
}

/** Reglas de negocio del dominio de tutoría */
export class TutoringRules {
  /** Un estudiante no puede tener dos tutorías ACTIVAS al mismo tiempo (salvo autorización explícita del admin) */
  static puedeActivarse(
    tutoriasActivasDelEstudiante: Pick<TutoringAssignment, "id">[],
    autorizacionAdminExplicita = false
  ): boolean {
    if (autorizacionAdminExplicita) return true;
    return tutoriasActivasDelEstudiante.length === 0;
  }

  static esTransicionValida(actual: EstadoTutoria, siguiente: EstadoTutoria): boolean {
    const transiciones: Record<EstadoTutoria, EstadoTutoria[]> = {
      PENDIENTE: ["ACTIVA", "RECHAZADA", "CANCELADA"],
      ACTIVA: ["FINALIZADA", "CANCELADA"],
      RECHAZADA: [],
      FINALIZADA: [],
      CANCELADA: [],
    };
    return transiciones[actual].includes(siguiente);
  }

  static tituloValido(texto: string): boolean {
    return texto.trim().length >= 3;
  }

  static progresoValido(valor: number): boolean {
    return Number.isInteger(valor) && valor >= 0 && valor <= 100;
  }
}
