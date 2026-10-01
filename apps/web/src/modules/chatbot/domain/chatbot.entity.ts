import { CONCEPTOS, COMPARACIONES, comparacion } from "./chatbot-knowledge";
import { esDelDominio, normalizar, type ConsultaInterpretada, type Intencion } from "./chatbot-interpreter";

// Capa de DOMINIO del chatbot educativo sobre legislación informática.
// Aquí viven las reglas puras (sin red ni base de datos): qué mensajes se
// aceptan, cómo se arma el contexto con contenido de la plataforma y cómo se
// responde en "modo básico" cuando no hay un servicio de IA configurado.

export type RolMensaje = "user" | "assistant";

export interface MensajeChat {
  role: RolMensaje;
  content: string;
}

/** Fragmento de contenido real de la plataforma usado para fundamentar la respuesta. */
export interface FragmentoContexto {
  tipo: "LECCION" | "MODULO" | "GLOSARIO" | "FAQ" | "ARTICULO" | "CASO";
  titulo: string;
  texto: string;
  url: string;
}

/** Lo que el estudiante está viendo al preguntar (módulo o evaluación). */
export interface ContextoPagina {
  tipo: "modulo" | "evaluacion";
  titulo: string; // título del módulo
  descripcion: string;
  /** Extracto del contenido de texto del módulo (para interpretar "este derecho", "este tema"). */
  extracto: string;
}

export interface RespuestaChat {
  respuesta: string;
  fuentes: { titulo: string; url: string; tipo: FragmentoContexto["tipo"] }[];
  modo: "ia" | "basico";
  /** Sugerencias de seguimiento para mostrar como botones. */
  sugerencias?: string[];
}

/** Respuesta cuando el contenido disponible no alcanza (el asistente no inventa). */
export const MENSAJE_SIN_INFORMACION =
  "No encuentro información suficiente sobre ese tema dentro del contenido disponible. Puedes consultar el material del módulo correspondiente.";

/** Respuesta a una pregunta que no tiene relación con legislación informática. */
export const MENSAJE_FUERA_DE_TEMA =
  "Puedo ayudarte principalmente con temas de legislación informática, como delitos informáticos, protección de datos, privacidad, estafas digitales, comercio electrónico y propiedad intelectual. ¿Sobre cuál de estos temas tienes una duda?";

export const LIMITES_CHAT = {
  maxCaracteresMensaje: 1500,
  maxMensajesHistorial: 12,
  maxCaracteresFragmento: 700,
  maxFragmentos: 5,
  maxCaracteresExtractoModulo: 1500,
} as const;

const PALABRAS_VACIAS = new Set([
  "que", "qué", "cual", "cuál", "cuales", "cuáles", "como", "cómo", "para", "por", "con", "sin", "sobre", "entre",
  "los", "las", "una", "uno", "unos", "unas", "del", "este", "esta", "estos", "estas", "ese", "esa", "eso", "esto",
  "son", "es", "ser", "hay", "tiene", "tengo", "puedo", "puede", "explicame", "explícame", "ayudame", "ayúdame",
  "significa", "diferencia", "concepto", "tema", "contenido", "comprender", "entender", "dime", "quiero", "saber",
  "más", "mas", "muy", "pero", "también", "tambien", "cuando", "donde", "dónde", "porque", "porqué",
]);

export class ChatbotRules {
  /**
   * Valida y recorta el historial enviado por el cliente: solo roles válidos,
   * textos no vacíos y de longitud acotada, y que termine en un mensaje del
   * estudiante. Lanza Error si no hay nada válido que responder.
   */
  static normalizarHistorial(entrada: unknown): MensajeChat[] {
    const lista = Array.isArray(entrada) ? entrada : [];
    const mensajes = lista
      .filter(
        (m): m is MensajeChat =>
          Boolean(m) &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .map((m) => ({ role: m.role, content: m.content.trim().slice(0, LIMITES_CHAT.maxCaracteresMensaje) }))
      .slice(-LIMITES_CHAT.maxMensajesHistorial);

    // La API de mensajes exige empezar por "user": se descartan respuestas iniciales sueltas.
    while (mensajes.length && mensajes[0].role !== "user") mensajes.shift();
    if (mensajes.length === 0 || mensajes[mensajes.length - 1].role !== "user") {
      throw new Error("Escribe tu consulta.");
    }
    return mensajes;
  }

  /** Palabras significativas de la consulta para buscar contenido relacionado. */
  static extraerTerminos(texto: string, max = 8): string[] {
    const palabras = texto
      .toLowerCase()
      .normalize("NFC")
      .split(/[^a-záéíóúüñ0-9]+/i)
      .filter((p) => p.length >= 3 && !PALABRAS_VACIAS.has(p));
    return Array.from(new Set(palabras)).slice(0, max);
  }

  static recortarFragmentos(fragmentos: FragmentoContexto[]): FragmentoContexto[] {
    return fragmentos.slice(0, LIMITES_CHAT.maxFragmentos).map((f) => ({
      ...f,
      texto: f.texto.length > LIMITES_CHAT.maxCaracteresFragmento ? `${f.texto.slice(0, LIMITES_CHAT.maxCaracteresFragmento)}…` : f.texto,
    }));
  }

  /**
   * Palabras para buscar contenido de la plataforma: las de la pregunta, los
   * nombres y señales del concepto detectado y, si es una pregunta de
   * seguimiento o muy vaga, el tema anterior y el módulo que está viendo.
   */
  static terminosDeBusqueda(historial: MensajeChat[], consulta: ConsultaInterpretada, pagina: ContextoPagina | null): string[] {
    const ultimo = historial[historial.length - 1]?.content ?? "";
    const terminos = [...this.extraerTerminos(ultimo)];
    for (const c of consulta.conceptos) terminos.push(...this.extraerTerminos(c.nombre));
    // La conversación anterior solo se usa en preguntas de SEGUIMIENTO
    // ("¿y un ejemplo?"). Antes se usaba con cualquier mensaje corto, y así un
    // "hola" terminaba buscando el tema de la pregunta anterior.
    if (consulta.esSeguimiento && consulta.temaDelHistorial === false && consulta.conceptos.length === 0) {
      const anterior = [...historial].reverse().find((m, i) => i > 0 && m.role === "user");
      if (anterior) terminos.push(...this.extraerTerminos(anterior.content));
    }
    // El módulo actual es contexto secundario: solo se busca por su título si
    // la consulta tomó explícitamente su tema ("explícame este tema").
    if (consulta.temaDelModulo && pagina) terminos.push(...this.extraerTerminos(pagina.titulo));
    return Array.from(new Set(terminos)).slice(0, 10);
  }

  static construirPromptSistema(p: {
    fragmentos: FragmentoContexto[];
    consulta: ConsultaInterpretada;
    pagina: ContextoPagina | null;
    coincideConEvaluacion: boolean;
  }): string {
    const { fragmentos, consulta, pagina, coincideConEvaluacion } = p;

    // Si puede tratarse de una pregunta de evaluación, las fichas van sin la
    // normativa: la norma aplicable suele ser justamente la respuesta.
    const proteger = coincideConEvaluacion || consulta.intencion === "respuesta-evaluacion" || pagina?.tipo === "evaluacion";
    const fichas = consulta.conceptos
      .map(
        (c) =>
          `### ${c.nombre}\nDefinición: ${c.definicion}\nEn palabras sencillas: ${c.sencillo}` +
          (proteger ? "" : `\nEjemplo: ${c.ejemplo}`) +
          (!proteger && c.normativa ? `\nNormativa: ${c.normativa}` : "") +
          (!proteger && c.queHacer ? `\nQué hacer: ${c.queHacer.join(" / ")}` : "")
      )
      .join("\n\n");
    const comp =
      consulta.conceptos.length === 2 ? comparacion(consulta.conceptos[0].id, consulta.conceptos[1].id) : undefined;

    const contenido =
      fragmentos.length === 0
        ? "(No se encontró contenido de la plataforma directamente relacionado.)"
        : fragmentos.map((f, i) => `[${i + 1}] ${f.tipo} — ${f.titulo}\n${f.texto}`).join("\n\n");

    const INSTRUCCION_INTENCION: Record<Intencion, string> = {
      saludo: "El estudiante saluda. Responde al saludo en una frase y pregúntale sobre qué tema tiene dudas. No expliques ningún tema.",
      capacidades: "El estudiante pregunta qué puedes hacer. Explícalo en 2 frases, sin desarrollar ningún tema.",
      cortesia: "El estudiante agradece o se despide. Responde con una frase breve y cordial.",
      "respuesta-evaluacion":
        "El estudiante pide la respuesta de una evaluación. NO la des (ni la letra, ni la opción, ni \"verdadero/falso\"). Dile amablemente que no puedes resolver evaluaciones y explica en 2-3 frases el concepto que necesita para razonarla por sí mismo.",
      diferencia:
        "El estudiante pide una DIFERENCIA. Compara de forma directa: una frase por concepto y luego la diferencia clave en una frase. Si ayuda, termina con un ejemplo cotidiano que muestre la diferencia.",
      ejemplo:
        "El estudiante pide un EJEMPLO" + (consulta.temaDelHistorial ? " del tema del que venían hablando" : consulta.temaDelModulo ? " del tema del módulo que está estudiando" : "") + ". Da un ejemplo concreto y cotidiano (2-3 frases) y explica en una frase por qué encaja con el concepto. No repitas la definición completa.",
      simplificar:
        "El estudiante pide una explicación MÁS SENCILLA" + (consulta.temaDelHistorial ? " de lo anterior" : consulta.temaDelModulo ? " del tema del módulo que está estudiando" : "") + ". Usa palabras cotidianas, frases cortas y, si ayuda, una comparación con algo de la vida diaria. Máximo 3 frases, sin tecnicismos.",
      situacion:
        "El estudiante describe una SITUACIÓN o CASO. Identifica qué tipo de riesgo o problema es (por ejemplo, \"esto es un caso de phishing\"), menciona en una frase los elementos que intervienen (quién engaña, qué busca, por qué medio), luego indica 2-3 medidas concretas de prevención o qué hacer y, si corresponde, qué norma lo protege.",
      definicion:
        "El estudiante pide qué es algo. Da una definición clara en 1-2 frases y, si es útil, un ejemplo breve de la vida real.",
      general:
        "Interpreta qué necesita el estudiante y responde específicamente a eso, de forma breve.",
    };

    const paginaTexto = pagina
      ? pagina.tipo === "evaluacion"
        ? `\nCONTEXTO: el estudiante está RESOLVIENDO la evaluación del módulo "${pagina.titulo}". Extrema el cuidado de no dar respuestas.`
        : `\nCONTEXTO SECUNDARIO — MÓDULO ACTUAL: el estudiante está en el módulo "${pagina.titulo}" (${pagina.descripcion}). Úsalo SOLO si la pregunta trata de ese tema o es vaga ("este derecho", "este tema", "esto"). Si pregunta otra cosa, no lo menciones.` +
          (pagina.extracto ? `\nExtracto del módulo:\n${pagina.extracto}` : "")
      : "";

    return [
      "Eres el Asistente de Legislación Informática de una plataforma universitaria de Ecuador. Ayudas a estudiantes a comprender temas como protección de datos, privacidad, delitos informáticos, estafas digitales, phishing, comercio electrónico, firma electrónica, propiedad intelectual y seguridad informática.",
      "",
      "CÓMO RESPONDER:",
      "- En español, con lenguaje académico sencillo, como un buen tutor.",
      "- Responde EXACTAMENTE a lo que se pregunta. Interpreta el significado y el contexto: no te limites a definir si el estudiante pregunta otra cosa.",
      "- Sé breve: 2 a 5 frases para preguntas simples (máximo ~120 palabras). Solo extiéndete si el estudiante lo pide.",
      "- Incluye un ejemplo de la vida real cuando ayude a entender (una o dos frases).",
      "- Texto plano: sin títulos ni negritas con asteriscos. Si enumeras pasos, usa líneas que empiecen con \"• \".",
      "- Responde ÚNICAMENTE con base en las FICHAS, el CONTEXTO DEL MÓDULO y el CONTENIDO DE LA PLATAFORMA de abajo. No inventes artículos, números de ley, fechas ni datos.",
      `- Si esa información no alcanza para responder, dilo claramente con esta frase: "${MENSAJE_SIN_INFORMACION}" (puedes añadir una sugerencia breve de qué preguntar).`,
      "- Si el tema es complejo, explícalo en este orden: concepto → explicación sencilla → ejemplo práctico.",
      "- Eres una herramienta de apoyo, no un sustituto de las evaluaciones: nunca indiques la respuesta correcta de una pregunta de evaluación o autoevaluación; explica el concepto para que el estudiante razone.",
      "- No des asesoría legal para un caso personal grave: orienta en términos generales y sugiere acudir a la entidad competente o a un profesional.",
      `- Si la pregunta no tiene relación con legislación informática ni con la plataforma, responde con esta frase: "${MENSAJE_FUERA_DE_TEMA}"`,
      "- Responde SIEMPRE al ÚLTIMO mensaje del estudiante. Los mensajes anteriores solo sirven para entender referencias como \"eso\" o \"¿y un ejemplo?\"; si el último mensaje cambia de tema, responde al tema nuevo y no continúes el anterior.",
      "",
      `QUÉ PIDE AHORA EL ESTUDIANTE: ${INSTRUCCION_INTENCION[consulta.intencion]}`,
      coincideConEvaluacion
        ? "\nATENCIÓN: el mensaje coincide con una pregunta de una evaluación de la plataforma. No indiques cuál es la opción correcta; explica solo el concepto relacionado."
        : "",
      paginaTexto,
      fichas ? `\nFICHAS DE CONCEPTOS (verificadas):\n${fichas}` : "",
      comp ? `\nDIFERENCIA CLAVE (verificada): ${comp}` : "",
      "",
      "CONTENIDO DE LA PLATAFORMA (posiblemente relacionado; úsalo solo si responde a la pregunta actual):",
      contenido,
    ]
      .filter((l) => l !== "")
      .join("\n");
  }

  /**
   * Respuesta SIN servicio de IA. No es un buscador de palabras: usa la
   * interpretación de la consulta (intención + concepto, también por señales
   * indirectas) y la base de conocimiento curada; solo si no reconoce el tema
   * recurre a los fragmentos de la plataforma.
   */
  static respuestaModoBasico(
    consulta: ConsultaInterpretada,
    fragmentos: FragmentoContexto[],
    pagina: ContextoPagina | null = null,
    mensajeActual = ""
  ): string {
    const social = this.respuestaSocial(consulta, mensajeActual);
    if (social) return social;
    const [c1, c2] = consulta.conceptos;

    if (consulta.intencion === "respuesta-evaluacion") {
      return (
        "No puedo darte las respuestas de una evaluación: el objetivo es que puedas razonarlas tú. " +
        "Sí puedo explicarte el concepto que necesitas. Cuéntame de qué tema trata la pregunta " +
        "(por ejemplo: \"¿qué es el consentimiento?\") y te lo explico con un ejemplo."
      );
    }

    if (c1) {
      switch (consulta.intencion) {
        case "ejemplo":
          return `Ejemplo de ${c1.nombre.toLowerCase()}: ${c1.ejemplo}`;
        case "simplificar":
          return `${c1.sencillo} Por ejemplo: ${c1.ejemplo}`;
        case "diferencia": {
          if (c2) {
            const comp = comparacion(c1.id, c2.id);
            return (
              `• ${c1.nombre}: ${c1.definicion}\n• ${c2.nombre}: ${c2.definicion}` +
              (comp ? `\n\nDiferencia clave: ${comp}` : "")
            );
          }
          return `${c1.definicion} ¿Con qué otro concepto quieres compararlo? Por ejemplo, puedo compararlo con ${
            c1.id === "privacidad" ? "la protección de datos" : "la privacidad"
          }.`;
        }
        case "situacion": {
          const pasos = c1.queHacer?.length ? `\n\nQué puedes hacer:\n${c1.queHacer.map((q) => `• ${q}`).join("\n")}` : "";
          return `Por lo que describes, se relaciona con: ${c1.nombre.toLowerCase()}. ${c1.definicion}${pasos}${c1.normativa ? `\n\n${c1.normativa}` : ""}`;
        }
        default:
          return `${c1.definicion} Por ejemplo: ${c1.ejemplo}${c1.normativa ? ` ${c1.normativa}` : ""}`;
      }
    }

    // Solo se usa un fragmento si se relaciona con el MENSAJE ACTUAL (no con
    // la conversación anterior ni con el módulo por defecto).
    const f = this.fragmentoRelacionado(fragmentos, mensajeActual);
    if (f) {
      const breve = f.texto.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
      return `Según ${f.tipo === "GLOSARIO" ? "el glosario" : "el contenido de la plataforma"} (${f.titulo}): ${breve}`;
    }

    // Nada relacionado: ¿es un tema de la plataforma sin información, o algo fuera de tema?
    if (mensajeActual && !esDelDominio(normalizar(mensajeActual))) return MENSAJE_FUERA_DE_TEMA;

    return (
      `${MENSAJE_SIN_INFORMACION} ` +
      (pagina ? `Revisa el contenido del módulo "${pagina.titulo}" o ` : "También puedes ") +
      "preguntarlo de otra forma, por ejemplo: \"¿qué es el phishing?\" o \"¿qué hago si publican mis datos sin permiso?\"."
    );
  }

  /**
   * Respuesta sin IA cuando el mensaje coincide con una pregunta de
   * evaluación: no se revela la respuesta, solo una pista conceptual.
   */
  static respuestaEvaluacionProtegida(consulta: ConsultaInterpretada): string {
    const c = consulta.conceptos[0];
    return (
      "Esto parece una pregunta de una evaluación de la plataforma, así que no puedo indicarte la respuesta. " +
      (c ? `Te doy una pista para razonarla: ${c.sencillo} ` : "") +
      "Repasa el contenido del módulo y, si algún concepto no te queda claro, pregúntame por él."
    );
  }

  /** Respuestas a saludos, "¿qué puedes hacer?" y cortesías (sin IA ni búsqueda). */
  static respuestaSocial(consulta: ConsultaInterpretada, mensaje = ""): string | null {
    const t = normalizar(mensaje);
    switch (consulta.intencion) {
      case "saludo": {
        const comoEstas = /\bcomo (estas|esta|te va|andas)\b|\bque tal\b/.test(t);
        return (
          (comoEstas ? "¡Muy bien, gracias por preguntar! 👋 " : "¡Hola! 👋 ") +
          "Soy tu asistente de legislación informática. Estoy aquí para ayudarte a comprender los temas de la plataforma. ¿Sobre qué tema tienes alguna duda?"
        );
      }
      case "capacidades":
        return (
          "Puedo ayudarte a comprender los temas de legislación informática: explicarte un concepto (por ejemplo, qué es un delito informático), " +
          "darte ejemplos, explicarlo de forma más sencilla, comparar conceptos o analizar una situación, como un correo sospechoso. " +
          "No resuelvo las evaluaciones, pero sí te ayudo a entender los temas. ¿Por dónde quieres empezar?"
        );
      case "cortesia":
        return /\bgracias\b/.test(t)
          ? "¡De nada! 😊 Si tienes otra duda sobre legislación informática, aquí estoy."
          : "¡Hasta pronto! 👋 Cuando quieras, vuelve a preguntarme.";
      default:
        return null;
    }
  }

  /** El primer fragmento que contiene alguna palabra significativa del mensaje actual. */
  static fragmentoRelacionado(fragmentos: FragmentoContexto[], mensaje: string): FragmentoContexto | null {
    const raices = this.extraerTerminos(mensaje).map((t) => normalizar(t).slice(0, 5)).filter((r) => r.length >= 4);
    if (raices.length === 0) return null;
    return fragmentos.find((f) => raices.some((r) => normalizar(`${f.titulo} ${f.texto}`).includes(r))) ?? null;
  }

  /** Botones de seguimiento según lo que se acaba de responder. */
  static sugerencias(consulta: ConsultaInterpretada): string[] {
    if (consulta.intencion === "saludo" || consulta.intencion === "capacidades") {
      return ["¿Qué es un delito informático?", "¿Qué es la protección de datos?", "¿Qué es una estafa digital?"];
    }
    if (consulta.intencion === "respuesta-evaluacion" || consulta.conceptos.length === 0) return [];
    const s: string[] = [];
    if (consulta.intencion !== "ejemplo") s.push("Ponme un ejemplo");
    if (consulta.intencion !== "simplificar") s.push("Explícamelo más fácil");
    const c = consulta.conceptos[0];
    const par = Object.keys(COMPARACIONES).map((k) => k.split("|")).find((k) => k.includes(c.id));
    if (par && consulta.intencion !== "diferencia") {
      const otro = CONCEPTOS.find((x) => x.id === par.find((id) => id !== c.id));
      if (otro) s.push(`¿Qué diferencia hay con ${otro.nombre.toLowerCase()}?`);
    }
    return s.slice(0, 3);
  }
}
