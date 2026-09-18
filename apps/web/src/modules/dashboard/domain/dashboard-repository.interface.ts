import type { ResumenAdmin, ResumenEstudiante } from "./dashboard.entity";

export interface IDashboardRepository {
  obtenerResumenEstudiante(userId: string): Promise<ResumenEstudiante>;
  obtenerResumenAdmin(): Promise<ResumenAdmin>;
}
