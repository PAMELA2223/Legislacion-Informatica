import type { PrismaClient } from "@prisma/client";
import type { ICaseStudyRepository, ResumenIntentoCaso } from "../domain/case-study-repository.interface";
import type { CaseStudy, CaseStudyConSolucion, CategoriaCaso, ResultadoCaso } from "../domain/case-study.entity";
import { otorgarXP } from "@/lib/gamification";
import { PrismaGamificationRepository } from "@/modules/gamification/infrastructure/prisma-gamification.repository";

const XP_POR_CASO_CORRECTO = 10;

export class PrismaCaseStudyRepository implements ICaseStudyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarCasos(categoria?: CategoriaCaso): Promise<CaseStudy[]> {
    const casos = await this.prisma.caseStudy.findMany({
      where: categoria ? { categoria } : undefined,
      select: {
        id: true,
        titulo: true,
        categoria: true,
        escenario: true,
        descripcion: true,
        nivelDificultad: true,
        competenciaDesarrollada: true,
        opciones: true,
        orden: true,
        // campos de solución excluidos intencionalmente
      },
      orderBy: { orden: "asc" },
    });
    return casos as unknown as CaseStudy[];
  }

  async obtenerCasoParaResolver(id: string): Promise<CaseStudy | null> {
    const caso = await this.prisma.caseStudy.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        categoria: true,
        escenario: true,
        descripcion: true,
        nivelDificultad: true,
        competenciaDesarrollada: true,
        opciones: true,
        orden: true,
        // indiceCorrecto y campos jurídicos excluidos: no deben llegar al cliente aún
      },
    });
    return caso as unknown as CaseStudy | null;
  }

  async obtenerCasoConSolucion(id: string): Promise<CaseStudyConSolucion | null> {
    const caso = await this.prisma.caseStudy.findUnique({ where: { id } });
    return caso as unknown as CaseStudyConSolucion | null;
  }

  async guardarIntento(userId: string, caseStudyId: string, resultado: ResultadoCaso): Promise<void> {
    await this.prisma.caseAttempt.create({
      data: { userId, caseStudyId, correcta: resultado.correcta },
    });
    if (resultado.correcta) {
      await otorgarXP(this.prisma, userId, XP_POR_CASO_CORRECTO);
    }
    await new PrismaGamificationRepository(this.prisma).evaluarYOtorgarInsignias(userId);
  }

  async obtenerHistorial(userId: string): Promise<ResumenIntentoCaso[]> {
    const intentos = await this.prisma.caseAttempt.findMany({
      where: { userId },
      orderBy: { fecha: "desc" },
    });
    return intentos.map((i) => ({
      caseStudyId: i.caseStudyId,
      correcta: i.correcta,
      fecha: i.fecha.toISOString(),
    }));
  }
}
