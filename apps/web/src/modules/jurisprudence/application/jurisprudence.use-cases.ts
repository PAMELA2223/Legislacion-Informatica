import type { IJurisprudenceRepository } from "../domain/jurisprudence-repository.interface";

export class ListarJurisprudenciaPublicadaUseCase {
  constructor(private readonly repo: IJurisprudenceRepository) {}
  async execute() {
    return this.repo.listarPublicados();
  }
}
