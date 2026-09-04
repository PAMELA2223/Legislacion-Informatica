// Capa de DOMINIO: estructuras de datos agregadas para cada dashboard.
// El dashboard no tiene reglas de negocio propias complejas; su función es
// componer y presentar datos que ya calculan los otros módulos.

import type { PerfilComparativo } from "@/modules/self-assessment/domain/self-assessment.entity";

export interface ActividadReciente {
  tipo: "LECCION" | "EVALUACION" | "CASO";
  titulo: string;
  fecha: string;
  detalle?: string; // ej. "85% obtenido" o "Respuesta correcta"
}

export interface ResumenEstudiante {
  progresoGeneral: number; // 0-100, promedio de todos los módulos inscritos
  modulosCompletados: number;
  modulosEnCurso: number;
  totalModulos: number;
  evaluacionesRealizadas: number;
  evaluacionesPendientes: number;
  promedioCalificaciones: number; // 0-100
  casosResueltos: number;
  casosCorrectos: number;
  xp: number;
  nivel: number;
  ranking: number; // posición entre estudiantes, 0 si no hay datos
  totalEstudiantesRanking: number;
  actividadReciente: ActividadReciente[];
  perfilCompetencias: PerfilComparativo;
}

export interface ProgresoPorModulo {
  courseId: string;
  titulo: string;
  inscritos: number;
  completados: number;
}

export interface ResumenDocente {
  totalEstudiantes: number;
  progresoPromedioGeneral: number;
  promedioCalificacionesGeneral: number;
  progresoPorModulo: ProgresoPorModulo[];
}

export interface ResumenAdmin {
  totalUsuarios: number;
  totalEstudiantes: number;
  totalDocentes: number;
  totalAdministradores: number;
  cursoMasConsultado: { titulo: string; inscritos: number } | null;
  tasaFinalizacionGeneral: number; // % de inscripciones completadas
  totalDescargasBiblioteca: number;
  documentoMasDescargado: { titulo: string; descargas: number } | null;
  totalCasosResueltos: number;
  totalEvaluacionesRealizadas: number;
  promedioPerfilInicial: PerfilComparativo["inicial"];
  promedioPerfilFinal: PerfilComparativo["final"];
}
