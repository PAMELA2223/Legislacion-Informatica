// Capa de INFRAESTRUCTURA: implementación concreta con Prisma.
// CRÍTICO: obtenerEvaluacionParaResolver() jamás debe incluir respuestaCorrecta.

import type { PrismaClient } from "@prisma/client";
import type {
  IEvaluationRepository,
  ResumenIntento,
} from "../domain/evaluation-repository.interface";
import type {
  Evaluation,
  QuestionConRespuesta,
  RespuestaEstudiante,
  ResultadoEvaluacion,
} from "../domain/evaluation.entity";
import { otorgarXP } from "@/lib/gamification";
import { PrismaGamificationRepository } from "@/modules/gamification/infrastructure/prisma-gamification.repository";
import {
  registrarFinalizacionSiCorresponde,
  sincronizarProgresoModulo,
} from "@/modules/learning-path/infrastructure/prisma-learning-path.repository";
import { TIPO_EVALUACION, esAutoevaluacion } from "../domain/evaluation-types";

const XP_POR_EVALUACION_APROBADA = 15;

export class PrismaEvaluationRepository implements IEvaluationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarEvaluaciones(courseId?: string): Promise<Evaluation[]> {
    const evaluaciones = await this.prisma.evaluation.findMany({
      where: courseId ? { courseId } : undefined,
      include: {
        preguntas: {
          where: { activo: true },
          orderBy: { orden: "asc" },
          select: {
            id: true,
            evaluationId: true,
            tipo: true,
            enunciado: true,
            opciones: true,
            retroalimentacion: true,
            puntaje: true,
            orden: true,
            // respuestaCorrecta excluida intencionalmente
          },
        },
      },
      orderBy: { orden: "asc" },
    });
    return evaluaciones as unknown as Evaluation[];
  }

  async obtenerEvaluacionParaResolver(id: string): Promise<Evaluation | null> {
    const evaluacion = await this.prisma.evaluation.findUnique({
      where: { id },
      include: {
        preguntas: {
          where: { activo: true },
          orderBy: { orden: "asc" },
          select: {
            id: true,
            evaluationId: true,
            tipo: true,
            enunciado: true,
            opciones: true,
            retroalimentacion: true,
            puntaje: true,
            orden: true,
            // respuestaCorrecta excluida intencionalmente: no debe llegar al cliente
          },
        },
      },
    });
    return evaluacion as unknown as Evaluation | null;
  }

  async obtenerPreguntasConRespuesta(evaluationId: string): Promise<QuestionConRespuesta[]> {
    const preguntas = await this.prisma.question.findMany({
      where: { evaluationId, activo: true },
      orderBy: { orden: "asc" },
    });
    return preguntas as unknown as QuestionConRespuesta[];
  }

  async guardarIntento(
    userId: string,
    evaluationId: string,
    resultado: ResultadoEvaluacion,
    respuestas: RespuestaEstudiante[]
  ): Promise<void> {
    const evaluacion = await this.prisma.evaluation.findUniqueOrThrow({
      where: { id: evaluationId },
      select: { tipo: true, courseId: true },
    });

    await this.prisma.quizAttempt.create({
      data: {
        userId,
        evaluationId,
        puntaje: resultado.puntaje,
        aprobado: resultado.aprobado,
        respuestas: { respuestas, resultadosPorPregunta: resultado.resultadosPorPregunta } as object,
      },
    });

    // Las autoevaluaciones son diagnósticas: no otorgan XP por "aprobar".
    if (resultado.aprobado && !esAutoevaluacion(evaluacion.tipo)) {
      await otorgarXP(this.prisma, userId, XP_POR_EVALUACION_APROBADA);
    }

    // Mantener coherente el progreso del flujo de aprendizaje.
    if (evaluacion.tipo === TIPO_EVALUACION.MODULO && evaluacion.courseId) {
      await sincronizarProgresoModulo(this.prisma, userId, evaluacion.courseId);
    }
    if (evaluacion.tipo === TIPO_EVALUACION.FINAL) {
      await registrarFinalizacionSiCorresponde(this.prisma, userId);
    }

    await new PrismaGamificationRepository(this.prisma).evaluarYOtorgarInsignias(userId);
  }

  async obtenerHistorial(userId: string, evaluationId?: string): Promise<ResumenIntento[]> {
    const intentos = await this.prisma.quizAttempt.findMany({
      where: { userId, evaluationId },
      orderBy: { fecha: "desc" },
    });
    return intentos.map((i) => ({
      id: i.id,
      evaluationId: i.evaluationId,
      puntaje: i.puntaje,
      aprobado: i.aprobado,
      fecha: i.fecha.toISOString(),
    }));
  }
}
