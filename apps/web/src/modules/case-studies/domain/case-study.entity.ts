// Capa de DOMINIO: entidades y reglas de negocio de los casos prácticos.
// Estructura oficial definida en la Fase 1 (Sección 11): escenario, descripción,
// normativa aplicable, derechos vulnerados, sanciones, actuación correcta,
// retroalimentación jurídica, nivel de dificultad y competencia desarrollada.

export type NivelDificultad = "BASICO" | "INTERMEDIO" | "AVANZADO";
export type CategoriaCaso =
  | "PROTECCION_DATOS"
  | "DELITOS_INFORMATICOS"
  | "COMERCIO_ELECTRONICO"
  | "EVIDENCIA_DIGITAL";

export const ETIQUETAS_CATEGORIA_CASO: Record<CategoriaCaso, string> = {
  PROTECCION_DATOS: "Protección de Datos",
  DELITOS_INFORMATICOS: "Delitos Informáticos",
  COMERCIO_ELECTRONICO: "Comercio Electrónico",
  EVIDENCIA_DIGITAL: "Evidencia Digital",
};

export const ETIQUETAS_DIFICULTAD: Record<NivelDificultad, string> = {
  BASICO: "Básico",
  INTERMEDIO: "Intermedio",
  AVANZADO: "Avanzado",
};

export interface CaseStudy {
  id: string;
  titulo: string;
  categoria: CategoriaCaso;
  escenario: string;
  descripcion: string;
  nivelDificultad: NivelDificultad;
  competenciaDesarrollada: string;
  opciones: { alternativas: string[] };
  orden: number;
  // Campos que solo se revelan DESPUÉS de resolver el caso:
  normativaAplicable?: string;
  derechosVulnerados?: string;
  sanciones?: string;
  actuacionCorrecta?: string;
  retroalimentacionJuridica?: string;
}

export interface CaseStudyConSolucion extends CaseStudy {
  indiceCorrecto: number;
  normativaAplicable: string;
  derechosVulnerados: string;
  sanciones: string;
  actuacionCorrecta: string;
  retroalimentacionJuridica: string;
}

export interface ResultadoCaso {
  correcta: boolean;
  normativaAplicable: string;
  derechosVulnerados: string;
  sanciones: string;
  actuacionCorrecta: string;
  retroalimentacionJuridica: string;
}

export class CaseStudyRules {
  static resolver(caso: CaseStudyConSolucion, indiceSeleccionado: number): ResultadoCaso {
    return {
      correcta: indiceSeleccionado === caso.indiceCorrecto,
      normativaAplicable: caso.normativaAplicable,
      derechosVulnerados: caso.derechosVulnerados,
      sanciones: caso.sanciones,
      actuacionCorrecta: caso.actuacionCorrecta,
      retroalimentacionJuridica: caso.retroalimentacionJuridica,
    };
  }
}
