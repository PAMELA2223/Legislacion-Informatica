import type { RespuestaLikert, TipoDiagnostico } from "../domain/self-assessment.entity";
import type { ISelfAssessmentRepository } from "../domain/self-assessment-repository.interface";

export class ObtenerCuestionarioUseCase {
  constructor(private readonly repo: ISelfAssessmentRepository) {}

  async execute(userId: string, tipo: TipoDiagnostico) {
    const [preguntas, completo] = await Promise.all([
      this.repo.obtenerPreguntas(),
      this.repo.yaCompleto(userId, tipo),
    ]);
    return { preguntas, yaCompleto: completo };
  }
}

export class EnviarAutoevaluacionUseCase {
  constructor(private readonly repo: ISelfAssessmentRepository) {}

  async execute(userId: string, tipo: TipoDiagnostico, respuestas: RespuestaLikert[]) {
    if (respuestas.length === 0) {
      throw new Error("Debes responder el cuestionario antes de enviarlo.");
    }
    return this.repo.guardarRespuestas(userId, tipo, respuestas);
  }
}

export class ObtenerPerfilComparativoUseCase {
  constructor(private readonly repo: ISelfAssessmentRepository) {}

  async execute(userId: string) {
    return this.repo.obtenerPerfilComparativo(userId);
  }
}
