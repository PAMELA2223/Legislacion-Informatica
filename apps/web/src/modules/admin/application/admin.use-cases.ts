import type { Rol } from "@prisma/client";
import type { IAdminRepository } from "../domain/admin-repository.interface";
import type { AdminGlossaryRow, AdminNewsRow } from "../domain/admin.entity";

export class ListarUsuariosUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarUsuarios();
  }
}

export class CambiarRolUsuarioUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, userId: string, rol: Rol) {
    return this.repo.cambiarRolUsuario(actorId, userId, rol);
  }
}

export class EliminarUsuarioUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, userId: string) {
    if (actorId === userId) {
      throw new Error("No puedes eliminar tu propia cuenta de administrador.");
    }
    return this.repo.eliminarUsuario(actorId, userId);
  }
}

export class ListarLogsUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(limite?: number) {
    return this.repo.listarLogs(limite);
  }
}

export class ListarNoticiasAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarNoticias();
  }
}

export class ObtenerNoticiaAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(id: string) {
    const noticia = await this.repo.obtenerNoticia(id);
    if (!noticia) throw new Error("Noticia no encontrada.");
    return noticia;
  }
}

export class GuardarNoticiaUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string | null, data: Omit<AdminNewsRow, "id">) {
    if (!data.titulo?.trim()) throw new Error("El título es obligatorio.");
    if (id) return this.repo.actualizarNoticia(actorId, id, data);
    return this.repo.crearNoticia(actorId, data);
  }
}

export class EliminarNoticiaUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarNoticia(actorId, id);
  }
}

export class ListarGlosarioAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarGlosario();
  }
}

export class ObtenerTerminoGlosarioAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(id: string) {
    const termino = await this.repo.obtenerTerminoGlosario(id);
    if (!termino) throw new Error("Término no encontrado.");
    return termino;
  }
}

export class GuardarTerminoGlosarioUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string | null, data: Omit<AdminGlossaryRow, "id">) {
    if (!data.termino?.trim()) throw new Error("El término es obligatorio.");
    if (id) return this.repo.actualizarTerminoGlosario(actorId, id, data);
    return this.repo.crearTerminoGlosario(actorId, data);
  }
}

export class EliminarTerminoGlosarioUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarTerminoGlosario(actorId, id);
  }
}

export class ListarBibliotecaAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarBiblioteca();
  }
}

export class CrearDocumentoBibliotecaUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(
    actorId: string,
    data: { titulo: string; categoria: string; tags: string[]; contenido: string; archivoUrl?: string }
  ) {
    if (!data.titulo?.trim()) throw new Error("El título es obligatorio.");
    return this.repo.crearDocumentoBiblioteca(actorId, data);
  }
}

export class EliminarDocumentoBibliotecaUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarDocumentoBiblioteca(actorId, id);
  }
}

export class ListarCursosAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarCursos();
  }
}

export class ListarEvaluacionesAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarEvaluaciones();
  }
}

export class EliminarEvaluacionUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarEvaluacion(actorId, id);
  }
}

export class ListarCasosAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarCasos();
  }
}

export class EliminarCasoUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarCaso(actorId, id);
  }
}

export class ListarHilosForoAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarHilosForo();
  }
}

export class EliminarHiloForoUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarHiloForo(actorId, id);
  }
}
