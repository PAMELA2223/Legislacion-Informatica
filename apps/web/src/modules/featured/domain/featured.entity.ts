// Capa de DOMINIO: "Lo más destacado" (reemplaza a las categorías Videos e
// Infografías). Contenido que el administrador elige resaltar.

export const TIPOS_DESTACADO = ["VIDEO", "INFOGRAFIA", "DOCUMENTO", "RECURSO", "ENLACE", "MODULO"] as const;
export type TipoDestacado = (typeof TIPOS_DESTACADO)[number];

export const ETIQUETAS_TIPO_DESTACADO: Record<TipoDestacado, string> = {
  VIDEO: "Video",
  INFOGRAFIA: "Infografía",
  DOCUMENTO: "Documento",
  RECURSO: "Recurso recomendado",
  ENLACE: "Enlace de interés",
  MODULO: "Módulo",
};

export interface FeaturedItem {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoDestacado;
  url: string;
  imagenUrl: string | null;
  fuente: string | null;
  courseId: string | null;
  cursoTitulo?: string | null;
  origen: string | null;
  orden: number;
  activo: boolean;
}

export interface DatosDestacado {
  titulo: string;
  descripcion: string;
  tipo: TipoDestacado;
  url: string;
  imagenUrl?: string | null;
  fuente?: string | null;
  courseId?: string | null;
  orden?: number;
  activo?: boolean;
}

function esUrlValida(url: string) {
  return /^https?:\/\//i.test(url) || url.startsWith("/");
}

export class FeaturedRules {
  /** Valida y normaliza los datos de un destacado; lanza Error con mensaje claro. */
  static validar(data: Partial<DatosDestacado> | null | undefined): DatosDestacado {
    if (!data) throw new Error("Datos vacíos.");
    const titulo = data.titulo?.trim();
    const descripcion = data.descripcion?.trim();
    const url = data.url?.trim();
    if (!titulo) throw new Error("El título es obligatorio.");
    if (!descripcion) throw new Error("La descripción es obligatoria.");
    if (!data.tipo || !TIPOS_DESTACADO.includes(data.tipo)) throw new Error("Tipo de contenido inválido.");
    if (!url || !esUrlValida(url)) {
      throw new Error("El enlace debe empezar con http://, https:// o ser una ruta interna que empiece con /.");
    }
    const imagenUrl = data.imagenUrl?.trim() || null;
    if (imagenUrl && !esUrlValida(imagenUrl)) throw new Error("La URL de la imagen no es válida.");
    return {
      titulo,
      descripcion,
      tipo: data.tipo,
      url,
      imagenUrl,
      fuente: data.fuente?.trim() || null,
      courseId: data.courseId || null,
      orden: Number.isFinite(Number(data.orden)) ? Number(data.orden) : 0,
      activo: data.activo ?? true,
    };
  }
}
