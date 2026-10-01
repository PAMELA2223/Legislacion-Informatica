import { describe, expect, it, vi } from "vitest";
import { GeminiChatModel, MODELOS_GEMINI } from "./gemini-chat.model";
import { crearModeloDeLenguaje, describirProveedor, elegirProveedor } from "./language-model.factory";

const CLAVE = "clave-secreta-de-prueba";
const ok = (texto: string) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: texto }] }, finishReason: "STOP" }] }), { status: 200 });

describe("GeminiChatModel", () => {
  it("sin clave no está disponible", () => {
    expect(new GeminiChatModel(undefined).disponible).toBe(false);
    expect(new GeminiChatModel("  ".trim() || undefined).disponible).toBe(false);
  });

  it("envía la clave en la cabecera, las instrucciones y la conversación con roles user/model", async () => {
    const fetchFn = vi.fn(async () => ok("Un delito informático es…"));
    const m = new GeminiChatModel(CLAVE, undefined, fetchFn as unknown as typeof fetch);
    const r = await m.responder("INSTRUCCIONES", [
      { role: "user", content: "¿Qué es un delito informático?" },
      { role: "assistant", content: "Es…" },
      { role: "user", content: "¿Y un ejemplo?" },
    ]);
    expect(r).toBe("Un delito informático es…");
    const [url, opciones] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`https://generativelanguage.googleapis.com/v1beta/models/${MODELOS_GEMINI[0]}:generateContent`);
    expect((opciones.headers as Record<string, string>)["x-goog-api-key"]).toBe(CLAVE);
    expect(url).not.toContain(CLAVE); // la clave nunca va en la URL
    const cuerpo = JSON.parse(String(opciones.body));
    expect(cuerpo.systemInstruction.parts[0].text).toBe("INSTRUCCIONES");
    expect(cuerpo.contents.map((c: { role: string }) => c.role)).toEqual(["user", "model", "user"]);
  });

  it("respeta GEMINI_MODEL y, si el modelo ya no existe (404), prueba el siguiente", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(ok("Respuesta del modelo alternativo"));
    const m = new GeminiChatModel(CLAVE, "gemini-modelo-retirado", fetchFn as unknown as typeof fetch);
    expect(m.modelo).toBe("gemini-modelo-retirado");
    expect(await m.responder("s", [{ role: "user", content: "hola" }])).toBe("Respuesta del modelo alternativo");
    expect(String(fetchFn.mock.calls[1][0])).toContain(`/${MODELOS_GEMINI[0]}:generateContent`);
  });

  it("omite los 'pensamientos' internos y une las partes de texto", async () => {
    const fetchFn = vi.fn(async () =>
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "pensando…", thought: true }, { text: "Hola " }, { text: "mundo" }] } }] }), { status: 200 })
    );
    expect(await new GeminiChatModel(CLAVE, undefined, fetchFn as unknown as typeof fetch).responder("s", [{ role: "user", content: "x" }])).toBe("Hola mundo");
  });

  it("errores: clave inválida, bloqueo de seguridad o respuesta vacía → lanza (el chatbot pasa al modo básico) sin exponer la clave", async () => {
    const con = (res: Response) => new GeminiChatModel(CLAVE, undefined, (async () => res) as unknown as typeof fetch);
    const espia = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(con(new Response("API key not valid", { status: 400 })).responder("s", [{ role: "user", content: "x" }])).rejects.toThrow(/no disponible \(400\)/);
    await expect(con(new Response(JSON.stringify({ promptFeedback: { blockReason: "SAFETY" } }), { status: 200 })).responder("s", [{ role: "user", content: "x" }])).rejects.toThrow(/bloqueada/);
    await expect(con(new Response(JSON.stringify({ candidates: [{ finishReason: "MAX_TOKENS" }] }), { status: 200 })).responder("s", [{ role: "user", content: "x" }])).rejects.toThrow(/vacía/);
    const err = await con(new Response("x", { status: 403 })).responder("s", [{ role: "user", content: "x" }]).catch((e: Error) => e.message);
    expect(err).not.toContain(CLAVE);
    espia.mockRestore();
  });

  it("si ninguno de los modelos existe, lo indica", async () => {
    const m = new GeminiChatModel(CLAVE, undefined, (async () => new Response("", { status: 404 })) as unknown as typeof fetch);
    await expect(m.responder("s", [{ role: "user", content: "x" }])).rejects.toThrow(/GEMINI_MODEL/);
  });
});

describe("selección del proveedor de IA", () => {
  it("Gemini cuando existe GEMINI_API_KEY; Anthropic si solo existe su clave; ninguno sin claves", () => {
    expect(elegirProveedor({ GEMINI_API_KEY: "g" })).toBe("gemini");
    expect(elegirProveedor({ ANTHROPIC_API_KEY: "a" })).toBe("anthropic");
    expect(elegirProveedor({ GEMINI_API_KEY: "g", ANTHROPIC_API_KEY: "a" })).toBe("gemini");
    expect(elegirProveedor({ GEMINI_API_KEY: "g", ANTHROPIC_API_KEY: "a", CHATBOT_PROVIDER: "anthropic" })).toBe("anthropic");
    expect(elegirProveedor({})).toBe("ninguno");
    expect(elegirProveedor({ GEMINI_API_KEY: "   " })).toBe("ninguno");
  });
  it("crea el modelo correspondiente y lo describe para el panel", () => {
    expect(crearModeloDeLenguaje({ GEMINI_API_KEY: "g" })).toBeInstanceOf(GeminiChatModel);
    expect(crearModeloDeLenguaje({}).disponible).toBe(false);
    expect(describirProveedor({ GEMINI_API_KEY: "g", GEMINI_MODEL: "gemini-x" })).toEqual({ proveedor: "gemini", nombre: "Google Gemini", modelo: "gemini-x" });
    expect(describirProveedor({}).proveedor).toBe("ninguno");
  });
});
