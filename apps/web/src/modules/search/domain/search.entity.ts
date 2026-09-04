// Capa de DOMINIO del buscador inteligente transversal.
// Preparado para extenderse en fases futuras a: casos prácticos, glosario y
// noticias (Fase 6 y 8), sin modificar el contrato aquí definido.

export type TipoResultadoBusqueda =
  | "DOCUMENTO"
  | "ARTICULO"
  | "MODULO"
  | "CASO_PRACTICO"
  | "GLOSARIO"
  | "NOTICIA";

export interface ResultadoBusqueda {
  tipo: TipoResultadoBusqueda;
  id: string;
  titulo: string;
  extracto: string;
  url: string; // ruta interna a la que navegar
}
