// Interpretación de la consulta del estudiante (reglas puras, sin red):
//   - QUÉ pide: definición, ejemplo, explicación más sencilla, diferencia,
//     orientación ante una situación, o la respuesta de una evaluación;
//   - DE QUÉ habla: conceptos de la base de conocimiento, detectados también
//     por señales indirectas ("me llegó un correo pidiendo mi contraseña");
//   - en preguntas de seguimiento ("ponme un ejemplo", "¿y la diferencia?")
//     recupera el tema de los mensajes anteriores.

import { CONCEPTOS, type Concepto } from "./chatbot-knowledge";
import type { MensajeChat } from "./chatbot.entity";

export type Intencion =
  | "respuesta-evaluacion"
  | "diferencia"
  | "ejemplo"
  | "simplificar"
  | "situacion"
  | "definicion"
  | "general";

export interface ConsultaInterpretada {
  intencion: Intencion;
  conceptos: Concepto[]; // máx. 2, el más relevante primero
  /** El tema viene de mensajes anteriores (pregunta de seguimiento). */
  temaDelHistorial: boolean;
  /** El tema se tomó del módulo que el estudiante está estudiando ("explícame este tema"). */
  temaDelModulo?: boolean;
}

/** minúsculas, sin tildes, espacios simples: "¿Qué es PHISHING?" → "que es phishing" */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const PATRONES: [Exclude<Intencion, "definicion" | "general">, RegExp][] = [
  [
    "respuesta-evaluacion",
    /\b(respuesta|opcion|alternativa|literal)s? (correcta|correctas|buena|es la)\b|\bcual es la (respuesta|opcion|correcta)\b|\bpregunta (\d+|numero)\b|\b(resuelve|resuelveme|contesta|contestame|haz|hazme)( me)? (la|mi|el) (evaluacion|autoevaluacion|prueba|examen|test)\b|\b(dame|pasame) las respuestas\b|\brespuestas de (la|mi) (evaluacion|autoevaluacion|prueba|examen)\b/,
  ],
  ["diferencia", /\bdiferencia(s)?\b|\bdiferencian?\b|\bdistingu|\bcompara(r|cion)?\b|\bversus\b|\bvs\b|\bno es lo mismo\b|\bes lo mismo\b/],
  ["ejemplo", /\bejemplo(s)?\b|\bcaso (real|practico|concreto)\b|\bun caso\b|\bponme un\b|\bdame un caso\b/],
  [
    "simplificar",
    /\bmas (facil|sencill\w*|simple|claro)\b|\b(manera|forma) (mas )?(sencilla|simple|facil|clara)\b|\bsencillamente\b|\bno (lo )?entiendo\b|\bno (lo )?entendi\b|\bpalabras (simples|sencillas)\b|\bcomo (a|para) un nino\b|\bsimplifica\b|\bresumido\b/,
  ],
  [
    "situacion",
    /\bme (llego|paso|hackearon|robaron|estafaron|escribieron|enviaron|pidieron|piden|amenazan|acosan|suplantaron|publicaron|insultan)\b|\bque (hago|puedo hacer|debo hacer|deberia hacer|hacer si)\b|\balguien (publico|uso|subio|comparte|compartio|me|esta|creo|entro)\b|\bsi alguien\b|\bmi cuenta\b|\brecibi\b|\bque tipo de (situacion|riesgo|caso|delito|problema)\b|\bque riesgo\b|\buna persona (recibe|recibio|publica|publico|usa|uso|compra|compro|descarga|descargo)\b|\bcaso\b.{0,40}\b(que|cual)\b|\bque puedo hacer\b|\ba donde (acudo|denuncio)\b|\bcomo denuncio\b/,
  ],
];

function detectarIntencion(textoNormalizado: string): Exclude<Intencion, "definicion" | "general"> | null {
  for (const [intencion, patron] of PATRONES) if (patron.test(textoNormalizado)) return intencion;
  return null;
}

/** Conceptos mencionados (directa o indirectamente), el más relevante primero. */
export function detectarConceptos(textoNormalizado: string, max = 2): Concepto[] {
  const puntuados: { c: Concepto; puntos: number }[] = [];
  for (const c of CONCEPTOS) {
    let puntos = 0;
    for (const s of [normalizar(c.nombre), ...c.senales]) {
      if (new RegExp(`(^|\\s)${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`).test(textoNormalizado)) {
        puntos = Math.max(puntos, s.length); // la coincidencia más específica pesa más
      }
    }
    // Pistas combinadas (una palabra de cada grupo), con peso moderado.
    if (puntos === 0 && c.combinaciones?.every((grupo) => grupo.some((p) => new RegExp(`(^|\\s)${p}(\\s|$)`).test(textoNormalizado)))) {
      puntos = 12;
    }
    if (puntos > 0) puntuados.push({ c, puntos });
  }
  return puntuados.sort((a, b) => b.puntos - a.puntos).slice(0, max).map((p) => p.c);
}

/** Mensajes de seguimiento cortos que no nombran un tema propio. */
function esSeguimiento(textoNormalizado: string, intencion: Intencion | null): boolean {
  const palabras = textoNormalizado.split(" ").filter(Boolean).length;
  return palabras <= 8 && (intencion === "ejemplo" || intencion === "simplificar" || intencion === "diferencia" || /\b(eso|esto|ese|este|esa|lo anterior)\b/.test(textoNormalizado));
}

export function interpretarConsulta(historial: MensajeChat[]): ConsultaInterpretada {
  const ultimo = historial[historial.length - 1]?.content ?? "";
  const texto = normalizar(ultimo);
  const intencionDetectada = detectarIntencion(texto);
  let conceptos = detectarConceptos(texto);
  let temaDelHistorial = false;

  // Seguimiento: completar con el tema de la conversación. Primero las
  // preguntas anteriores del ESTUDIANTE (lo que él preguntó) y solo después
  // las respuestas del asistente: una respuesta puede mencionar otros
  // conceptos en sus ejemplos y desviar el tema.
  const faltaSegundoParaComparar = intencionDetectada === "diferencia" && conceptos.length === 1;
  if ((conceptos.length === 0 || faltaSegundoParaComparar) && esSeguimiento(texto, intencionDetectada)) {
    const necesarios = intencionDetectada === "diferencia" ? 2 : 1;
    const anteriores = historial.slice(0, -1).reverse();
    const enOrden = [...anteriores.filter((m) => m.role === "user"), ...anteriores.filter((m) => m.role === "assistant")];
    for (const m of enOrden) {
      for (const c of detectarConceptos(normalizar(m.content))) {
        if (conceptos.length >= necesarios) break;
        if (!conceptos.some((x) => x.id === c.id)) {
          conceptos = [...conceptos, c];
          temaDelHistorial = true;
        }
      }
      if (conceptos.length >= necesarios) break;
    }
  }

  const intencion: Intencion = intencionDetectada ?? (conceptos.length ? "definicion" : "general");
  return { intencion, conceptos, temaDelHistorial };
}

/**
 * ¿Qué proporción de la pregunta de evaluación aparece en el mensaje? (0–1)
 * Se mide sobre la pregunta de evaluación (no sobre el mensaje) y se exigen
 * preguntas con contenido suficiente, para no confundir consultas cortas y
 * legítimas ("¿qué es un dato personal?") con una pregunta copiada.
 */
export function coincidenciaConPregunta(mensaje: string, preguntaEvaluacion: string): number {
  const tokens = (t: string) => new Set(normalizar(t).split(" ").filter((p) => p.length >= 4));
  const M = tokens(mensaje);
  const P = tokens(preguntaEvaluacion);
  if (P.size < 5 || M.size < 4) return 0;
  let comunes = 0;
  for (const t of P) if (M.has(t)) comunes++;
  return comunes / P.size;
}

export const UMBRAL_COINCIDENCIA_EVALUACION = 0.7;

/**
 * Si la consulta no nombra un tema ("explícame este tema de forma sencilla",
 * "dame un ejemplo") y el estudiante está dentro de un módulo, se usa el tema
 * de ese módulo.
 */
export function completarConTemaDelModulo(
  consulta: ConsultaInterpretada,
  modulo: { titulo: string; descripcion: string } | null
): ConsultaInterpretada {
  if (consulta.conceptos.length > 0 || !modulo || consulta.intencion === "respuesta-evaluacion") return consulta;
  const conceptos = detectarConceptos(normalizar(`${modulo.titulo} ${modulo.descripcion}`), 1);
  if (conceptos.length === 0) return consulta;
  return {
    ...consulta,
    conceptos,
    temaDelModulo: true,
    intencion: consulta.intencion === "general" ? "definicion" : consulta.intencion,
  };
}
