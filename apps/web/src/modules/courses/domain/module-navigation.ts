// Reglas de navegación DENTRO de un módulo (qué contenido mostrar, en qué
// estado está cada uno y cuál es la siguiente acción del estudiante).
// Son funciones puras para poder probarlas sin navegador: la interfaz
// (module-learning-view.tsx) solo las consume.
//
// Principio: "el estudiante siempre sabe dónde está, qué completó y qué
// debe hacer después" → siempre existe UNA acción principal clara.

export type EstadoContenido = "completado" | "en-progreso" | "pendiente";

export interface ContenidoNavegable {
  id: string;
  completado: boolean;
}

export interface EstadoEvaluacionModulo {
  /** El módulo tiene evaluación con preguntas activas. */
  existe: boolean;
  aprobada: boolean;
  /** Ya se puede rendir (todo el contenido revisado y módulo desbloqueado). */
  disponible: boolean;
  href: string | null;
}

export type AccionPrincipal =
  | { tipo: "completar-y-continuar"; etiqueta: string }
  | { tipo: "siguiente"; etiqueta: string; indice: number }
  | { tipo: "ir-a-pendiente"; etiqueta: string; indice: number }
  | { tipo: "evaluacion"; etiqueta: string; href: string }
  | { tipo: "finalizar"; etiqueta: string };

/**
 * Contenido que se abre al entrar:
 * 1. el indicado en la URL (?contenido=N, empezando en 1) si es válido;
 * 2. si no, el primero sin completar;
 * 3. si todo está completo, el último (donde está el paso a la evaluación).
 */
export function indiceInicial(contenidos: ContenidoNavegable[], desdeUrl?: string | null): number {
  const n = Number(desdeUrl);
  if (desdeUrl && Number.isInteger(n) && n >= 1 && n <= contenidos.length) return n - 1;
  const i = contenidos.findIndex((c) => !c.completado);
  return i === -1 ? Math.max(0, contenidos.length - 1) : i;
}

export function estadoContenido(c: ContenidoNavegable, esActual: boolean): EstadoContenido {
  if (c.completado) return "completado";
  return esActual ? "en-progreso" : "pendiente";
}

export function estadoEvaluacion(ev: EstadoEvaluacionModulo): EstadoContenido {
  if (ev.aprobada) return "completado";
  return ev.disponible ? "en-progreso" : "pendiente";
}

export function resumenProgreso(contenidos: ContenidoNavegable[]) {
  const completados = contenidos.filter((c) => c.completado).length;
  const total = contenidos.length;
  return {
    completados,
    total,
    porcentaje: total === 0 ? 100 : Math.round((completados / total) * 100),
    todosCompletados: completados === total,
  };
}

/**
 * La acción principal (botón destacado) para el contenido que se está viendo.
 * - Contenido sin completar → "Completar y continuar" (o "Completar contenido" si es el último).
 * - Completado y hay siguiente → "Siguiente".
 * - Último completado pero quedan pendientes → ir al primero pendiente.
 * - Todo completado → ir a la evaluación, o finalizar si el módulo no tiene.
 */
export function accionPrincipal(
  contenidos: ContenidoNavegable[],
  indiceActual: number,
  evaluacion: EstadoEvaluacionModulo
): AccionPrincipal {
  const actual = contenidos[indiceActual];
  const esUltimo = indiceActual === contenidos.length - 1;

  if (actual && !actual.completado) {
    return {
      tipo: "completar-y-continuar",
      etiqueta: esUltimo ? "Completar contenido" : "Completar y continuar",
    };
  }
  if (!esUltimo) {
    return { tipo: "siguiente", etiqueta: "Siguiente", indice: indiceActual + 1 };
  }

  const pendiente = contenidos.findIndex((c) => !c.completado);
  if (pendiente !== -1) {
    return { tipo: "ir-a-pendiente", etiqueta: "Ir al contenido pendiente", indice: pendiente };
  }
  if (evaluacion.existe && !evaluacion.aprobada && evaluacion.disponible && evaluacion.href) {
    return { tipo: "evaluacion", etiqueta: "Continuar a la evaluación", href: evaluacion.href };
  }
  return { tipo: "finalizar", etiqueta: "Finalizar contenido" };
}

/**
 * Tras marcar un contenido como completado, a cuál avanzar: el siguiente
 * pendiente después del actual; si no hay, el primero pendiente; si todo
 * está completo, se queda en el actual (y la acción pasa a la evaluación).
 */
export function indiceTrasCompletar(contenidos: ContenidoNavegable[], indiceActual: number): number {
  const conActual = contenidos.map((c, i) => (i === indiceActual ? { ...c, completado: true } : c));
  const despues = conActual.findIndex((c, i) => i > indiceActual && !c.completado);
  if (despues !== -1) return despues;
  const antes = conActual.findIndex((c) => !c.completado);
  return antes !== -1 ? antes : indiceActual;
}
