import { CaseStudyRules } from "../domain/case-study.entity";
import type { CategoriaCaso } from "../domain/case-study.entity";
import type { ICaseStudyRepository } from "../domain/case-study-repository.interface";

export class ListarCasosUseCase {
  constructor(private readonly repo: ICaseStudyRepository) {}
  async execute(categoria?: CategoriaCaso) {
    return this.repo.listarCasos(categoria);
  }
}

export class ObtenerCasoParaResolverUseCase {
  constructor(private readonly repo: ICaseStudyRepository) {}
  async execute(id: string) {
    const caso = await this.repo.obtenerCasoParaResolver(id);
    if (!caso) throw new Error("Caso práctico no encontrado.");
    return caso;
  }
}

export class ResolverCasoUseCase {
  constructor(private readonly repo: ICaseStudyRepository) {}

  async execute(userId: string, caseStudyId: string, indiceSeleccionado: number) {
    const caso = await this.repo.obtenerCasoConSolucion(caseStudyId);
    if (!caso) throw new Error("Caso práctico no encontrado.");

    const resultado = CaseStudyRules.resolver(caso, indiceSeleccionado);
    await this.repo.guardarIntento(userId, caseStudyId, resultado);
    return resultado;
  }
}

export class ObtenerHistorialCasosUseCase {
  constructor(private readonly repo: ICaseStudyRepository) {}
  async execute(userId: string) {
    return this.repo.obtenerHistorial(userId);
  }
}
