import { CONCEPTOS, COMPARACIONES, comparacion } from "./chatbot-knowledge";
import type { ConsultaInterpretada, Intencion } from "./chatbot-interpreter";

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
    if (terminos.length < 2) {
      const anterior = [...historial].reverse().find((m, i) => i > 0 && m.role === "user");
      if (anterior) terminos.push(...this.extraerTerminos(anterior.content));
      if (pagina) terminos.push(...this.extraerTerminos(pagina.titulo));
    }
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
      "respuesta-evaluacion":
        "El estudiante pide la respuesta de una evaluación. NO la des (ni la letra, ni la opción, ni \"verdadero/falso\"). Dile amablemente que no puedes resolver evaluaciones y explica en 2-3 frases el concepto que necesita para razonarla por sí mismo.",
      diferencia:
        "El estudiante pide una DIFERENCIA. Compara de forma directa: una frase por concepto y luego la diferencia clave en una frase. Si ayuda, termina con un ejemplo cotidiano que muestre la diferencia.",
      ejemplo:
        "El estudiante pide un EJEMPLO" + (consulta.temaDelHistorial ? " del tema del que venían hablando" : "") + ". Da un ejemplo concreto y cotidiano (2-3 frases) y explica en una frase por qué encaja con el concepto. No repitas la definición completa.",
      simplificar:
        "El estudiante pide una explicación MÁS SENCILLA" + (consulta.temaDelHistorial ? " de lo anterior" : "") + ". Usa palabras cotidianas, frases cortas y, si ayuda, una comparación con algo de la vida diaria. Máximo 3 frases, sin tecnicismos.",
      situacion:
        "El estudiante describe una SITUACIÓN. Primero identifica qué es (por ejemplo, \"esto es un caso de phishing\"), explícalo en una frase, luego indica qué puede hacer en 2-3 pasos concretos y, si corresponde, qué norma lo protege.",
      definicion:
        "El estudiante pide qué es algo. Da una definición clara en 1-2 frases y, si es útil, un ejemplo breve de la vida real.",
      general:
        "Interpreta qué necesita el estudiante y responde específicamente a eso, de forma breve.",
    };

    const paginaTexto = pagina
      ? pagina.tipo === "evaluacion"
        ? `\nCONTEXTO: el estudiante está RESOLVIENDO la evaluación del módulo "${pagina.titulo}". Extrema el cuidado de no dar respuestas.`
        : `\nCONTEXTO DEL MÓDULO ACTUAL: el estudiante está estudiando el módulo "${pagina.titulo}" (${pagina.descripcion}). Si la pregunta es vaga ("este derecho", "este tema", "esto"), interprétala según este módulo.` +
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
      "- Usa como base las FICHAS y el CONTENIDO DE LA PLATAFORMA. Si usas conocimiento general, no inventes artículos, números de ley ni fechas; si no estás seguro de un dato normativo, dilo.",
      "- Eres una herramienta de apoyo, no un sustituto de las evaluaciones: nunca indiques la respuesta correcta de una pregunta de evaluación o autoevaluación; explica el concepto para que el estudiante razone.",
      "- No des asesoría legal para un caso personal grave: orienta en términos generales y sugiere acudir a la entidad competente o a un profesional.",
      "- Si la pregunta no tiene relación con legislación informática ni con la plataforma, dilo amablemente en una frase y ofrece ayuda con un tema del curso.",
      "",
      `QUÉ PIDE AHORA EL ESTUDIANTE: ${INSTRUCCION_INTENCION[consulta.intencion]}`,
      coincideConEvaluacion
        ? "\nATENCIÓN: el mensaje coincide con una pregunta de una evaluación de la plataforma. No indiques cuál es la opción correcta; explica solo el concepto relacionado."
        : "",
      paginaTexto,
      fichas ? `\nFICHAS DE CONCEPTOS (verificadas):\n${fichas}` : "",
      comp ? `\nDIFERENCIA CLAVE (verificada): ${comp}` : "",
      "",
      "CONTENIDO DE LA PLATAFORMA:",
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
  static respuestaModoBasico(consulta: ConsultaInterpretada, fragmentos: FragmentoContexto[], pagina: ContextoPagina | null = null): string {
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

    if (fragmentos.length > 0) {
      const f = fragmentos[0];
      const breve = f.texto.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
      return `Según ${f.tipo === "GLOSARIO" ? "el glosario" : "el contenido de la plataforma"} (${f.titulo}): ${breve}`;
    }

    return (
      (pagina ? `No encontré información sobre eso en el módulo "${pagina.titulo}". ` : "No reconocí el tema de tu consulta. ") +
      "Prueba a preguntarlo de otra forma, por ejemplo: \"¿qué es el phishing?\", \"ponme un ejemplo de delito informático\" o " +
      "\"¿qué hago si publican mis datos sin permiso?\"."
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

  /** Botones de seguimiento según lo que se acaba de responder. */
  static sugerencias(consulta: ConsultaInterpretada): string[] {
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
