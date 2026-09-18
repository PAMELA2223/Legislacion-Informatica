import type { JurisprudenceCase } from "./jurisprudence.entity";

export interface IJurisprudenceRepository {
  /** Solo casos publicados — para la vista pública, más recientes primero. */
  listarPublicados(): Promise<JurisprudenceCase[]>;
}
