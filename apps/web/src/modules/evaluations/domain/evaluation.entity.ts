// Capa de DOMINIO: entidades y reglas de negocio puras del módulo de evaluaciones.
// La calificación automática vive aquí porque es una regla de negocio central,
// no un detalle de infraestructura.

export type TipoPregunta = "VF" | "OPCION_MULTIPLE" | "RELACIONAR" | "COMPLETAR" | "CASO";

/** Estructuras de `opciones` y `respuestaCorrecta` según el tipo de pregunta */
export interface OpcionesOpcionMultiple {
  alternativas: string[];
}
export interface RespuestaOpcionMultiple {
  indiceCorrecto: number;
}

export interface OpcionesRelacionar {
  columnaIzquierda: string[];
  columnaDerecha: string[];
}
export interface RespuestaRelacionar {
  pares: number[]; // pares[i] = índice de columnaDerecha que corresponde a columnaIzquierda[i]
}

export interface RespuestaVF {
  esVerdadero: boolean;
}

export interface RespuestaCompletar {
  aceptadas: string[]; // respuestas válidas, comparación insensible a mayúsculas/tildes
}

// Un caso práctico dentro de una evaluación se modela como opción múltiple
// con enunciado extendido (el escenario) — reutiliza la misma estructura.
export interface RespuestaCaso {
  indiceCorrecto: number;
}

export interface Question {
  id: string;
  evaluationId: string;
  tipo: TipoPregunta;
  enunciado: string;
  opciones?: OpcionesOpcionMultiple | OpcionesRelacionar | null;
  retroalimentacion: string;
  puntaje: number;
  orden: number;
  // NOTA: respuestaCorrecta NUNCA se expone al cliente mientras se responde el examen
}

export interface QuestionConRespuesta extends Question {
  respuestaCorrecta:
    | RespuestaVF
    | RespuestaOpcionMultiple
    | RespuestaRelacionar
    | RespuestaCompletar
    | RespuestaCaso;
}

export interface Evaluation {
  id: string;
  courseId?: string | null;
  titulo: string;
  tipo: string;
  tiempoLimite: number;
  preguntas: Question[];
}

export interface RespuestaEstudiante {
  questionId: string;
  valor: unknown; // boolean | number | number[] | string, según el tipo
}

export interface ResultadoPregunta {
  questionId: string;
  correcta: boolean;
  puntajeObtenido: number;
  puntajeMaximo: number;
  retroalimentacion: string;
}

export interface ResultadoEvaluacion {
  puntaje: number; // porcentaje 0-100
  aprobado: boolean;
  resultadosPorPregunta: ResultadoPregunta[];
}

const UMBRAL_APROBACION = 70; // % mínimo para aprobar, regla de negocio del dominio

function normalizarTexto(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita tildes para comparación de "completar"
}

/** Reglas de negocio de calificación automática (Fase 5, Sección "Calificación automática") */
export class EvaluationRules {
  static calificarPregunta(
    pregunta: QuestionConRespuesta,
    valorEstudiante: unknown
  ): ResultadoPregunta {
    let correcta = false;

    switch (pregunta.tipo) {
      case "VF": {
        const rc = pregunta.respuestaCorrecta as RespuestaVF;
        correcta = Boolean(valorEstudiante) === rc.esVerdadero;
        break;
      }
      case "OPCION_MULTIPLE":
      case "CASO": {
        const rc = pregunta.respuestaCorrecta as RespuestaOpcionMultiple;
        correcta = Number(valorEstudiante) === rc.indiceCorrecto;
        break;
      }
      case "RELACIONAR": {
        const rc = pregunta.respuestaCorrecta as RespuestaRelacionar;
        const pares = Array.isArray(valorEstudiante) ? (valorEstudiante as number[]) : [];
        correcta =
          pares.length === rc.pares.length && pares.every((p, i) => p === rc.pares[i]);
        break;
      }
      case "COMPLETAR": {
        const rc = pregunta.respuestaCorrecta as RespuestaCompletar;
        const respuesta = typeof valorEstudiante === "string" ? valorEstudiante : "";
        correcta = rc.aceptadas.some((a) => normalizarTexto(a) === normalizarTexto(respuesta));
        break;
      }
    }

    return {
      questionId: pregunta.id,
      correcta,
      puntajeObtenido: correcta ? pregunta.puntaje : 0,
      puntajeMaximo: pregunta.puntaje,
      retroalimentacion: pregunta.retroalimentacion,
    };
  }

  static calificarEvaluacion(
    preguntas: QuestionConRespuesta[],
    respuestas: RespuestaEstudiante[]
  ): ResultadoEvaluacion {
    const resultadosPorPregunta = preguntas.map((p) => {
      const respuesta = respuestas.find((r) => r.questionId === p.id);
      return this.calificarPregunta(p, respuesta?.valor);
    });

    const puntajeMaximoTotal = resultadosPorPregunta.reduce((s, r) => s + r.puntajeMaximo, 0);
    const puntajeObtenidoTotal = resultadosPorPregunta.reduce((s, r) => s + r.puntajeObtenido, 0);
    const puntaje =
      puntajeMaximoTotal === 0 ? 0 : Math.round((puntajeObtenidoTotal / puntajeMaximoTotal) * 100);

    return {
      puntaje,
      aprobado: puntaje >= UMBRAL_APROBACION,
      resultadosPorPregunta,
    };
  }
}
