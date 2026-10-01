import { ChatbotRules, type RespuestaChat } from "../domain/chatbot.entity";
import {
  coincidenciaConPregunta,
  completarConTemaDelModulo,
  interpretarConsulta,
  UMBRAL_COINCIDENCIA_EVALUACION,
} from "../domain/chatbot-interpreter";
import { CONFIG_POR_DEFECTO, type ConfigChatbot } from "../domain/chatbot-config";
import type { IChatContextRepository, IChatLanguageModel } from "../domain/chatbot-ports.interface";

/** Datos para las estadísticas de uso (sin el texto de la conversación). */
export interface MetaConsulta {
  modo: "ia" | "basico";
  intencion: string;
  tema: string | null;
  conInformacion: boolean;
  contexto: "modulo" | "evaluacion" | null;
}

export class ResponderConsultaUseCase {
  constructor(
    private readonly contexto: IChatContextRepository,
    private readonly modelo: IChatLanguageModel,
    private readonly config: ConfigChatbot = CONFIG_POR_DEFECTO
  ) {}

  async execute(historialCrudo: unknown, paginaActual: string | null): Promise<RespuestaChat & { meta: MetaConsulta }> {
    const historial = ChatbotRules.normalizarHistorial(historialCrudo);
    const ultima = historial[historial.length - 1].content;
    const usaConocimiento = this.config.fuentes.includes("CONOCIMIENTO");
    const usaModulos = this.config.fuentes.includes("LECCIONES");

    // 1. Contexto: página actual (módulo o evaluación) y banco de enunciados.
    const [paginaCruda, enunciados] = await Promise.all([
      this.contexto.describirPagina(paginaActual),
      this.contexto.enunciadosDeEvaluaciones(),
    ]);
    // El contexto del módulo solo se usa si "Contenido de los módulos" está habilitado
    // (en una evaluación se conserva siempre, para reforzar la protección).
    const pagina = paginaCruda && (usaModulos || paginaCruda.tipo === "evaluacion") ? paginaCruda : null;

    // 2. Interpretar QUÉ pide y DE QUÉ habla (seguimientos y tema del módulo incluidos).
    let consulta = interpretarConsulta(historial);
    if (pagina?.tipo === "modulo") consulta = completarConTemaDelModulo(consulta, pagina);

    const fragmentos = ChatbotRules.recortarFragmentos(
      await this.contexto.buscarFragmentos(ChatbotRules.terminosDeBusqueda(historial, consulta, pagina), this.config.fuentes)
    );
    const coincideConEvaluacion = enunciados.some(
      (e) => coincidenciaConPregunta(ultima, e) >= UMBRAL_COINCIDENCIA_EVALUACION
    );
    if (coincideConEvaluacion && consulta.intencion !== "respuesta-evaluacion") {
      consulta = { ...consulta, intencion: consulta.conceptos.length ? "definicion" : "general" };
    }

    // Si el administrador desactivó la base de conocimiento, sus fichas no se usan.
    const consultaParaResponder = usaConocimiento ? consulta : { ...consulta, conceptos: [] };

    const fuentes = fragmentos
      .filter((f, i, arr) => arr.findIndex((x) => x.url === f.url) === i)
      .slice(0, 3)
      .map(({ titulo, url, tipo }) => ({ titulo, url, tipo }));
    const sugerencias = ChatbotRules.sugerencias(consultaParaResponder);
    const meta = (modo: "ia" | "basico"): MetaConsulta => ({
      modo,
      intencion: consulta.intencion,
      tema: consulta.conceptos[0]?.id ?? null,
      conInformacion:
        consulta.intencion === "respuesta-evaluacion" || consultaParaResponder.conceptos.length > 0 || fragmentos.length > 0,
      contexto: pagina?.tipo ?? null,
    });

    if (this.modelo.disponible) {
      try {
        const sistema = ChatbotRules.construirPromptSistema({
          fragmentos,
          consulta: consultaParaResponder,
          pagina,
          coincideConEvaluacion,
        });
        const respuesta = await this.modelo.responder(sistema, historial);
        return { respuesta, fuentes, modo: "ia", sugerencias, meta: meta("ia") };
      } catch {
        // Si la IA falla, se degrada al modo básico en vez de mostrar un error.
      }
    }

    const respuesta = coincideConEvaluacion
      ? ChatbotRules.respuestaEvaluacionProtegida(consultaParaResponder)
      : ChatbotRules.respuestaModoBasico(consultaParaResponder, fragmentos, pagina);
    return {
      respuesta,
      fuentes: coincideConEvaluacion ? [] : fuentes,
      modo: "basico",
      sugerencias: coincideConEvaluacion ? [] : sugerencias,
      meta: meta("basico"),
    };
  }
}
