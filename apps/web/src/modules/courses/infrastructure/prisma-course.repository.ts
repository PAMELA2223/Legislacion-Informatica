// Capa de INFRAESTRUCTURA: implementación concreta con Prisma.
// Implementa ICourseRepository — el resto de la app no conoce Prisma directamente.

import type { PrismaClient } from "@prisma/client";
import type { ICourseRepository } from "../domain/course-repository.interface";
import type { Course, Enrollment } from "../domain/course.entity";
import { CourseRules } from "../domain/course.entity";
import { otorgarXP } from "@/lib/gamification";
import { PrismaGamificationRepository } from "@/modules/gamification/infrastructure/prisma-gamification.repository";

const XP_POR_LECCION = 5;

export class PrismaCourseRepository implements ICourseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarCursos(): Promise<Course[]> {
    const cursos = await this.prisma.course.findMany({
      orderBy: { orden: "asc" },
      include: { lessons: { orderBy: { orden: "asc" } } },
    });
    return cursos as unknown as Course[];
  }

  async obtenerCursoPorSlug(slug: string): Promise<Course | null> {
    const curso = await this.prisma.course.findUnique({
      where: { slug },
      include: { lessons: { orderBy: { orden: "asc" } } },
    });
    return curso as unknown as Course | null;
  }

  async obtenerInscripciones(userId: string): Promise<Enrollment[]> {
    const inscripciones = await this.prisma.enrollment.findMany({
      where: { userId },
    });
    return inscripciones.map((e) => ({
      id: e.id,
      userId: e.userId,
      courseId: e.courseId,
      progreso: e.progreso,
      completado: e.completado,
      fechaInicio: e.fechaInicio.toISOString(),
    }));
  }

  async inscribirse(userId: string, courseId: string): Promise<Enrollment> {
    const enrollment = await this.prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId },
    });
    return {
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      progreso: enrollment.progreso,
      completado: enrollment.completado,
      fechaInicio: enrollment.fechaInicio.toISOString(),
    };
  }

  async marcarLeccionCompletada(userId: string, lessonId: string) {
    const leccion = await this.prisma.lesson.findUniqueOrThrow({
      where: { id: lessonId },
      include: { course: { include: { lessons: true } } },
    });

    const yaCompletada = await this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    await this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completado: true },
      create: { userId, lessonId, completado: true },
    });

    if (!yaCompletada?.completado) {
      await otorgarXP(this.prisma, userId, XP_POR_LECCION);
    }

    const totalLecciones = leccion.course.lessons.length;
    const completadas = await this.prisma.lessonProgress.count({
      where: {
        userId,
        completado: true,
        lesson: { courseId: leccion.courseId },
      },
    });

    const progreso = CourseRules.calcularProgreso(totalLecciones, completadas);
    const completado = CourseRules.estaCompletado(progreso);

    await this.prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId: leccion.courseId } },
      update: { progreso, completado },
      create: { userId, courseId: leccion.courseId, progreso, completado },
    });

    await new PrismaGamificationRepository(this.prisma).evaluarYOtorgarInsignias(userId);

    return { progreso, completado };
  }
}
