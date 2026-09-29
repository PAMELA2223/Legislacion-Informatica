import type { EntradaEstadoAprendizaje } from "./learning-path.entity";

export interface ILearningPathRepository {
  /** Reúne los datos crudos necesarios para calcular el estado del estudiante. */
  obtenerEntrada(userId: string): Promise<EntradaEstadoAprendizaje>;
}
