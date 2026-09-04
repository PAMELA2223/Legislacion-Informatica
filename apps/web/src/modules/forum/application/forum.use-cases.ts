import { ForumRules } from "../domain/forum.entity";
import type { CategoriaForo } from "../domain/forum.entity";
import type { IForumRepository } from "../domain/forum-repository.interface";

export class ListarHilosUseCase {
  constructor(private readonly repo: IForumRepository) {}
  async execute(categoria?: CategoriaForo) {
    return this.repo.listarHilos(categoria);
  }
}

export class CrearHiloUseCase {
  constructor(private readonly repo: IForumRepository) {}
  async execute(autorId: string, titulo: string, categoria: CategoriaForo) {
    if (!ForumRules.contenidoValido(titulo)) {
      throw new Error("El título debe tener al menos 3 caracteres.");
    }
    return this.repo.crearHilo(autorId, titulo.trim(), categoria);
  }
}

export class ObtenerHiloUseCase {
  constructor(private readonly repo: IForumRepository) {}
  async execute(id: string, userId: string) {
    const hilo = await this.repo.obtenerHilo(id, userId);
    if (!hilo) throw new Error("Hilo no encontrado.");
    return hilo;
  }
}

export class CrearComentarioUseCase {
  constructor(private readonly repo: IForumRepository) {}
  async execute(threadId: string, autorId: string, contenido: string) {
    if (!ForumRules.contenidoValido(contenido)) {
      throw new Error("El comentario debe tener al menos 3 caracteres.");
    }
    return this.repo.crearComentario(threadId, autorId, contenido.trim());
  }
}

export class AlternarReaccionUseCase {
  constructor(private readonly repo: IForumRepository) {}
  async execute(postId: string, userId: string) {
    return this.repo.alternarReaccion(postId, userId);
  }
}
