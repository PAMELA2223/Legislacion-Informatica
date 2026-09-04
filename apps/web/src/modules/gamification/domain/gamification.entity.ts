// Capa de DOMINIO: insignias, retos y ranking.
// Amplía la gamificación básica de la Fase 7 (XP/nivel) con el sistema
// completo definido en la Fase 1 (Sección 8): medallas, retos y ranking.

export interface EstadisticasLogros {
  leccionesCompletadas: number;
  modulosCompletados: number;
  evaluacionesAprobadas: number;
  casosCorrectos: number;
  nivel: number;
}

export interface Badge {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  criterio: string;
}

export interface BadgeConEstado extends Badge {
  obtenida: boolean;
  fecha?: string;
}

export interface Reto {
  id: string;
  titulo: string;
  descripcion: string;
  meta: number;
  progresoActual: number;
  completado: boolean;
}

export interface EntradaRanking {
  posicion: number;
  nombre: string;
  xp: number;
  nivel: number;
  esUsuarioActual: boolean;
}

/** Criterios de desbloqueo de cada insignia (evaluados contra estadísticas actuales) */
export const CRITERIOS_INSIGNIAS: Record<string, (s: EstadisticasLogros) => boolean> = {
  "primer-paso": (s) => s.leccionesCompletadas >= 1,
  "modulo-completo": (s) => s.modulosCompletados >= 1,
  "evaluador-aprobado": (s) => s.evaluacionesAprobadas >= 1,
  "jurista-junior": (s) => s.casosCorrectos >= 1,
  "estudiante-nivel-5": (s) => s.nivel >= 5,
  "maraton-modulos": (s) => s.modulosCompletados >= 4,
};

export const XP_BONUS_POR_INSIGNIA = 20;

export class GamificationRules {
  static calcularRetos(s: EstadisticasLogros): Reto[] {
    const definiciones: Omit<Reto, "progresoActual" | "completado">[] = [
      {
        id: "reto-modulo",
        titulo: "Primer módulo completado",
        descripcion: "Completa tu primer módulo educativo.",
        meta: 1,
      },
      {
        id: "reto-evaluaciones",
        titulo: "Evaluador constante",
        descripcion: "Aprueba 3 evaluaciones.",
        meta: 3,
      },
      {
        id: "reto-casos",
        titulo: "Jurista en formación",
        descripcion: "Resuelve correctamente 5 casos prácticos.",
        meta: 5,
      },
      {
        id: "reto-nivel5",
        titulo: "Nivel 5",
        descripcion: "Alcanza el nivel 5 acumulando XP.",
        meta: 5,
      },
    ];

    const progresoPorId: Record<string, number> = {
      "reto-modulo": s.modulosCompletados,
      "reto-evaluaciones": s.evaluacionesAprobadas,
      "reto-casos": s.casosCorrectos,
      "reto-nivel5": s.nivel,
    };

    return definiciones.map((d) => {
      const progresoActual = Math.min(progresoPorId[d.id] ?? 0, d.meta);
      return { ...d, progresoActual, completado: progresoActual >= d.meta };
    });
  }
}
