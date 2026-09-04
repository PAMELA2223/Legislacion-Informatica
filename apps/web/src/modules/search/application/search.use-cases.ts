import type { ISearchRepository } from "../domain/search-repository.interface";

export class BuscarGlobalUseCase {
  constructor(private readonly repo: ISearchRepository) {}

  async execute(query: string) {
    const q = query.trim();
    if (q.length < 2) return [];
    return this.repo.buscarGlobal(q);
  }
}
