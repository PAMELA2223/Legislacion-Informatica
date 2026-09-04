import type { PrismaClient } from "@prisma/client";
import { SelfAssessmentRules } from "../domain/self-assessment.entity";
import type {
  PerfilComparativo,
  PerfilCompetencias,
  RespuestaLikert,
  SelfAssessmentQuestion,
  TipoDiagnostico,
} from "../domain/self-assessment.entity";
import type { ISelfAssessmentRepository } from "../domain/self-assessment-repository.interface";

export class PrismaSelfAssessmentRepository implements ISelfAssessmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerPreguntas(): Promise<SelfAssessmentQuestion[]> {
    const preguntas = await this.prisma.selfAssessmentQuestion.findMany({
      orderBy: { orden: "asc" },
    });
    return preguntas as unknown as SelfAssessmentQuestion[];
  }

  async yaCompleto(userId: string, tipo: TipoDiagnostico): Promise<boolean> {
    const total = await this.prisma.selfAssessmentQuestion.count();
    const respondidas = await this.prisma.selfAssessmentResponse.count({
      where: { userId, tipo },
    });
    return total > 0 && respondidas >= total;
  }

  async guardarRespuestas(
    userId: string,
    tipo: TipoDiagnostico,
    respuestas: RespuestaLikert[]
  ): Promise<PerfilCompetencias> {
    const preguntas = await this.obtenerPreguntas();

    await this.prisma.$transaction(
      respuestas.map((r) =>
        this.prisma.selfAssessmentResponse.upsert({
          where: { userId_questionId_tipo: { userId, questionId: r.questionId, tipo } },
          update: { valor: r.valor },
          create: { userId, questionId: r.questionId, tipo, valor: r.valor },
        })
      )
    );

    return SelfAssessmentRules.calcularPerfil(preguntas, respuestas);
  }

  async obtenerPerfil(userId: string, tipo: TipoDiagnostico): Promise<PerfilCompetencias | null> {
    const [preguntas, respuestas] = await Promise.all([
      this.obtenerPreguntas(),
      this.prisma.selfAssessmentResponse.findMany({ where: { userId, tipo } }),
    ]);

    if (respuestas.length === 0) return null;

    return SelfAssessmentRules.calcularPerfil(
      preguntas,
      respuestas.map((r) => ({ questionId: r.questionId, valor: r.valor }))
    );
  }

  async obtenerPerfilComparativo(userId: string): Promise<PerfilComparativo> {
    const [inicial, final] = await Promise.all([
      this.obtenerPerfil(userId, "INICIAL"),
      this.obtenerPerfil(userId, "FINAL"),
    ]);
    return { inicial, final };
  }
}
