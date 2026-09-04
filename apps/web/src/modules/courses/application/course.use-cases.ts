import { CourseRules } from "../domain/course.entity";
import type { ICourseRepository } from "../domain/course-repository.interface";

export class ListarCursosUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute() {
    return this.courseRepository.listarCursos();
  }
}

export class ObtenerCursoUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(slug: string) {
    const curso = await this.courseRepository.obtenerCursoPorSlug(slug);
    if (!curso) throw new Error("Módulo no encontrado.");
    return curso;
  }
}

export class ObtenerProgresoGeneralUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(userId: string) {
    const [cursos, inscripciones] = await Promise.all([
      this.courseRepository.listarCursos(),
      this.courseRepository.obtenerInscripciones(userId),
    ]);

    return cursos
      .sort((a, b) => a.orden - b.orden)
      .map((curso, idx) => {
        const inscripcion = inscripciones.find((e) => e.courseId === curso.id);
        const cursoAnterior = idx > 0 ? cursos[idx - 1] : undefined;
        return {
          curso,
          progreso: inscripcion?.progreso ?? 0,
          completado: inscripcion?.completado ?? false,
          desbloqueado: CourseRules.estaDesbloqueado(
            curso.numero,
            inscripciones,
            cursoAnterior?.id
          ),
        };
      });
  }
}

export class InscribirseEnCursoUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(userId: string, courseId: string) {
    return this.courseRepository.inscribirse(userId, courseId);
  }
}

export class MarcarLeccionCompletadaUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(userId: string, lessonId: string) {
    return this.courseRepository.marcarLeccionCompletada(userId, lessonId);
  }
}
