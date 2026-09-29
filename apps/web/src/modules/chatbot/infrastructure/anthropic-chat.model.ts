// Cliente mínimo de la API de mensajes de Anthropic (Claude), sin
// dependencias nuevas (fetch nativo). La clave se lee EXCLUSIVAMENTE de la
// variable de entorno ANTHROPIC_API_KEY en el servidor; nunca llega al
// navegador ni se escribe en el código.
// Documentación: https://docs.claude.com/en/api/messages

import type { IChatLanguageModel } from "../domain/chatbot-ports.interface";
import type { MensajeChat } from "../domain/chatbot.entity";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODELO_POR_DEFECTO = "claude-haiku-4-5-20251001";

export class AnthropicChatModel implements IChatLanguageModel {
  private readonly apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  private readonly modelo = process.env.CHATBOT_MODEL?.trim() || MODELO_POR_DEFECTO;

  get disponible() {
    return Boolean(this.apiKey);
  }

  async responder(sistema: string, mensajes: MensajeChat[]): Promise<string> {
    if (!this.apiKey) throw new Error("ANTHROPIC_API_KEY no configurada.");

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: this.modelo, max_tokens: 800, system: sistema, messages: mensajes }),
      signal: AbortSignal.timeout(30_000),
      cache: "no-store",
    });

    if (!res.ok) {
      // No se reenvía el cuerpo del error al cliente (podría incluir detalles internos).
      console.error("[chatbot] Error de la API de IA:", res.status, await res.text().catch(() => ""));
      throw new Error(`Servicio de IA no disponible (${res.status}).`);
    }

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const texto = (data.content ?? [])
      .filter((b) => b.type === "text" && b.text)
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!texto) throw new Error("Respuesta vacía del servicio de IA.");
    return texto;
  }
}
