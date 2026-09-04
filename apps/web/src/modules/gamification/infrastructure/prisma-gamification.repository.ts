import type { PrismaClient } from "@prisma/client";
import { otorgarXP } from "@/lib/gamification";
import {
  CRITERIOS_INSIGNIAS,
  GamificationRules,
  XP_BONUS_POR_INSIGNIA,
} from "../domain/gamification.entity";
import type { EstadisticasLogros } from "../domain/gamification.entity";
import type { IGamificationRepository } from "../domain/gamification-repository.interface";
import type { BadgeConEstado, EntradaRanking, Reto } from "../domain/gamification.entity";

export class PrismaGamificationRepository implements IGamificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private async obtenerEstadisticas(userId: string): Promise<EstadisticasLogros> {
    const [user, leccionesCompletadas, modulosCompletados, evaluacionesAprobadas, casosCorrectos] =
      await Promise.all([
        this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
        this.prisma.lessonProgress.count({ where: { userId, completado: true } }),
        this.prisma.enrollment.count({ where: { userId, completado: true } }),
        this.prisma.quizAttempt.count({ where: { userId, aprobado: true } }),
        this.prisma.caseAttempt.count({ where: { userId, correcta: true } }),
      ]);

    return {
      leccionesCompletadas,
      modulosCompletados,
      evaluacionesAprobadas,
      casosCorrectos,
      nivel: user.nivel,
    };
  }

  async obtenerInsignias(userId: string): Promise<BadgeConEstado[]> {
    const [badges, obtenidas] = await Promise.all([
      this.prisma.badge.findMany(),
      this.prisma.badgeEarned.findMany({ where: { userId } }),
    ]);

    const mapaObtenidas = new Map(obtenidas.map((o) => [o.badgeId, o.fecha]));

    return badges.map((b) => ({
      id: b.id,
      nombre: b.nombre,
      descripcion: b.descripcion,
      icono: b.icono,
      criterio: b.criterio,
      obtenida: mapaObtenidas.has(b.id),
      fecha: mapaObtenidas.get(b.id)?.toISOString(),
    }));
  }

  async obtenerRetos(userId: string): Promise<Reto[]> {
    const stats = await this.obtenerEstadisticas(userId);
    return GamificationRules.calcularRetos(stats);
  }

  async obtenerRanking(userId: string, limite = 10): Promise<EntradaRanking[]> {
    const estudiantes = await this.prisma.user.findMany({
      where: { rol: "ESTUDIANTE" },
      orderBy: { xp: "desc" },
      select: { id: true, nombre: true, xp: true, nivel: true },
    });

    const top = estudiantes.slice(0, limite).map((e, i) => ({
      posicion: i + 1,
      nombre: e.nombre,
      xp: e.xp,
      nivel: e.nivel,
      esUsuarioActual: e.id === userId,
    }));

    // Si el usuario actual no está en el top, se agrega al final con su posición real
    const yaIncluido = top.some((t) => t.esUsuarioActual);
    if (!yaIncluido) {
      const posicionReal = estudiantes.findIndex((e) => e.id === userId);
      if (posicionReal !== -1) {
        const yo = estudiantes[posicionReal];
        top.push({
          posicion: posicionReal + 1,
          nombre: yo.nombre,
          xp: yo.xp,
          nivel: yo.nivel,
          esUsuarioActual: true,
        });
      }
    }

    return top;
  }

  async evaluarYOtorgarInsignias(userId: string): Promise<void> {
    const stats = await this.obtenerEstadisticas(userId);
    const yaObtenidas = await this.prisma.badgeEarned.findMany({
      where: { userId },
      select: { badgeId: true },
    });
    const idsObtenidas = new Set(yaObtenidas.map((o) => o.badgeId));

    for (const [badgeId, cumple] of Object.entries(CRITERIOS_INSIGNIAS)) {
      if (idsObtenidas.has(badgeId)) continue;
      if (!cumple(stats)) continue;

      const badge = await this.prisma.badge.findUnique({ where: { id: badgeId } });
      if (!badge) continue; // insignia no sembrada aún en la base de datos

      await this.prisma.badgeEarned.create({ data: { userId, badgeId } });
      await otorgarXP(this.prisma, userId, XP_BONUS_POR_INSIGNIA);
    }
  }
}
