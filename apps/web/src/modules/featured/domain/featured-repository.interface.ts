import type { DatosDestacado, FeaturedItem } from "./featured.entity";

export interface IFeaturedRepository {
  listarActivos(): Promise<FeaturedItem[]>;
  listarTodos(): Promise<FeaturedItem[]>;
  obtener(id: string): Promise<FeaturedItem | null>;
  crear(actorId: string, data: DatosDestacado): Promise<void>;
  actualizar(actorId: string, id: string, data: DatosDestacado): Promise<void>;
  eliminar(actorId: string, id: string): Promise<void>;
  /** Copia los videos e infografías de las tablas antiguas que aún no se importaron. */
  importarRecursosAntiguos(actorId: string): Promise<{ importados: number }>;
}
