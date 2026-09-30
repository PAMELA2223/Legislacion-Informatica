// Infografías de los módulos. Una infografía ES una lección de tipo
// INFOGRAFIA dentro del módulo (así el estudiante la ve en el propio módulo,
// como un paso más del contenido). Aquí viven las reglas puras: validación de
// datos y verificación del archivo de imagen que sube el administrador.

export interface DatosInfografia {
  courseId: string;
  titulo: string;
  urlImagen: string;
  descripcion?: string | null;
}

export const TAMANO_MAXIMO_IMAGEN = 4 * 1024 * 1024; // 4 MB (límite de subida de Vercel: 4,5 MB)

export const TIPOS_IMAGEN_PERMITIDOS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
} as const;
export type TipoImagen = keyof typeof TIPOS_IMAGEN_PERMITIDOS;

function esUrlSegura(url: string) {
  return /^https?:\/\/[^\s]+$/i.test(url) || /^\/[^\s/][^\s]*$/.test(url);
}

export function validarInfografia(data: Partial<DatosInfografia> | null | undefined): DatosInfografia {
  if (!data) throw new Error("Datos de la infografía vacíos.");
  const titulo = data.titulo?.trim();
  const urlImagen = data.urlImagen?.trim();
  if (!data.courseId) throw new Error("Selecciona el módulo al que pertenece la infografía.");
  if (!titulo) throw new Error("El título es obligatorio.");
  if (!urlImagen) throw new Error("Sube una imagen o indica su enlace.");
  if (!esUrlSegura(urlImagen)) {
    throw new Error("El enlace de la imagen debe empezar con https:// o ser una ruta interna como /images/....");
  }
  return { courseId: data.courseId, titulo, urlImagen, descripcion: data.descripcion?.trim() || null };
}

/**
 * Identifica el tipo REAL del archivo por su firma (primeros bytes), no por
 * la extensión ni por lo que declare el navegador, que pueden falsificarse.
 * Devuelve null si no es PNG, JPEG ni WebP (se rechazan SVG, PDF, etc.).
 */
export function detectarTipoImagen(bytes: Uint8Array): TipoImagen | null {
  const b = bytes;
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) {
    return "image/png";
  }
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (
    b.length >= 12 &&
    String.fromCharCode(b[0], b[1], b[2], b[3]) === "RIFF" &&
    String.fromCharCode(b[8], b[9], b[10], b[11]) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function validarArchivoImagen(tamano: number, bytesIniciales: Uint8Array): TipoImagen {
  if (tamano === 0) throw new Error("El archivo está vacío.");
  if (tamano > TAMANO_MAXIMO_IMAGEN) {
    throw new Error("La imagen supera los 4 MB. Redúcela o comprímela (por ejemplo, exportándola como JPG o WebP) y vuelve a intentarlo.");
  }
  const tipo = detectarTipoImagen(bytesIniciales);
  if (!tipo) throw new Error("Formato no permitido. Sube una imagen PNG, JPG o WebP.");
  return tipo;
}

/**
 * Infografías diseñadas para el proyecto que ya vienen en la plataforma
 * (apps/web/public/images/infografias/), por título exacto de módulo.
 * Antes solo se podían vincular con un script de terminal.
 */
export const INFOGRAFIAS_INCLUIDAS: Record<string, string> = {
  "Introducción al Derecho Informático": "/images/infografias/infografia-introduccion-derecho-informatico.png",
  "Marco Jurídico Ecuatoriano": "/images/infografias/infografia-marco-juridico-ecuatoriano.png",
  "Propiedad Intelectual": "/images/infografias/infografia-propiedad-intelectual.png",
  "Ética y Competencias Digitales": "/images/infografias/infografia-etica-competencias-digitales.png",
};
