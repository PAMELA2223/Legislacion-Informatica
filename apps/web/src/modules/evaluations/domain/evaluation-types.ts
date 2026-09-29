// Tipos de evaluación reconocidos por la plataforma. El campo
// `Evaluation.tipo` es un String en la base de datos (ya existía con estos
// valores previstos), así que se centralizan aquí para no repetir literales.

export const TIPO_EVALUACION = {
  /** Evaluación asociada a un módulo concreto (courseId obligatorio). */
  MODULO: "modulo",
  /** Autoevaluación inicial obligatoria (diagnóstico de conocimientos previos). */
  INICIAL: "diagnostica",
  /** Autoevaluación final obligatoria (comprobación de lo aprendido). */
  FINAL: "final",
} as const;

export type TipoEvaluacion = (typeof TIPO_EVALUACION)[keyof typeof TIPO_EVALUACION];

export function esAutoevaluacion(tipo: string): boolean {
  return tipo === TIPO_EVALUACION.INICIAL || tipo === TIPO_EVALUACION.FINAL;
}

export const ETIQUETAS_TIPO_EVALUACION: Record<string, string> = {
  [TIPO_EVALUACION.MODULO]: "Evaluación de módulo",
  [TIPO_EVALUACION.INICIAL]: "Autoevaluación inicial",
  [TIPO_EVALUACION.FINAL]: "Autoevaluación final",
};
