import type {
  Evaluation,
  QuestionConRespuesta,
  RespuestaEstudiante,
  ResultadoEvaluacion,
} from "./evaluation.entity";

export interface ResumenIntento {
  id: string;
  evaluationId: string;
  puntaje: number;
  aprobado: boolean;
  fecha: string;
}

export interface IEvaluationRepository {
  listarEvaluaciones(courseId?: string): Promise<Evaluation[]>;
  /** Devuelve la evaluación SIN las respuestas correctas (para tomar el examen) */
  obtenerEvaluacionParaResolver(id: string): Promise<Evaluation | null>;
  /** Devuelve las preguntas CON respuesta correcta (solo para calificar en el servidor) */
  obtenerPreguntasConRespuesta(evaluationId: string): Promise<QuestionConRespuesta[]>;
  guardarIntento(
    userId: string,
    evaluationId: string,
    resultado: ResultadoEvaluacion,
    respuestas: RespuestaEstudiante[]
  ): Promise<void>;
  obtenerHistorial(userId: string, evaluationId?: string): Promise<ResumenIntento[]>;
}
