import type { CategoriaDocumento, LibraryDocument } from "./library.entity";

export interface ILibraryRepository {
  listarDocumentos(filtro?: {
    categoria?: CategoriaDocumento;
    tag?: string;
  }): Promise<LibraryDocument[]>;
  obtenerDocumentoPorId(id: string): Promise<LibraryDocument | null>;
  buscarPorTexto(query: string): Promise<LibraryDocument[]>;
  obtenerFavoritos(userId: string): Promise<string[]>; // ids de documentos
  alternarFavorito(userId: string, documentId: string): Promise<boolean>; // retorna nuevo estado
  registrarDescarga(documentId: string): Promise<number>; // retorna nuevo conteo
}
