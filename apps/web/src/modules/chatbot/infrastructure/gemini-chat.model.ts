// Cliente mínimo de la API de Gemini (Google AI Studio) para el chatbot.
// Usa el método generateContent por REST con fetch nativo (sin dependencias).
// La clave se lee EXCLUSIVAMENTE de la variable de entorno GEMINI_API_KEY en
// el servidor; nunca llega al navegador ni se escribe en el código.
// Documentación: https://ai.google.dev/gemini-api/docs/generate-content/get-started

import type { IChatLanguageModel } from "../domain/chatbot-ports.interface";
import type { MensajeChat } from "../domain/chatbot.entity";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Modelos a probar, del más reciente al más antiguo. Google renueva los
 * nombres con frecuencia: si el configurado ya no existe (error 404), se usa
 * el siguiente en vez de dejar al estudiante sin respuesta.
 */
export const MODELOS_GEMINI = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-2.5-flash"];

interface RespuestaGemini {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
}

export class GeminiChatModel implements IChatLanguageModel {
  private readonly apiKey: string | undefined;
  private readonly modelos: string[];

  constructor(
    apiKey: string | undefined = process.env.GEMINI_API_KEY?.trim(),
    modelo: string | undefined = process.env.GEMINI_MODEL?.trim(),
    private readonly fetchFn: typeof fetch = fetch
  ) {
    this.apiKey = apiKey || undefined;
    this.modelos = modelo ? [modelo, ...MODELOS_GEMINI.filter((m) => m !== modelo)] : MODELOS_GEMINI;
  }

  get disponible() {
    return Boolean(this.apiKey);
  }

  get modelo() {
    return this.modelos[0];
  }

  async responder(sistema: string, mensajes: MensajeChat[]): Promise<string> {
    if (!this.apiKey) throw new Error("GEMINI_API_KEY no configurada.");

    const cuerpo = JSON.stringify({
      systemInstruction: { parts: [{ text: sistema }] },
      // Gemini llama "model" al asistente.
      contents: mensajes.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
    });

    let ultimoError = "";
    for (const modelo of this.modelos) {
      const res = await this.fetchFn(`${API_BASE}/${encodeURIComponent(modelo)}:generateContent`, {
        method: "POST",
        headers: { "x-goog-api-key": this.apiKey, "Content-Type": "application/json" },
        body: cuerpo,
        signal: AbortSignal.timeout(30_000),
        cache: "no-store",
      });

      if (res.status === 404) {
        // Modelo inexistente o retirado: probar el siguiente.
        ultimoError = `Modelo ${modelo} no disponible`;
        continue;
      }
      if (!res.ok) {
        // No se reenvía el cuerpo del error al estudiante (podría tener detalles internos).
        console.error("[chatbot] Error de la API de Gemini:", res.status, (await res.text().catch(() => "")).slice(0, 500));
        throw new Error(`Servicio de IA no disponible (${res.status}).`);
      }

      const data = (await res.json()) as RespuestaGemini;
      if (data.promptFeedback?.blockReason) {
        throw new Error(`Consulta bloqueada por el filtro de seguridad (${data.promptFeedback.blockReason}).`);
      }
      const texto = (data.candidates?.[0]?.content?.parts ?? [])
        .filter((p) => p.text && !p.thought) // se omiten los "pensamientos" internos si el modelo los devuelve
        .map((p) => p.text)
        .join("")
        .trim();
      if (!texto) throw new Error(`Respuesta vacía del servicio de IA (${data.candidates?.[0]?.finishReason ?? "sin motivo"}).`);
      return texto;
    }
    throw new Error(`${ultimoError}. Configura GEMINI_MODEL con un modelo vigente.`);
  }
}
