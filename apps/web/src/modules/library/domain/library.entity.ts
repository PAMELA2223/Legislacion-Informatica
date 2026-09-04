// Capa de DOMINIO: entidades y reglas de negocio de la biblioteca jurídica

export type CategoriaDocumento =
  | "CONSTITUCION"
  | "LOPDP"
  | "COIP"
  | "COMERCIO_ELECTRONICO"
  | "REGLAMENTO"
  | "NORMATIVA";

export interface LibraryArticle {
  id: string;
  documentId: string;
  numero: string;
  titulo: string;
  texto: string;
  orden: number;
}

export interface LibraryDocument {
  id: string;
  titulo: string;
  categoria: CategoriaDocumento;
  archivoUrl?: string | null;
  tags: string[];
  contenido: string;
  descargas: number;
  articulos: LibraryArticle[];
  esFavorito?: boolean; // se resuelve por usuario, no es un campo propio del documento
}

export const ETIQUETAS_CATEGORIA: Record<CategoriaDocumento, string> = {
  CONSTITUCION: "Constitución del Ecuador",
  LOPDP: "Ley Orgánica de Protección de Datos Personales",
  COIP: "Código Orgánico Integral Penal",
  COMERCIO_ELECTRONICO: "Ley de Comercio Electrónico",
  REGLAMENTO: "Reglamento",
  NORMATIVA: "Normativa relacionada",
};

/** Reglas de negocio de la biblioteca jurídica */
export class LibraryRules {
  static filtrarPorCategoria(
    documentos: LibraryDocument[],
    categoria?: CategoriaDocumento
  ): LibraryDocument[] {
    if (!categoria) return documentos;
    return documentos.filter((d) => d.categoria === categoria);
  }

  static filtrarPorTag(documentos: LibraryDocument[], tag?: string): LibraryDocument[] {
    if (!tag) return documentos;
    return documentos.filter((d) => d.tags.includes(tag));
  }
}
