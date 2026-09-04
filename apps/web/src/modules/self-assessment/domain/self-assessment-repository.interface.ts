import type {
  PerfilComparativo,
  PerfilCompetencias,
  RespuestaLikert,
  SelfAssessmentQuestion,
  TipoDiagnostico,
} from "./self-assessment.entity";

export interface ISelfAssessmentRepository {
  obtenerPreguntas(): Promise<SelfAssessmentQuestion[]>;
  yaCompleto(userId: string, tipo: TipoDiagnostico): Promise<boolean>;
  guardarRespuestas(
    userId: string,
    tipo: TipoDiagnostico,
    respuestas: RespuestaLikert[]
  ): Promise<PerfilCompetencias>;
  obtenerPerfil(userId: string, tipo: TipoDiagnostico): Promise<PerfilCompetencias | null>;
  obtenerPerfilComparativo(userId: string): Promise<PerfilComparativo>;
}
