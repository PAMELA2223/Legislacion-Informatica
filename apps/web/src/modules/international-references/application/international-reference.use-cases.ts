import type { IInternationalReferenceRepository } from "../domain/international-reference-repository.interface";

export class ListarReferenciasInternacionalesPublicadasUseCase {
  constructor(private readonly repo: IInternationalReferenceRepository) {}
  async execute() {
    return this.repo.listarPublicadas();
  }
}
