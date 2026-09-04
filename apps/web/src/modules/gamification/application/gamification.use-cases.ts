import type { IGamificationRepository } from "../domain/gamification-repository.interface";

export class ObtenerInsigniasUseCase {
  constructor(private readonly repo: IGamificationRepository) {}
  async execute(userId: string) {
    return this.repo.obtenerInsignias(userId);
  }
}

export class ObtenerRetosUseCase {
  constructor(private readonly repo: IGamificationRepository) {}
  async execute(userId: string) {
    return this.repo.obtenerRetos(userId);
  }
}

export class ObtenerRankingUseCase {
  constructor(private readonly repo: IGamificationRepository) {}
  async execute(userId: string, limite?: number) {
    return this.repo.obtenerRanking(userId, limite);
  }
}
