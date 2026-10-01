// Capa de DOMINIO: flujo de aprendizaje del estudiante.
//
//   Inicio de sesión → Autoevaluación inicial → Módulo 1 → Evaluación 1 → …
//   → Último módulo → Evaluación del último módulo → Autoevaluación final → Fin
//
// Todas las reglas de acceso de la plataforma (qué puede abrir el estudiante
// en cada momento) se derivan de `LearningPathRules.calcularEstado()`. Este
// estado NO se guarda aparte en la base de datos: se calcula a partir de los
// registros reales (lecciones completadas e intentos de evaluación), así no
// puede desincronizarse.

export type EtapaAprendizaje =
  | "AUTOEVALUACION_INICIAL"
  | "MODULOS"
  | "AUTOEVALUACION_FINAL"
  | "FINALIZADO";

export interface IntentoResumen {
  puntaje: number; // 0-100
  aprobado: boolean;
  fecha: string; // ISO
}

/**
 * Intentos permitidos por autoevaluación:
 * - inicial: 1 (diagnóstico de conocimientos previos; se toma ese intento);
 * - final: hasta 3, y cuenta la MAYOR nota obtenida.
 */
export const INTENTOS_PERMITIDOS = { inicial: 1, final: 3 } as const;

export interface DatosAutoevaluacion {
  evaluationId: string | null; // null = el administrador todavía no la creó
  preguntasActivas: number;
  /** Todos los intentos del estudiante, en orden cronológico. */
  intentos: IntentoResumen[];
}

export interface DatosModulo {
  courseId: string;
  slug: string;
  numero: number;
  titulo: string;
  descripcion: string;
  totalLecciones: number;
  leccionesCompletadas: number;
  evaluacion: { id: string; preguntasActivas: number } | null;
  /** Mejor intento del estudiante en la evaluación del módulo. */
  mejorIntento: IntentoResumen | null;
}

export interface EntradaEstadoAprendizaje {
  inicial: DatosAutoevaluacion;
  final: DatosAutoevaluacion;
  modulos: DatosModulo[]; // SOLO módulos activos, ya en el orden del itinerario
}

export interface EstadoModulo extends DatosModulo {
  posicion: number; // 1..n dentro del itinerario visible
  progresoLecciones: number; // 0-100
  contenidoCompletado: boolean;
  requiereEvaluacion: boolean;
  evaluacionAprobada: boolean;
  completado: boolean;
  desbloqueado: boolean;
  /** El estudiante ya puede rendir la evaluación (revisó todo el contenido). */
  evaluacionDisponible: boolean;
}

export interface EstadoAutoevaluacion {
  evaluationId: string | null;
  configurada: boolean;
  /** Tiene al menos un intento (etapa cumplida). */
  completada: boolean;
  /** Nota que cuenta: inicial → su único intento; final → la mayor. */
  puntaje: number | null;
  /** Fecha del intento que cuenta. */
  fecha: string | null;
  intentosRealizados: number;
  intentosPermitidos: number;
  intentosRestantes: number;
}

export interface EstadoAprendizaje {
  etapa: EtapaAprendizaje;
  inicial: EstadoAutoevaluacion;
  final: EstadoAutoevaluacion & { habilitada: boolean };
  modulos: EstadoModulo[];
  modulosCompletados: number;
  totalModulos: number;
  todosLosModulosCompletados: boolean;
  puedeAccederModulos: boolean;
  /** Puntos de diferencia final − inicial (solo si ambas están completadas). */
  mejora: number | null;
  siguienteModulo: EstadoModulo | null;
}

/** El intento que cuenta: el primero (inicial) o el de mayor nota (final; ante empate, el más antiguo). */
export function intentoQueCuenta(intentos: IntentoResumen[], tipo: "inicial" | "final"): IntentoResumen | null {
  if (intentos.length === 0) return null;
  if (tipo === "inicial") return intentos[0];
  return intentos.reduce((mejor, i) => (i.puntaje > mejor.puntaje ? i : mejor));
}

function estadoAutoevaluacion(datos: DatosAutoevaluacion, tipo: "inicial" | "final"): EstadoAutoevaluacion {
  const cuenta = intentoQueCuenta(datos.intentos, tipo);
  const permitidos = INTENTOS_PERMITIDOS[tipo];
  return {
    evaluationId: datos.evaluationId,
    configurada: Boolean(datos.evaluationId) && datos.preguntasActivas > 0,
    completada: datos.intentos.length > 0,
    puntaje: cuenta?.puntaje ?? null,
    fecha: cuenta?.fecha ?? null,
    intentosRealizados: datos.intentos.length,
    intentosPermitidos: permitidos,
    intentosRestantes: Math.max(0, permitidos - datos.intentos.length),
  };
}

export class LearningPathRules {
  static calcularProgresoLecciones(total: number, completadas: number): number {
    if (total <= 0) return 100;
    return Math.min(100, Math.round((completadas / total) * 100));
  }

  static calcularEstado(entrada: EntradaEstadoAprendizaje): EstadoAprendizaje {
    const inicial = estadoAutoevaluacion(entrada.inicial, "inicial");
    const finalBase = estadoAutoevaluacion(entrada.final, "final");

    // Si el administrador aún no configuró la autoevaluación inicial (sin
    // preguntas activas) no se bloquea al estudiante, porque la plataforma
    // quedaría inutilizable. El panel de administración lo advierte.
    const inicialPendiente = inicial.configurada && !inicial.completada;
    const puedeAccederModulos = !inicialPendiente;

    const modulos: EstadoModulo[] = [];
    for (const [idx, m] of entrada.modulos.entries()) {
      const progresoLecciones = this.calcularProgresoLecciones(m.totalLecciones, m.leccionesCompletadas);
      const contenidoCompletado = m.leccionesCompletadas >= m.totalLecciones;
      const requiereEvaluacion = Boolean(m.evaluacion) && (m.evaluacion?.preguntasActivas ?? 0) > 0;
      const evaluacionAprobada = Boolean(m.mejorIntento?.aprobado);
      const completado = contenidoCompletado && (!requiereEvaluacion || evaluacionAprobada);
      const anterior = modulos[idx - 1];
      const desbloqueado = puedeAccederModulos && (idx === 0 || Boolean(anterior?.completado));

      modulos.push({
        ...m,
        posicion: idx + 1,
        progresoLecciones,
        contenidoCompletado,
        requiereEvaluacion,
        evaluacionAprobada,
        completado,
        desbloqueado,
        evaluacionDisponible: desbloqueado && contenidoCompletado && requiereEvaluacion,
      });
    }

    const modulosCompletados = modulos.filter((m) => m.completado).length;
    const todosLosModulosCompletados = modulos.length > 0 && modulosCompletados === modulos.length;
    const habilitada = puedeAccederModulos && todosLosModulosCompletados && finalBase.configurada;

    let etapa: EtapaAprendizaje;
    if (inicialPendiente) etapa = "AUTOEVALUACION_INICIAL";
    else if (!todosLosModulosCompletados) etapa = "MODULOS";
    else if (!finalBase.completada) etapa = "AUTOEVALUACION_FINAL";
    else etapa = "FINALIZADO";

    const mejora =
      inicial.puntaje !== null && finalBase.puntaje !== null ? finalBase.puntaje - inicial.puntaje : null;

    return {
      etapa,
      inicial,
      final: { ...finalBase, habilitada },
      modulos,
      modulosCompletados,
      totalModulos: modulos.length,
      todosLosModulosCompletados,
      puedeAccederModulos,
      mejora,
      siguienteModulo: modulos.find((m) => m.desbloqueado && !m.completado) ?? null,
    };
  }

  /** ¿Puede el estudiante abrir el contenido de este módulo? */
  static puedeVerModulo(estado: EstadoAprendizaje, courseId: string): boolean {
    return Boolean(estado.modulos.find((m) => m.courseId === courseId)?.desbloqueado);
  }

  /** ¿Puede el estudiante rendir la evaluación de este módulo? */
  static puedeRendirEvaluacionDeModulo(estado: EstadoAprendizaje, evaluationId: string): boolean {
    return Boolean(estado.modulos.find((m) => m.evaluacion?.id === evaluationId)?.evaluacionDisponible);
  }

  static puedeRendirAutoevaluacionInicial(estado: EstadoAprendizaje): boolean {
    return estado.inicial.configurada && estado.inicial.intentosRestantes > 0;
  }

  /** Habilitada (todos los módulos completos) y con intentos disponibles (máx. 3). */
  static puedeRendirAutoevaluacionFinal(estado: EstadoAprendizaje): boolean {
    return estado.final.habilitada && estado.final.intentosRestantes > 0;
  }
}
