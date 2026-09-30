import { ChatbotRules, type RespuestaChat } from "../domain/chatbot.entity";
import { coincidenciaConPregunta, interpretarConsulta, UMBRAL_COINCIDENCIA_EVALUACION } from "../domain/chatbot-interpreter";
import type { IChatContextRepository, IChatLanguageModel } from "../domain/chatbot-ports.interface";

export class ResponderConsultaUseCase {
  constructor(
    private readonly contexto: IChatContextRepository,
    private readonly modelo: IChatLanguageModel
  ) {}

  async execute(historialCrudo: unknown, paginaActual: string | null): Promise<RespuestaChat> {
    const historial = ChatbotRules.normalizarHistorial(historialCrudo);
    const ultima = historial[historial.length - 1].content;

    // 1. Interpretar QUÉ pide y DE QUÉ habla (también en preguntas de seguimiento).
    const consulta = interpretarConsulta(historial);

    // 2. Contexto: página actual (módulo/evaluación), contenido relacionado y
    //    si el mensaje coincide con una pregunta de evaluación.
    const [pagina, enunciados] = await Promise.all([
      this.contexto.describirPagina(paginaActual),
      this.contexto.enunciadosDeEvaluaciones(),
    ]);
    const fragmentos = ChatbotRules.recortarFragmentos(
      await this.contexto.buscarFragmentos(ChatbotRules.terminosDeBusqueda(historial, consulta, pagina))
    );
    const coincideConEvaluacion = enunciados.some(
      (e) => coincidenciaConPregunta(ultima, e) >= UMBRAL_COINCIDENCIA_EVALUACION
    );
    if (coincideConEvaluacion && consulta.intencion !== "respuesta-evaluacion") {
      consulta.intencion = consulta.conceptos.length ? "definicion" : "general";
    }

    const fuentes = fragmentos
      .filter((f, i, arr) => arr.findIndex((x) => x.url === f.url) === i)
      .slice(0, 3)
      .map(({ titulo, url, tipo }) => ({ titulo, url, tipo }));
    const sugerencias = ChatbotRules.sugerencias(consulta);

    if (this.modelo.disponible) {
      try {
        const sistema = ChatbotRules.construirPromptSistema({ fragmentos, consulta, pagina, coincideConEvaluacion });
        const respuesta = await this.modelo.responder(sistema, historial);
        return { respuesta, fuentes, modo: "ia", sugerencias };
      } catch {
        // Si la IA falla, se degrada al modo básico en vez de mostrar un error.
      }
    }

    // Modo básico: si el mensaje es una pregunta de evaluación copiada, no se
    // muestra ningún fragmento que pudiera contener la respuesta.
    const respuesta = coincideConEvaluacion
      ? ChatbotRules.respuestaEvaluacionProtegida(consulta)
      : ChatbotRules.respuestaModoBasico(consulta, fragmentos, pagina);
    return {
      respuesta,
      fuentes: coincideConEvaluacion ? [] : fuentes,
      modo: "basico",
      sugerencias: coincideConEvaluacion ? [] : sugerencias,
    };
  }
}
