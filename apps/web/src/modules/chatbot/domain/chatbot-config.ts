// Configuración del asistente (editable por el administrador) y resumen de
// estadísticas de uso. Reglas puras.

export const FUENTES_CHATBOT = ["CONOCIMIENTO", "LECCIONES", "GLOSARIO", "FAQ", "BIBLIOTECA", "CASOS"] as const;
export type FuenteChatbot = (typeof FUENTES_CHATBOT)[number];

export const ETIQUETAS_FUENTE: Record<FuenteChatbot, { nombre: string; detalle: string }> = {
  CONOCIMIENTO: { nombre: "Base de conocimiento del asistente", detalle: "16 conceptos verificados con definición, ejemplo y normativa ecuatoriana." },
  LECCIONES: { nombre: "Contenido de los módulos", detalle: "Lecciones de texto y descripción de los módulos activos (incluye el contexto del módulo que se está estudiando)." },
  GLOSARIO: { nombre: "Glosario", detalle: "Términos y definiciones del glosario." },
  FAQ: { nombre: "Preguntas frecuentes", detalle: "Preguntas frecuentes publicadas." },
  BIBLIOTECA: { nombre: "Biblioteca normativa", detalle: "Artículos de las normas cargadas en la Biblioteca." },
  CASOS: { nombre: "Casos prácticos", detalle: "Escenario y normativa de los casos (nunca su respuesta correcta)." },
};

export interface ConfigChatbot {
  activo: boolean;
  fuentes: FuenteChatbot[];
}

export const CONFIG_POR_DEFECTO: ConfigChatbot = { activo: true, fuentes: [...FUENTES_CHATBOT] };

export function validarConfig(data: unknown): ConfigChatbot {
  const d = (data ?? {}) as { activo?: unknown; fuentes?: unknown };
  if (typeof d.activo !== "boolean") throw new Error("Indica si el asistente está activo.");
  const fuentes = Array.isArray(d.fuentes)
    ? FUENTES_CHATBOT.filter((f) => (d.fuentes as unknown[]).includes(f))
    : [];
  if (d.activo && fuentes.length === 0) {
    throw new Error("Selecciona al menos un contenido para que el asistente pueda responder.");
  }
  return { activo: d.activo, fuentes };
}

// ---------------- Estadísticas de uso ----------------

export interface RegistroConsulta {
  userId: string;
  fecha: Date;
  modo: string;
  intencion: string;
  tema: string | null;
  conInformacion: boolean;
}

export interface EstadisticasChatbot {
  total: number;
  ultimos7Dias: number;
  estudiantes: number;
  sinInformacion: number;
  porcentajeSinInformacion: number | null;
  porIntencion: { intencion: string; total: number }[];
  temasFrecuentes: { tema: string; total: number }[];
}

export function resumirUso(registros: RegistroConsulta[], ahora: Date = new Date()): EstadisticasChatbot {
  const hace7 = ahora.getTime() - 7 * 24 * 60 * 60 * 1000;
  const contar = (claves: string[]) => {
    const m = new Map<string, number>();
    for (const k of claves) m.set(k, (m.get(k) ?? 0) + 1);
    return Array.from(m, ([k, total]) => ({ k, total })).sort((a, b) => b.total - a.total);
  };
  const sinInformacion = registros.filter((r) => !r.conInformacion).length;
  return {
    total: registros.length,
    ultimos7Dias: registros.filter((r) => r.fecha.getTime() >= hace7).length,
    estudiantes: new Set(registros.map((r) => r.userId)).size,
    sinInformacion,
    porcentajeSinInformacion: registros.length ? Math.round((sinInformacion / registros.length) * 100) : null,
    porIntencion: contar(registros.map((r) => r.intencion)).map(({ k, total }) => ({ intencion: k, total })),
    temasFrecuentes: contar(registros.map((r) => r.tema).filter((t): t is string => Boolean(t)))
      .slice(0, 8)
      .map(({ k, total }) => ({ tema: k, total })),
  };
}
