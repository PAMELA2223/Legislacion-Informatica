import type { CaseStudy, CaseStudyConSolucion, CategoriaCaso, ResultadoCaso } from "./case-study.entity";

export interface ResumenIntentoCaso {
  caseStudyId: string;
  correcta: boolean;
  fecha: string;
}

export interface ICaseStudyRepository {
  listarCasos(categoria?: CategoriaCaso): Promise<CaseStudy[]>;
  /** Sin indiceCorrecto ni campos de retroalimentación jurídica — para presentar el caso */
  obtenerCasoParaResolver(id: string): Promise<CaseStudy | null>;
  /** Con la solución completa — solo se usa en el servidor al calificar */
  obtenerCasoConSolucion(id: string): Promise<CaseStudyConSolucion | null>;
  guardarIntento(userId: string, caseStudyId: string, resultado: ResultadoCaso): Promise<void>;
  obtenerHistorial(userId: string): Promise<ResumenIntentoCaso[]>;
}
