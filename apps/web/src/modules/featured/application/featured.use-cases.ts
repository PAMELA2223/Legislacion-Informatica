import { FeaturedRules, type DatosDestacado } from "../domain/featured.entity";
import type { IFeaturedRepository } from "../domain/featured-repository.interface";

export class ListarDestacadosActivosUseCase {
  constructor(private readonly repo: IFeaturedRepository) {}
  execute() {
    return this.repo.listarActivos();
  }
}

export class ListarDestacadosAdminUseCase {
  constructor(private readonly repo: IFeaturedRepository) {}
  execute() {
    return this.repo.listarTodos();
  }
}

export class ObtenerDestacadoUseCase {
  constructor(private readonly repo: IFeaturedRepository) {}
  async execute(id: string) {
    const item = await this.repo.obtener(id);
    if (!item) throw new Error("Contenido destacado no encontrado.");
    return item;
  }
}

export class GuardarDestacadoUseCase {
  constructor(private readonly repo: IFeaturedRepository) {}
  execute(actorId: string, id: string | null, data: Partial<DatosDestacado>) {
    const datos = FeaturedRules.validar(data);
    return id ? this.repo.actualizar(actorId, id, datos) : this.repo.crear(actorId, datos);
  }
}

export class EliminarDestacadoUseCase {
  constructor(private readonly repo: IFeaturedRepository) {}
  execute(actorId: string, id: string) {
    return this.repo.eliminar(actorId, id);
  }
}

export class ImportarRecursosAntiguosUseCase {
  constructor(private readonly repo: IFeaturedRepository) {}
  execute(actorId: string) {
    return this.repo.importarRecursosAntiguos(actorId);
  }
}
