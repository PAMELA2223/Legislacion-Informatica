import { EvaluationRules } from "../domain/evaluation.entity";
import type { RespuestaEstudiante } from "../domain/evaluation.entity";
import type { IEvaluationRepository } from "../domain/evaluation-repository.interface";

export class ListarEvaluacionesUseCase {
  constructor(private readonly repo: IEvaluationRepository) {}

  async execute(courseId?: string) {
    return this.repo.listarEvaluaciones(courseId);
  }
}

export class ObtenerEvaluacionParaResolverUseCase {
  constructor(private readonly repo: IEvaluationRepository) {}

  async execute(id: string) {
    const evaluacion = await this.repo.obtenerEvaluacionParaResolver(id);
    if (!evaluacion) throw new Error("Evaluación no encontrada.");
    return evaluacion;
  }
}

/**
 * Caso de uso central: recibe las respuestas del estudiante, obtiene las
 * respuestas correctas SOLO en el servidor (nunca llegan al cliente antes de
 * este punto), califica automáticamente y guarda el intento con retroalimentación.
 */
export class EnviarIntentoUseCase {
  constructor(private readonly repo: IEvaluationRepository) {}

  async execute(userId: string, evaluationId: string, respuestas: RespuestaEstudiante[]) {
    const preguntas = await this.repo.obtenerPreguntasConRespuesta(evaluationId);
    if (preguntas.length === 0) throw new Error("La evaluación no tiene preguntas.");

    const resultado = EvaluationRules.calificarEvaluacion(preguntas, respuestas);
    await this.repo.guardarIntento(userId, evaluationId, resultado, respuestas);
    return resultado;
  }
}

export class ObtenerHistorialUseCase {
  constructor(private readonly repo: IEvaluationRepository) {}

  async execute(userId: string, evaluationId?: string) {
    return this.repo.obtenerHistorial(userId, evaluationId);
  }
}
