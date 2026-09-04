import type { ResultadoBusqueda } from "./search.entity";

export interface ISearchRepository {
  buscarGlobal(query: string): Promise<ResultadoBusqueda[]>;
}
