// Capa de DOMINIO: entidades y reglas de negocio puras del módulo educativo

export type TipoLeccion =
  | "VIDEO"
  | "PDF"
  | "INFOGRAFIA"
  | "TEXTO"
  | "PODCAST"
  | "LINEA_TIEMPO"
  | "MAPA_CONCEPTUAL"
  | "PRESENTACION";

export interface Lesson {
  id: string;
  courseId: string;
  tipo: TipoLeccion;
  titulo: string;
  urlRecurso?: string | null;
  contenido?: string | null;
  orden: number;
  completado?: boolean; // se resuelve por usuario, no es un campo propio de la lección
}

export interface Course {
  id: string;
  slug: string;
  numero: number; // 1..8, orden oficial definido en la Fase 1
  titulo: string;
  descripcion: string;
  resumen: string;
  bibliografia: string;
  propositoAcademico: string;
  orden: number;
  lessons: Lesson[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progreso: number; // 0-100
  completado: boolean;
  fechaInicio: string;
}

/** Reglas de negocio del dominio de módulos educativos */
export class CourseRules {
  /** El progreso de un curso es el % de lecciones completadas */
  static calcularProgreso(totalLecciones: number, completadas: number): number {
    if (totalLecciones === 0) return 0;
    return Math.round((completadas / totalLecciones) * 100);
  }

  static estaCompletado(progreso: number): boolean {
    return progreso >= 100;
  }

  /** Un módulo solo se desbloquea si el anterior (en orden oficial) está completado.
   *  Regla de "aprendizaje progresivo" definida en los Objetivos Pedagógicos (Fase 1). */
  static estaDesbloqueado(
    numeroModulo: number,
    enrollments: Pick<Enrollment, "courseId" | "completado">[],
    cursoAnteriorId?: string
  ): boolean {
    if (numeroModulo === 1) return true;
    if (!cursoAnteriorId) return true; // si no se resolvió el anterior, no bloquear por error de datos
    const anterior = enrollments.find((e) => e.courseId === cursoAnteriorId);
    return Boolean(anterior?.completado);
  }
}
