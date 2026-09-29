// Punto único donde páginas y Route Handlers aplican las reglas del flujo de
// aprendizaje (Autoevaluación inicial → Módulos → Evaluaciones → Final).
// Las reglas en sí viven en el dominio (modules/learning-path/domain); aquí
// solo se conectan con Prisma, el rol del usuario y las redirecciones.
//
// Los administradores no están sujetos al flujo: pueden previsualizar
// cualquier módulo o evaluación sin que se les bloquee.

import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import type { AuthContext } from "./authorization";
import { PrismaLearningPathRepository } from "@/modules/learning-path/infrastructure/prisma-learning-path.repository";
import { ObtenerEstadoAprendizajeUseCase } from "@/modules/learning-path/application/learning-path.use-cases";
import { LearningPathRules, type EstadoAprendizaje } from "@/modules/learning-path/domain/learning-path.entity";
import { TIPO_EVALUACION } from "@/modules/evaluations/domain/evaluation-types";

export const RUTA_AUTOEVALUACION_INICIAL = "/autoevaluacion/inicial";
export const RUTA_AUTOEVALUACION_FINAL = "/autoevaluacion/final";

/** Estado del estudiante, memorizado durante una misma petición. */
export const obtenerEstadoAprendizaje = cache(async (userId: string): Promise<EstadoAprendizaje> => {
  return new ObtenerEstadoAprendizajeUseCase(new PrismaLearningPathRepository(prisma)).execute(userId);
});

/**
 * Para páginas del estudiante que requieren haber completado la
 * autoevaluación inicial: si está pendiente, redirige a ella.
 * Devuelve el estado (o null para administradores, que no siguen el flujo).
 */
export async function exigirAutoevaluacionInicial(ctx: AuthContext): Promise<EstadoAprendizaje | null> {
  if (ctx.rol !== "ESTUDIANTE") return null;
  const estado = await obtenerEstadoAprendizaje(ctx.id);
  if (!estado.puedeAccederModulos) redirect(RUTA_AUTOEVALUACION_INICIAL);
  return estado;
}

export type ResultadoAccesoEvaluacion =
  | { permitido: true; tipo: string; courseSlug: string | null }
  | { permitido: false; status: number; motivo: string; redirigirA: string; tipo: string | null };

/**
 * Decide si un usuario puede rendir (o abrir) una evaluación concreta.
 * Se usa tanto en la página /evaluaciones/[id] como en la API de envío, para
 * que no baste con conocer la URL o llamar a la API directamente.
 */
export async function verificarAccesoEvaluacion(ctx: AuthContext, evaluationId: string): Promise<ResultadoAccesoEvaluacion> {
  const evaluacion = await prisma.evaluation.findUnique({
    where: { id: evaluationId },
    select: { tipo: true, course: { select: { slug: true, activo: true } } },
  });
  if (!evaluacion) {
    return { permitido: false, status: 404, motivo: "Evaluación no encontrada.", redirigirA: "/modulos", tipo: null };
  }

  const courseSlug = evaluacion.course?.slug ?? null;
  if (ctx.rol !== "ESTUDIANTE") return { permitido: true, tipo: evaluacion.tipo, courseSlug };

  const estado = await obtenerEstadoAprendizaje(ctx.id);
  const denegar = (motivo: string, redirigirA: string, status = 403): ResultadoAccesoEvaluacion => ({
    permitido: false,
    status,
    motivo,
    redirigirA,
    tipo: evaluacion.tipo,
  });

  if (evaluacion.tipo === TIPO_EVALUACION.INICIAL) {
    if (evaluationId !== estado.inicial.evaluationId) return denegar("Esta evaluación no está disponible.", "/autoevaluacion");
    if (!LearningPathRules.puedeRendirAutoevaluacionInicial(estado)) {
      return denegar("Ya completaste la autoevaluación inicial.", "/autoevaluacion", 409);
    }
    return { permitido: true, tipo: evaluacion.tipo, courseSlug };
  }

  if (evaluacion.tipo === TIPO_EVALUACION.FINAL) {
    if (evaluationId !== estado.final.evaluationId) return denegar("Esta evaluación no está disponible.", "/autoevaluacion");
    if (estado.final.completada) return denegar("Ya completaste la autoevaluación final.", "/autoevaluacion", 409);
    if (!LearningPathRules.puedeRendirAutoevaluacionFinal(estado)) {
      return denegar(
        "La autoevaluación final se habilita cuando completes todos los módulos y sus evaluaciones.",
        "/modulos"
      );
    }
    return { permitido: true, tipo: evaluacion.tipo, courseSlug };
  }

  // Evaluación de módulo
  if (!estado.puedeAccederModulos) {
    return denegar("Primero debes completar la autoevaluación inicial.", RUTA_AUTOEVALUACION_INICIAL);
  }
  if (!courseSlug || !evaluacion.course?.activo) {
    return denegar("Esta evaluación no está asociada a un módulo disponible.", "/modulos");
  }
  if (!LearningPathRules.puedeRendirEvaluacionDeModulo(estado, evaluationId)) {
    return denegar(
      "Para rendir esta evaluación primero revisa todo el contenido del módulo (y los módulos anteriores).",
      `/modulos/${courseSlug}`
    );
  }
  return { permitido: true, tipo: evaluacion.tipo, courseSlug };
}
