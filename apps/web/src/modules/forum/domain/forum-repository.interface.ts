import type { CategoriaForo, ForumThread, ForumThreadDetalle } from "./forum.entity";

export interface IForumRepository {
  listarHilos(categoria?: CategoriaForo): Promise<ForumThread[]>;
  crearHilo(autorId: string, titulo: string, categoria: CategoriaForo): Promise<ForumThread>;
  obtenerHilo(id: string, userId: string): Promise<ForumThreadDetalle | null>;
  crearComentario(threadId: string, autorId: string, contenido: string): Promise<void>;
  alternarReaccion(postId: string, userId: string): Promise<boolean>;
}
