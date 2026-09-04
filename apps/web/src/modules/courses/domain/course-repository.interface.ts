import type { Course, Enrollment } from "./course.entity";

/**
 * Contrato del repositorio de módulos educativos.
 * La capa de aplicación depende de esta interfaz, nunca de Prisma directamente.
 */
export interface ICourseRepository {
  listarCursos(): Promise<Course[]>;
  obtenerCursoPorSlug(slug: string): Promise<Course | null>;
  obtenerInscripciones(userId: string): Promise<Enrollment[]>;
  inscribirse(userId: string, courseId: string): Promise<Enrollment>;
  marcarLeccionCompletada(
    userId: string,
    lessonId: string
  ): Promise<{ progreso: number; completado: boolean }>;
}
