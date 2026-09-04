import type { IGlossaryRepository } from "../domain/glossary-repository.interface";

export class ListarTerminosUseCase {
  constructor(private readonly repo: IGlossaryRepository) {}
  async execute(busqueda?: string) {
    return this.repo.listarTerminos(busqueda);
  }
}
