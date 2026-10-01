// Capa de INFRAESTRUCTURA del flujo de aprendizaje.
// Lee de Prisma los datos crudos (módulos activos, lecciones completadas,
// intentos de evaluación) y los entrega al dominio para calcular el estado.

import type { PrismaClient } from "@prisma/client";
import { TIPO_EVALUACION } from "@/modules/evaluations/domain/evaluation-types";
import type { ILearningPathRepository } from "../domain/learning-path-repository.interface";
import type {
  DatosAutoevaluacion,
  EntradaEstadoAprendizaje,
  IntentoResumen,
} from "../domain/learning-path.entity";
import { LearningPathRules } from "../domain/learning-path.entity";

type IntentoDb = { evaluationId: string; puntaje: number; aprobado: boolean; fecha: Date };

function resumen(i: IntentoDb): IntentoResumen {
  return { puntaje: i.puntaje, aprobado: i.aprobado, fecha: i.fecha.toISOString() };
}

function mejorIntento(intentos: IntentoDb[]): IntentoResumen | null {
  if (intentos.length === 0) return null;
  const mejor = intentos.reduce((a, b) => (b.puntaje > a.puntaje ? b : a));
  return resumen(mejor);
}

/** Selección reutilizable: evaluación con el número de preguntas ACTIVAS. */
const SELECT_EVAL_CON_CONTEO = {
  id: true,
  _count: { select: { preguntas: { where: { activo: true } } } },
} as const;

export class PrismaLearningPathRepository implements ILearningPathRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** La autoevaluación inicial o final vigente (la más antigua de su tipo). */
  async obtenerAutoevaluacionId(tipo: typeof TIPO_EVALUACION.INICIAL | typeof TIPO_EVALUACION.FINAL) {
    const ev = await this.prisma.evaluation.findFirst({
      where: { tipo },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    return ev?.id ?? null;
  }

  async obtenerEntrada(userId: string): Promise<EntradaEstadoAprendizaje> {
    const [inicialEval, finalEval, cursos] = await Promise.all([
      this.prisma.evaluation.findFirst({
        where: { tipo: TIPO_EVALUACION.INICIAL },
        orderBy: { createdAt: "asc" },
        select: SELECT_EVAL_CON_CONTEO,
      }),
      this.prisma.evaluation.findFirst({
        where: { tipo: TIPO_EVALUACION.FINAL },
        orderBy: { createdAt: "asc" },
        select: SELECT_EVAL_CON_CONTEO,
      }),
      this.prisma.course.findMany({
        where: { activo: true, eliminadoEn: null },
        orderBy: [{ orden: "asc" }, { numero: "asc" }],
        select: {
          id: true,
          slug: true,
          numero: true,
          titulo: true,
          descripcion: true,
          lessons: { select: { id: true } },
          evaluations: {
            where: { tipo: TIPO_EVALUACION.MODULO },
            orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
            take: 1,
            select: SELECT_EVAL_CON_CONTEO,
          },
        },
      }),
    ]);

    const idsLecciones = cursos.flatMap((c) => c.lessons.map((l) => l.id));
    const idsEvaluaciones = [
      inicialEval?.id,
      finalEval?.id,
      ...cursos.map((c) => c.evaluations[0]?.id),
    ].filter((x): x is string => Boolean(x));

    const [completadas, intentos] = await Promise.all([
      idsLecciones.length
        ? this.prisma.lessonProgress.findMany({
            where: { userId, completado: true, lessonId: { in: idsLecciones } },
            select: { lessonId: true },
          })
        : Promise.resolve([]),
      idsEvaluaciones.length
        ? this.prisma.quizAttempt.findMany({
            where: { userId, evaluationId: { in: idsEvaluaciones } },
            orderBy: { fecha: "asc" },
            select: { evaluationId: true, puntaje: true, aprobado: true, fecha: true },
          })
        : Promise.resolve([]),
    ]);

    const leccionesHechas = new Set(completadas.map((c) => c.lessonId));
    const intentosDe = (evaluationId?: string) =>
      evaluationId ? intentos.filter((i) => i.evaluationId === evaluationId) : [];

    const autoevaluacion = (ev: typeof inicialEval): DatosAutoevaluacion => ({
      evaluationId: ev?.id ?? null,
      preguntasActivas: ev?._count.preguntas ?? 0,
      intentos: intentosDe(ev?.id).map(resumen), // orden cronológico (orderBy fecha asc)
    });

    return {
      inicial: autoevaluacion(inicialEval),
      final: autoevaluacion(finalEval),
      modulos: cursos.map((c) => {
        const ev = c.evaluations[0];
        return {
          courseId: c.id,
          slug: c.slug,
          numero: c.numero,
          titulo: c.titulo,
          descripcion: c.descripcion,
          totalLecciones: c.lessons.length,
          leccionesCompletadas: c.lessons.filter((l) => leccionesHechas.has(l.id)).length,
          evaluacion: ev ? { id: ev.id, preguntasActivas: ev._count.preguntas } : null,
          mejorIntento: mejorIntento(intentosDe(ev?.id)),
        };
      }),
    };
  }
}

/**
 * Mantiene la tabla `enrollments` coherente con el nuevo criterio de
 * "módulo completado" = todas las lecciones revisadas + evaluación aprobada
 * (si el módulo tiene evaluación con preguntas activas).
 *
 * `enrollments.completado` lo siguen leyendo el dashboard, las estadísticas
 * del administrador y las insignias, así que se actualiza aquí en vez de
 * cambiar todas esas consultas.
 */
export async function sincronizarProgresoModulo(
  prisma: PrismaClient,
  userId: string,
  courseId: string
): Promise<{ progreso: number; completado: boolean }> {
  const curso = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      lessons: { select: { id: true } },
      evaluations: {
        where: { tipo: TIPO_EVALUACION.MODULO },
        orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: SELECT_EVAL_CON_CONTEO,
      },
    },
  });
  if (!curso) return { progreso: 0, completado: false };

  const totalLecciones = curso.lessons.length;
  const completadas = totalLecciones
    ? await prisma.lessonProgress.count({
        where: { userId, completado: true, lessonId: { in: curso.lessons.map((l) => l.id) } },
      })
    : 0;

  const progreso = LearningPathRules.calcularProgresoLecciones(totalLecciones, completadas);
  const ev = curso.evaluations[0];
  const requiereEvaluacion = Boolean(ev) && (ev?._count.preguntas ?? 0) > 0;
  const aprobada = requiereEvaluacion
    ? (await prisma.quizAttempt.count({ where: { userId, evaluationId: ev!.id, aprobado: true } })) > 0
    : true;
  const completado = completadas >= totalLecciones && aprobada;

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { progreso, completado },
    create: { userId, courseId, progreso, completado },
  });

  return { progreso, completado };
}

/**
 * Registra la finalización del proceso de aprendizaje (fecha en
 * `users.proceso_finalizado_en`) la primera vez que el estudiante completa la
 * autoevaluación final. Idempotente.
 */
export async function registrarFinalizacionSiCorresponde(prisma: PrismaClient, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { procesoFinalizadoEn: true } });
  if (!user || user.procesoFinalizadoEn) return;

  const estado = LearningPathRules.calcularEstado(await new PrismaLearningPathRepository(prisma).obtenerEntrada(userId));
  if (estado.etapa === "FINALIZADO") {
    await prisma.user.update({
      where: { id: userId },
      data: { procesoFinalizadoEn: estado.final.fecha ? new Date(estado.final.fecha) : new Date() },
    });
  }
}
