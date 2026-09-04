import type { GlossaryTerm } from "./glossary.entity";

export interface IGlossaryRepository {
  listarTerminos(busqueda?: string): Promise<GlossaryTerm[]>;
}
