import type { ResumenAdmin, ResumenDocente, ResumenEstudiante } from "./dashboard.entity";

export interface IDashboardRepository {
  obtenerResumenEstudiante(userId: string): Promise<ResumenEstudiante>;
  obtenerResumenDocente(): Promise<ResumenDocente>;
  obtenerResumenAdmin(): Promise<ResumenAdmin>;
}
