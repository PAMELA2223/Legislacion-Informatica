// Validación de la estructura de una pregunta antes de guardarla. Vive en el
// dominio porque "una pregunta sin respuesta correcta válida" es una regla de
// negocio, no un detalle de la base de datos: evita preguntas imposibles de
// responder (índice fuera de rango, alternativas vacías, pares incompletos...).

import type { TipoPregunta } from "./evaluation.entity";

export interface DatosPreguntaEntrada {
  tipo: TipoPregunta;
  enunciado: string;
  opciones: unknown;
  respuestaCorrecta: unknown;
  retroalimentacion: string;
  puntaje: number;
}

export const TIPOS_PREGUNTA: TipoPregunta[] = ["VF", "OPCION_MULTIPLE", "RELACIONAR", "COMPLETAR", "CASO"];

const MIN_ALTERNATIVAS = 2;
const MAX_ALTERNATIVAS = 8;

function esTextoNoVacio(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function esEnteroEnRango(v: unknown, min: number, max: number): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
}

/**
 * Devuelve la pregunta normalizada (textos recortados) o lanza un Error con
 * un mensaje claro para el administrador.
 */
export function validarPregunta(data: Partial<DatosPreguntaEntrada> | null | undefined): DatosPreguntaEntrada {
  if (!data) throw new Error("Datos de la pregunta vacíos.");
  const { tipo } = data;
  if (!tipo || !TIPOS_PREGUNTA.includes(tipo)) throw new Error("Tipo de pregunta inválido.");
  if (!esTextoNoVacio(data.enunciado)) throw new Error("El enunciado es obligatorio.");
  if (!esTextoNoVacio(data.retroalimentacion)) throw new Error("La retroalimentación es obligatoria.");
  const puntaje = Number(data.puntaje);
  if (!Number.isInteger(puntaje) || puntaje < 1) throw new Error("El puntaje debe ser un número entero mayor o igual a 1.");

  const rc = (data.respuestaCorrecta ?? null) as Record<string, unknown> | null;
  if (!rc || typeof rc !== "object") throw new Error("La respuesta correcta es obligatoria.");

  let opciones: unknown = null;
  let respuestaCorrecta: unknown;

  switch (tipo) {
    case "VF": {
      if (typeof rc.esVerdadero !== "boolean") throw new Error("Indica si la afirmación es verdadera o falsa.");
      respuestaCorrecta = { esVerdadero: rc.esVerdadero };
      break;
    }
    case "OPCION_MULTIPLE":
    case "CASO": {
      const op = (data.opciones ?? {}) as { alternativas?: unknown };
      const alternativas = Array.isArray(op.alternativas) ? op.alternativas : [];
      if (alternativas.length < MIN_ALTERNATIVAS) {
        throw new Error(`Agrega al menos ${MIN_ALTERNATIVAS} opciones de respuesta.`);
      }
      if (alternativas.length > MAX_ALTERNATIVAS) {
        throw new Error(`Máximo ${MAX_ALTERNATIVAS} opciones de respuesta.`);
      }
      if (!alternativas.every(esTextoNoVacio)) throw new Error("Ninguna opción de respuesta puede quedar vacía.");
      if (!esEnteroEnRango(rc.indiceCorrecto, 0, alternativas.length - 1)) {
        throw new Error("Marca cuál de las opciones es la respuesta correcta.");
      }
      opciones = { alternativas: (alternativas as string[]).map((a) => a.trim()) };
      respuestaCorrecta = { indiceCorrecto: rc.indiceCorrecto };
      break;
    }
    case "RELACIONAR": {
      const op = (data.opciones ?? {}) as { columnaIzquierda?: unknown; columnaDerecha?: unknown };
      const izq = Array.isArray(op.columnaIzquierda) ? op.columnaIzquierda : [];
      const der = Array.isArray(op.columnaDerecha) ? op.columnaDerecha : [];
      const pares = Array.isArray(rc.pares) ? rc.pares : [];
      if (izq.length < 2) throw new Error("Agrega al menos 2 pares para relacionar.");
      if (izq.length !== der.length) throw new Error("Ambas columnas deben tener la misma cantidad de elementos.");
      if (![...izq, ...der].every(esTextoNoVacio)) throw new Error("Ningún elemento de las columnas puede quedar vacío.");
      const esPermutacion =
        pares.length === izq.length &&
        pares.every((p) => esEnteroEnRango(p, 0, der.length - 1)) &&
        new Set(pares).size === pares.length;
      if (!esPermutacion) throw new Error("Cada concepto debe relacionarse con una definición distinta.");
      opciones = {
        columnaIzquierda: (izq as string[]).map((x) => x.trim()),
        columnaDerecha: (der as string[]).map((x) => x.trim()),
      };
      respuestaCorrecta = { pares };
      break;
    }
    case "COMPLETAR": {
      const aceptadas = Array.isArray(rc.aceptadas) ? rc.aceptadas.filter(esTextoNoVacio) : [];
      if (aceptadas.length === 0) throw new Error("Agrega al menos una respuesta aceptada.");
      respuestaCorrecta = { aceptadas: (aceptadas as string[]).map((a) => a.trim()) };
      break;
    }
  }

  return {
    tipo,
    enunciado: data.enunciado.trim(),
    retroalimentacion: data.retroalimentacion.trim(),
    puntaje,
    opciones,
    respuestaCorrecta,
  };
}
