// Capa de DOMINIO: autoevaluación de competencias digitales (Fase 1, Sección 12).
// Diagnóstico inicial y final sobre 6 ejes, base cuantitativa para la
// validación de la tesis.

export type EjeCompetencia =
  | "SEGURIDAD_DIGITAL"
  | "PROTECCION_DATOS"
  | "ASPECTOS_LEGALES"
  | "ETICA"
  | "CIUDADANIA_DIGITAL"
  | "USO_RESPONSABLE_INFORMACION";

export type TipoDiagnostico = "INICIAL" | "FINAL";

export const ETIQUETAS_EJE: Record<EjeCompetencia, string> = {
  SEGURIDAD_DIGITAL: "Seguridad Digital",
  PROTECCION_DATOS: "Protección de Datos",
  ASPECTOS_LEGALES: "Aspectos Legales",
  ETICA: "Ética",
  CIUDADANIA_DIGITAL: "Ciudadanía Digital",
  USO_RESPONSABLE_INFORMACION: "Uso Responsable de la Información",
};

export const EJES: EjeCompetencia[] = [
  "SEGURIDAD_DIGITAL",
  "PROTECCION_DATOS",
  "ASPECTOS_LEGALES",
  "ETICA",
  "CIUDADANIA_DIGITAL",
  "USO_RESPONSABLE_INFORMACION",
];

export interface SelfAssessmentQuestion {
  id: string;
  eje: EjeCompetencia;
  enunciado: string;
  orden: number;
}

export interface RespuestaLikert {
  questionId: string;
  valor: number; // escala 1 (muy en desacuerdo) a 5 (muy de acuerdo)
}

/** Perfil de competencias: puntaje 0-100 por cada uno de los 6 ejes */
export type PerfilCompetencias = Record<EjeCompetencia, number>;

export interface PerfilComparativo {
  inicial: PerfilCompetencias | null;
  final: PerfilCompetencias | null;
}

export class SelfAssessmentRules {
  /** Convierte una escala Likert 1-5 a un puntaje 0-100 */
  static likertAPuntaje(valor: number): number {
    return Math.round(((valor - 1) / 4) * 100);
  }

  /** Calcula el perfil de competencias (promedio por eje) a partir de las respuestas */
  static calcularPerfil(
    preguntas: SelfAssessmentQuestion[],
    respuestas: RespuestaLikert[]
  ): PerfilCompetencias {
    const perfil = {} as PerfilCompetencias;

    for (const eje of EJES) {
      const preguntasDelEje = preguntas.filter((p) => p.eje === eje);
      const valores = preguntasDelEje
        .map((p) => respuestas.find((r) => r.questionId === p.id)?.valor)
        .filter((v): v is number => typeof v === "number");

      if (valores.length === 0) {
        perfil[eje] = 0;
        continue;
      }

      const promedioLikert = valores.reduce((s, v) => s + v, 0) / valores.length;
      perfil[eje] = this.likertAPuntaje(promedioLikert);
    }

    return perfil;
  }
}
