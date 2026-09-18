// Capa de DOMINIO: entidades y reglas de negocio de la biblioteca jurídica

export type CategoriaDocumento =
  | "CONSTITUCION"
  | "LOPDP"
  | "COIP"
  | "COMERCIO_ELECTRONICO"
  | "REGLAMENTO"
  | "NORMATIVA";

// Estado legal vigente de una norma. Nunca se asume sin una fuente
// verificable — una norma nueva se registra VIGENTE por defecto y el
// administrador la actualiza manualmente si cambia.
export type EstadoNorma = "VIGENTE" | "REFORMADA" | "DEROGADA";

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
  updatedAt: string; // "Última actualización" del registro en la plataforma
  // Ficha de fuente oficial — todos opcionales: si faltan, la UI debe
  // indicar que el registro requiere revisión administrativa.
  numeroIdentificacion?: string | null;
  pais?: string | null;
  institucionEmisora?: string | null;
  fechaEmision?: string | null;
  fechaReforma?: string | null;
  estado: EstadoNorma;
  fuenteOficial?: string | null;
  enlaceOficial?: string | null;
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

export const ETIQUETAS_ESTADO_NORMA: Record<EstadoNorma, string> = {
  VIGENTE: "Vigente",
  REFORMADA: "Reformada",
  DEROGADA: "Derogada",
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

  /** Una norma "tiene fuente verificada" solo si cuenta con nombre de fuente
   * Y enlace oficial — nunca se debe mostrar como verificada con solo uno
   * de los dos campos, ni inventar el que falte. */
  static tieneFuenteVerificada(documento: Pick<LibraryDocument, "fuenteOficial" | "enlaceOficial">): boolean {
    return Boolean(documento.fuenteOficial?.trim() && documento.enlaceOficial?.trim());
  }
}
