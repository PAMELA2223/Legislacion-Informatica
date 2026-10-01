import type { ContextoPagina, FragmentoContexto, MensajeChat } from "./chatbot.entity";
import type { FuenteChatbot } from "./chatbot-config";

/** Acceso al contenido real de la plataforma. */
export interface IChatContextRepository {
  /** Busca solo en las fuentes que el administrador habilitó. */
  buscarFragmentos(terminos: string[], fuentes: FuenteChatbot[]): Promise<FragmentoContexto[]>;
  /** Qué está viendo el estudiante (un módulo o la evaluación de un módulo). */
  describirPagina(ruta: string | null): Promise<ContextoPagina | null>;
  /** Enunciados de las preguntas activas de evaluaciones y autoevaluaciones. */
  enunciadosDeEvaluaciones(): Promise<string[]>;
}

/** Servicio de lenguaje (IA). `disponible` = false si no hay clave configurada. */
export interface IChatLanguageModel {
  readonly disponible: boolean;
  responder(sistema: string, mensajes: MensajeChat[]): Promise<string>;
}
