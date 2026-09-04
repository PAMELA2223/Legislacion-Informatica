import type { IDashboardRepository } from "../domain/dashboard-repository.interface";

export class ObtenerDashboardEstudianteUseCase {
  constructor(private readonly repo: IDashboardRepository) {}
  async execute(userId: string) {
    return this.repo.obtenerResumenEstudiante(userId);
  }
}

export class ObtenerDashboardDocenteUseCase {
  constructor(private readonly repo: IDashboardRepository) {}
  async execute() {
    return this.repo.obtenerResumenDocente();
  }
}

export class ObtenerDashboardAdminUseCase {
  constructor(private readonly repo: IDashboardRepository) {}
  async execute() {
    return this.repo.obtenerResumenAdmin();
  }
}
