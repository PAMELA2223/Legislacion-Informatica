import type { Rol } from "@prisma/client";

export interface AdminUserRow {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  xp: number;
  nivel: number;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  usuarioNombre: string;
  accion: string;
  entidad: string;
  detalle?: string | null;
  fecha: string;
}

export interface AdminNewsRow {
  id: string;
  titulo: string;
  resumen: string;
  contenido: string;
  fuente: string;
  fechaPublicacion: string;
}

export interface AdminGlossaryRow {
  id: string;
  termino: string;
  definicion: string;
  categoria: string;
  orden: number;
}

export interface AdminLibraryRow {
  id: string;
  titulo: string;
  categoria: string;
  tags: string[];
  descargas: number;
}

export interface AdminCourseRow {
  id: string;
  titulo: string;
  numero: number;
  totalLecciones: number;
  totalInscritos: number;
}

export interface AdminEvaluationRow {
  id: string;
  titulo: string;
  totalPreguntas: number;
  totalIntentos: number;
}

export interface AdminCaseStudyRow {
  id: string;
  titulo: string;
  categoria: string;
  totalIntentos: number;
}

export interface AdminForumThreadRow {
  id: string;
  titulo: string;
  autorNombre: string;
  totalPosts: number;
  createdAt: string;
}

// ============================================================
// Creación de evaluaciones y preguntas (Fase 9 — completa el
// formulario que faltaba: antes solo se podía listar/eliminar)
// ============================================================

export type AdminTipoPregunta = "VF" | "OPCION_MULTIPLE" | "RELACIONAR" | "COMPLETAR" | "CASO";

export interface AdminPreguntaRow {
  id: string;
  tipo: AdminTipoPregunta;
  enunciado: string;
  puntaje: number;
  orden: number;
}

export interface AdminEvaluationDetalle {
  id: string;
  titulo: string;
  courseId: string | null;
  tiempoLimite: number;
  preguntas: AdminPreguntaRow[];
}

/** Estructura de opciones/respuesta correcta según el tipo — el formulario
 * arma este objeto distinto dependiendo de qué tipo elija el administrador. */
export interface AdminNuevaPregunta {
  tipo: AdminTipoPregunta;
  enunciado: string;
  retroalimentacion: string;
  puntaje: number;
  orden: number;
  opciones: unknown; // { alternativas: string[] } | { columnaIzquierda; columnaDerecha } | null
  respuestaCorrecta: unknown; // { esVerdadero } | { indiceCorrecto } | { pares } | { aceptadas }
}

// ============================================================
// Creación de casos prácticos (los 9 campos oficiales)
// ============================================================

export interface AdminNuevoCaso {
  titulo: string;
  categoria: string;
  escenario: string;
  descripcion: string;
  normativaAplicable: string;
  derechosVulnerados: string;
  sanciones: string;
  actuacionCorrecta: string;
  retroalimentacionJuridica: string;
  nivelDificultad: string;
  competenciaDesarrollada: string;
  alternativas: string[];
  indiceCorrecto: number;
}

export const ROLES_DISPONIBLES: Rol[] = ["ADMINISTRADOR", "DOCENTE", "ESTUDIANTE", "INVITADO"];
