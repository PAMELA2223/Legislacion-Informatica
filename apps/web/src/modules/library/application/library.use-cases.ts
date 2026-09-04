import type { CategoriaDocumento } from "../domain/library.entity";
import type { ILibraryRepository } from "../domain/library-repository.interface";

export class ListarDocumentosUseCase {
  constructor(private readonly repo: ILibraryRepository) {}

  async execute(filtro?: { categoria?: CategoriaDocumento; tag?: string }) {
    return this.repo.listarDocumentos(filtro);
  }
}

export class ObtenerDocumentoUseCase {
  constructor(private readonly repo: ILibraryRepository) {}

  async execute(id: string) {
    const doc = await this.repo.obtenerDocumentoPorId(id);
    if (!doc) throw new Error("Documento no encontrado.");
    return doc;
  }
}

export class BuscarEnBibliotecaUseCase {
  constructor(private readonly repo: ILibraryRepository) {}

  async execute(query: string) {
    const q = query.trim();
    if (q.length < 2) return [];
    return this.repo.buscarPorTexto(q);
  }
}

export class AlternarFavoritoUseCase {
  constructor(private readonly repo: ILibraryRepository) {}

  async execute(userId: string, documentId: string) {
    return this.repo.alternarFavorito(userId, documentId);
  }
}

export class RegistrarDescargaUseCase {
  constructor(private readonly repo: ILibraryRepository) {}

  async execute(documentId: string) {
    return this.repo.registrarDescarga(documentId);
  }
}
