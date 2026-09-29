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
  tipo: "LECCION" | "MODULO" | "GLOSARIO" | "FAQ" | "ARTICULO";
  titulo: string;
  texto: string;
  url: string;
}

export interface RespuestaChat {
  respuesta: string;
  fuentes: { titulo: string; url: string; tipo: FragmentoContexto["tipo"] }[];
  modo: "ia" | "basico";
}

export const LIMITES_CHAT = {
  maxCaracteresMensaje: 1500,
  maxMensajesHistorial: 12,
  maxCaracteresFragmento: 700,
  maxFragmentos: 6,
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

  static construirPromptSistema(fragmentos: FragmentoContexto[], paginaActual?: string | null): string {
    const contexto =
      fragmentos.length === 0
        ? "(No se encontró contenido de la plataforma directamente relacionado con esta consulta.)"
        : fragmentos.map((f, i) => `[${i + 1}] ${f.tipo} — ${f.titulo}\n${f.texto}`).join("\n\n");

    return [
      "Eres el asistente educativo de una plataforma universitaria sobre legislación informática, con énfasis en el Ecuador",
      "(Constitución, Ley Orgánica de Protección de Datos Personales, COIP, Ley de Comercio Electrónico, Firmas Electrónicas",
      "y Mensajes de Datos, propiedad intelectual, ciberseguridad y ética digital).",
      "",
      "Reglas:",
      "- Responde en español, de forma clara, didáctica y breve (máximo 3 párrafos o una lista corta), adaptada a estudiantes.",
      "- Básate prioritariamente en el CONTENIDO DE LA PLATAFORMA de abajo y menciona el recurso cuando lo uses (por ejemplo, \"según el glosario…\").",
      "- Si el contenido no cubre la consulta, puedes usar conocimiento general, indicándolo, y sin inventar artículos, números de ley ni fechas.",
      "  Si no estás seguro de un dato normativo concreto, dilo y sugiere revisar la Biblioteca de la plataforma.",
      "- Eres una herramienta de apoyo, no un sustituto de las evaluaciones: si te piden resolver una pregunta de evaluación o",
      "  autoevaluación, NO indiques la opción correcta; explica los conceptos necesarios para que el estudiante razone la respuesta.",
      "- Si la consulta no tiene relación con legislación informática o con la plataforma, indícalo amablemente y reconduce la conversación.",
      "- No des asesoría legal para casos personales concretos; recomienda consultar a un profesional del derecho.",
      paginaActual ? `\nEl estudiante está viendo: ${paginaActual}` : "",
      "",
      "CONTENIDO DE LA PLATAFORMA:",
      contexto,
    ].join("\n");
  }

  /** Respuesta sin IA: muestra los fragmentos encontrados en la plataforma. */
  static respuestaModoBasico(fragmentos: FragmentoContexto[]): string {
    if (fragmentos.length === 0) {
      return (
        "No encontré contenido de la plataforma relacionado con tu consulta. Prueba con otras palabras clave " +
        "(por ejemplo: \"datos personales\", \"firma electrónica\", \"delito informático\") o revisa el Glosario y la Biblioteca."
      );
    }
    const partes = fragmentos.slice(0, 3).map((f) => `• ${f.titulo}: ${f.texto.slice(0, 280)}${f.texto.length > 280 ? "…" : ""}`);
    return `Esto es lo que encontré en la plataforma sobre tu consulta:\n\n${partes.join("\n\n")}`;
  }
}
