import type { FaqItem } from "./faq.entity";

export interface IFaqRepository {
  /** Solo preguntas publicadas, agrupadas por categoría y ordenadas — para la vista pública. */
  listarPublicadas(): Promise<FaqItem[]>;
}
