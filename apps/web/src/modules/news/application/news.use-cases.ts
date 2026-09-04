import type { INewsRepository } from "../domain/news-repository.interface";

export class ListarNoticiasUseCase {
  constructor(private readonly repo: INewsRepository) {}
  async execute() {
    return this.repo.listarNoticias();
  }
}

export class ObtenerNoticiaUseCase {
  constructor(private readonly repo: INewsRepository) {}
  async execute(id: string) {
    const noticia = await this.repo.obtenerNoticia(id);
    if (!noticia) throw new Error("Noticia no encontrada.");
    return noticia;
  }
}
