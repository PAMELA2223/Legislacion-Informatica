import type { FragmentoContexto, MensajeChat } from "./chatbot.entity";

/** Busca contenido real de la plataforma relacionado con la consulta. */
export interface IChatContextRepository {
  buscarFragmentos(terminos: string[]): Promise<FragmentoContexto[]>;
  /** Contexto de la página que está viendo el estudiante (ej. un módulo). */
  describirPagina(ruta: string | null): Promise<string | null>;
}

/** Servicio de lenguaje (IA). `disponible` = false si no hay clave configurada. */
export interface IChatLanguageModel {
  readonly disponible: boolean;
  responder(sistema: string, mensajes: MensajeChat[]): Promise<string>;
}
