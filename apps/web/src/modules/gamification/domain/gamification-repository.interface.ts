import type { BadgeConEstado, EntradaRanking, Reto } from "./gamification.entity";

export interface IGamificationRepository {
  obtenerInsignias(userId: string): Promise<BadgeConEstado[]>;
  obtenerRetos(userId: string): Promise<Reto[]>;
  obtenerRanking(userId: string, limite?: number): Promise<EntradaRanking[]>;
  /** Revisa las estadísticas actuales y otorga insignias nuevas si corresponde */
  evaluarYOtorgarInsignias(userId: string): Promise<void>;
}
