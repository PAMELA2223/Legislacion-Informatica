// Elige el proveedor de IA del chatbot según las variables de entorno:
//   1. CHATBOT_PROVIDER ("gemini" | "anthropic"), si se indica explícitamente;
//   2. si no: Gemini cuando existe GEMINI_API_KEY; si no, Anthropic cuando
//      existe ANTHROPIC_API_KEY;
//   3. sin clave: modo básico (base de conocimiento, sin IA).
import type { IChatLanguageModel } from "../domain/chatbot-ports.interface";
import { AnthropicChatModel } from "./anthropic-chat.model";
import { GeminiChatModel } from "./gemini-chat.model";

export type ProveedorIA = "gemini" | "anthropic" | "ninguno";

export interface DescripcionProveedor {
  proveedor: ProveedorIA;
  nombre: string;
  modelo: string | null;
}

type Entorno = Record<string, string | undefined>;

export function elegirProveedor(env: Entorno = process.env): ProveedorIA {
  const tieneGemini = Boolean(env.GEMINI_API_KEY?.trim());
  const tieneAnthropic = Boolean(env.ANTHROPIC_API_KEY?.trim());
  const preferido = env.CHATBOT_PROVIDER?.trim().toLowerCase();
  if (preferido === "gemini" && tieneGemini) return "gemini";
  if (preferido === "anthropic" && tieneAnthropic) return "anthropic";
  if (tieneGemini) return "gemini";
  if (tieneAnthropic) return "anthropic";
  return "ninguno";
}

export function crearModeloDeLenguaje(env: Entorno = process.env): IChatLanguageModel {
  const proveedor = elegirProveedor(env);
  if (proveedor === "gemini") return new GeminiChatModel(env.GEMINI_API_KEY?.trim(), env.GEMINI_MODEL?.trim());
  if (proveedor === "anthropic") return new AnthropicChatModel();
  return { disponible: false, responder: async () => "" };
}

export function describirProveedor(env: Entorno = process.env): DescripcionProveedor {
  const proveedor = elegirProveedor(env);
  if (proveedor === "gemini") {
    return { proveedor, nombre: "Google Gemini", modelo: new GeminiChatModel(env.GEMINI_API_KEY, env.GEMINI_MODEL?.trim()).modelo };
  }
  if (proveedor === "anthropic") {
    return { proveedor, nombre: "Anthropic Claude", modelo: env.CHATBOT_MODEL?.trim() || "claude-haiku-4-5-20251001" };
  }
  return { proveedor, nombre: "Ninguno (modo básico)", modelo: null };
}
