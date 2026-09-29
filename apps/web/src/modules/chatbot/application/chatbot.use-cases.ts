import { ChatbotRules, type RespuestaChat } from "../domain/chatbot.entity";
import type { IChatContextRepository, IChatLanguageModel } from "../domain/chatbot-ports.interface";

export class ResponderConsultaUseCase {
  constructor(
    private readonly contexto: IChatContextRepository,
    private readonly modelo: IChatLanguageModel
  ) {}

  async execute(historialCrudo: unknown, paginaActual: string | null): Promise<RespuestaChat> {
    const historial = ChatbotRules.normalizarHistorial(historialCrudo);
    const ultima = historial[historial.length - 1].content;

    const [fragmentosCrudos, pagina] = await Promise.all([
      this.contexto.buscarFragmentos(ChatbotRules.extraerTerminos(ultima)),
      this.contexto.describirPagina(paginaActual),
    ]);
    const fragmentos = ChatbotRules.recortarFragmentos(fragmentosCrudos);
    const fuentes = fragmentos
      .filter((f, i, arr) => arr.findIndex((x) => x.url === f.url) === i)
      .slice(0, 4)
      .map(({ titulo, url, tipo }) => ({ titulo, url, tipo }));

    if (this.modelo.disponible) {
      try {
        const respuesta = await this.modelo.responder(ChatbotRules.construirPromptSistema(fragmentos, pagina), historial);
        return { respuesta, fuentes, modo: "ia" };
      } catch {
        // Si la IA falla, se degrada al modo básico en vez de mostrar un error.
      }
    }
    return { respuesta: ChatbotRules.respuestaModoBasico(fragmentos), fuentes, modo: "basico" };
  }
}
