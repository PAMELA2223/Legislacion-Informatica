import type { IInfographicRepository } from "../domain/infographic-repository.interface";

export class ListarInfografiasPublicadasUseCase {
  constructor(private readonly repo: IInfographicRepository) {}
  async execute() {
    return this.repo.listarPublicadas();
  }
}
