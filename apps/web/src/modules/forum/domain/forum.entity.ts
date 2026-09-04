// Capa de DOMINIO: foro académico. Sin reglas de negocio complejas más allá
// de la validación de contenido no vacío.

export type CategoriaForo =
  | "GENERAL"
  | "PROTECCION_DATOS"
  | "DELITOS_INFORMATICOS"
  | "COMERCIO_ELECTRONICO"
  | "ETICA_DIGITAL"
  | "DUDAS_MODULOS";

export const ETIQUETAS_CATEGORIA_FORO: Record<CategoriaForo, string> = {
  GENERAL: "General",
  PROTECCION_DATOS: "Protección de Datos",
  DELITOS_INFORMATICOS: "Delitos Informáticos",
  COMERCIO_ELECTRONICO: "Comercio Electrónico",
  ETICA_DIGITAL: "Ética Digital",
  DUDAS_MODULOS: "Dudas de módulos",
};

export interface ForumThread {
  id: string;
  titulo: string;
  categoria: CategoriaForo;
  autorNombre: string;
  createdAt: string;
  totalPosts: number;
}

export interface ForumPost {
  id: string;
  threadId: string;
  autorId: string;
  autorNombre: string;
  contenido: string;
  createdAt: string;
  totalReacciones: number;
  yaReacciono: boolean;
}

export interface ForumThreadDetalle extends ForumThread {
  posts: ForumPost[];
}

export class ForumRules {
  static contenidoValido(texto: string): boolean {
    return texto.trim().length >= 3;
  }
}
