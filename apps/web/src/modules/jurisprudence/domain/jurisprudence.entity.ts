export interface JurisprudenceCase {
  id: string;
  nombreCaso: string;
  pais: string;
  anio: number;
  tema: string;
  resumen: string;
  problemaJuridico: string;
  decision: string;
  importancia: string;
  fuenteOficial: string;
  enlaceOficial?: string | null;
  verificado: boolean;
  publicado: boolean;
}

/** Reglas de negocio de la jurisprudencia informática. La regla central del
 * pedido: nunca presentar un caso como fuente oficial verificada sin un
 * enlace comprobado — "verificado" y "enlace" deben ir siempre juntos. */
export class JurisprudenceRules {
  static esFuenteConfiable(caso: Pick<JurisprudenceCase, "verificado" | "enlaceOficial">): boolean {
    return caso.verificado && Boolean(caso.enlaceOficial?.trim());
  }
}
