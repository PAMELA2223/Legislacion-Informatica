import { LearningPathRules } from "../domain/learning-path.entity";
import type { ILearningPathRepository } from "../domain/learning-path-repository.interface";

export class ObtenerEstadoAprendizajeUseCase {
  constructor(private readonly repo: ILearningPathRepository) {}

  async execute(userId: string) {
    const entrada = await this.repo.obtenerEntrada(userId);
    return LearningPathRules.calcularEstado(entrada);
  }
}
