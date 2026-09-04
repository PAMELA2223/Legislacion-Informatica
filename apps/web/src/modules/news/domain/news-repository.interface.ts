import type { News } from "./news.entity";

export interface INewsRepository {
  listarNoticias(): Promise<News[]>;
  obtenerNoticia(id: string): Promise<News | null>;
}
