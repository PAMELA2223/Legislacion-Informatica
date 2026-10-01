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
  | "saludo"
  | "capacidades"
  | "cortesia"
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
  /**
   * El mensaje depende de lo conversado antes ("¿y un ejemplo?", "explícalo
   * más fácil"). Solo en ese caso se usa la conversación previa para buscar.
   */
  esSeguimiento: boolean;
}

/** Saludos, "¿qué puedes hacer?" y cortesías: se responden sin buscar contenido ni llamar a la IA. */
export const INTENCIONES_SOCIALES: Intencion[] = ["saludo", "capacidades", "cortesia"];

const FRASES_SOCIALES: [Intencion, RegExp][] = [
  [
    "capacidades",
    /\b(que|en que) (me )?(puedes|podrias|sabes) (hacer|ayudar\w*)\b|\bque puedes hacer\b|\bcomo (me )?(puedes )?ayudar\w*\b|\bquien eres\b|\bque eres\b|\bpara que sirves\b|\bque sabes\b|\bcomo funcionas\b|\bque haces\b/,
  ],
  ["cortesia", /\b(muchas )?gracias\b|\badios\b|\bchao\b|\bhasta (luego|pronto|manana)\b|\bnos vemos\b/],
  [
    "saludo",
    /\b(hola|holi|holis|hello|hey|saludos|buenas|buen dia|buenos dias|buenas tardes|buenas noches)\b|\bque tal\b|\bcomo (estas|esta|te va|andas)\b/,
  ],
];

// Palabras que pueden acompañar a un saludo sin convertirlo en pregunta.
const RELLENO_SOCIAL = new Set([
  "hola", "holi", "holis", "hello", "hey", "saludos", "buenas", "buen", "buenos", "dia", "dias", "tardes", "noches",
  "que", "tal", "como", "estas", "esta", "te", "va", "andas", "muchas", "gracias", "adios", "chao", "hasta", "luego",
  "pronto", "manana", "nos", "vemos", "puedes", "podrias", "sabes", "hacer", "ayudar", "ayudarme", "ayudas", "me", "en",
  "quien", "eres", "para", "sirves", "funcionas", "haces", "asistente", "chatbot", "bot", "profe", "amigo", "y", "tu",
  "usted", "ok", "okay", "vale", "bueno", "listo", "perfecto", "genial", "super", "a", "el", "la", "por", "favor", "ahi",
  "todo", "bien", "muy", "si", "no", "de", "nada", "oye", "mira", "ayuda", "necesito",
]);

/**
 * ¿El mensaje es SOLO un saludo, una pregunta sobre lo que puede hacer el
 * asistente o una cortesía? ("hola, ¿qué es el phishing?" NO lo es: tiene
 * una pregunta propia).
 */
export function detectarMensajeSocial(textoNormalizado: string): Intencion | null {
  const palabras = textoNormalizado.split(" ").filter(Boolean);
  if (palabras.length === 0 || palabras.length > 12) return null;
  if (palabras.some((p) => !RELLENO_SOCIAL.has(p))) return null;
  for (const [intencion, patron] of FRASES_SOCIALES) if (patron.test(textoNormalizado)) return intencion;
  return null;
}

/** Palabras del ámbito de la plataforma: sirven para distinguir una pregunta "sin información" de una fuera de tema. */
const VOCABULARIO_DEL_DOMINIO = [
  "ley", "leyes", "legal", "ilegal", "derecho", "derechos", "delito", "delitos", "juridic", "norma", "normativa", "codigo",
  "constitucion", "coip", "lopdp", "sancion", "multa", "pena", "denuncia", "juez", "fiscalia", "contrato", "dato", "datos",
  "privacidad", "intimidad", "informatic", "digital", "internet", "red", "redes", "web", "sistema", "seguridad", "ciber",
  "hacker", "hack", "virus", "malware", "contrasena", "clave", "cuenta", "correo", "mensaje", "phishing", "estafa", "fraude",
  "robo", "firma", "electronic", "comercio", "compra", "tienda", "propiedad", "autor", "plagio", "pirateria", "licencia",
  "software", "tecnolog", "aplicacion", "app", "celular", "computador", "dispositivo", "informacion", "consentimiento",
  "acoso", "suplant", "identidad", "foto", "imagen", "video", "publicar", "publico", "permiso", "autorizacion", "modulo",
  "tema", "evaluacion", "leccion", "contenido", "plataforma", "etica", "ciudadania",
];

export function esDelDominio(textoNormalizado: string): boolean {
  const palabras = textoNormalizado.split(" ");
  return palabras.some((p) => VOCABULARIO_DEL_DOMINIO.some((v) => p === v || (v.length >= 4 && p.startsWith(v))));
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

  // 1. Primero se analiza el MENSAJE ACTUAL: un saludo es un saludo, aunque
  //    antes se haya hablado de otro tema (no se continúa la conversación anterior).
  const social = detectarMensajeSocial(texto);
  if (social) return { intencion: social, conceptos: [], temaDelHistorial: false, esSeguimiento: false };

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
  return { intencion, conceptos, temaDelHistorial, esSeguimiento: esSeguimiento(texto, intencionDetectada) && historial.length > 1 };
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
  modulo: { titulo: string; descripcion: string } | null,
  mensaje = ""
): ConsultaInterpretada {
  if (consulta.conceptos.length > 0 || !modulo) return consulta;
  if (consulta.intencion === "respuesta-evaluacion" || INTENCIONES_SOCIALES.includes(consulta.intencion)) return consulta;
  // El módulo es contexto SECUNDARIO: solo se toma su tema si el estudiante
  // se refiere a él ("este tema", "esto", "el módulo") o pide un ejemplo /
  // una explicación sencilla sin nombrar otro tema.
  const texto = normalizar(mensaje);
  const seRefiereAlModulo = /\b(este|esta|esto|ese|esa|eso|aqui|modulo|leccion)\b/.test(texto);
  const pideAlgoDelTema = consulta.intencion === "ejemplo" || consulta.intencion === "simplificar";
  if (!seRefiereAlModulo && !pideAlgoDelTema) return consulta;
  const conceptos = detectarConceptos(normalizar(`${modulo.titulo} ${modulo.descripcion}`), 1);
  if (conceptos.length === 0) return consulta;
  return {
    ...consulta,
    conceptos,
    temaDelModulo: true,
    intencion: consulta.intencion === "general" ? "definicion" : consulta.intencion,
  };
}
