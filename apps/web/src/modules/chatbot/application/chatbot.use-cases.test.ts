import { describe, expect, it, vi } from "vitest";
import { ResponderConsultaUseCase } from "./chatbot.use-cases";
import type { IChatContextRepository, IChatLanguageModel } from "../domain/chatbot-ports.interface";

const PREGUNTA_EVAL = "¿Qué cuerpo legal ecuatoriano sanciona conductas como el acceso no consentido a un sistema informático?";

function contexto(): IChatContextRepository {
  return {
    buscarFragmentos: vi.fn(async () => [{ tipo: "GLOSARIO" as const, titulo: "Dato personal", texto: "Información que identifica a una persona.", url: "/glosario?q=Dato" }]),
    describirPagina: vi.fn(async (ruta: string | null) =>
      ruta?.startsWith("/modulos/")
        ? { tipo: "modulo" as const, titulo: "Protección de Datos Personales", descripcion: "LOPDP", extracto: "Derechos del titular…" }
        : null
    ),
    enunciadosDeEvaluaciones: vi.fn(async () => [PREGUNTA_EVAL]),
  };
}

describe("ResponderConsultaUseCase", () => {
  it("con IA: envía intención, contexto del módulo y conversación completa", async () => {
    const modelo: IChatLanguageModel = { disponible: true, responder: vi.fn(async () => "Un ejemplo de phishing es…") };
    const r = await new ResponderConsultaUseCase(contexto(), modelo).execute(
      [
        { role: "user", content: "¿Qué es phishing?" },
        { role: "assistant", content: "El phishing es un engaño…" },
        { role: "user", content: "Ponme un ejemplo" },
      ],
      "/modulos/proteccion-datos-personales"
    );
    expect(r.modo).toBe("ia");
    const [sistema, mensajes] = (modelo.responder as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(sistema).toMatch(/pide un EJEMPLO del tema del que venían hablando/);
    expect(sistema).toContain("### Phishing");
    expect(sistema).toContain('módulo "Protección de Datos Personales"');
    expect(mensajes).toHaveLength(3); // el modelo recibe el historial para entender el seguimiento
    expect(r.sugerencias).toContain("Explícamelo más fácil");
  });

  it("sin clave de IA (o si falla) responde en modo básico según la intención", async () => {
    const sinClave: IChatLanguageModel = { disponible: false, responder: vi.fn() };
    const r = await new ResponderConsultaUseCase(contexto(), sinClave).execute(
      [{ role: "user", content: "¿Qué hago si una persona publica mis datos personales sin permiso?" }],
      null
    );
    expect(r.modo).toBe("basico");
    expect(r.respuesta).toMatch(/Qué puedes hacer/);
    expect(sinClave.responder).not.toHaveBeenCalled();

    const falla: IChatLanguageModel = { disponible: true, responder: vi.fn(async () => { throw new Error("x"); }) };
    const r2 = await new ResponderConsultaUseCase(contexto(), falla).execute([{ role: "user", content: "¿Qué es phishing?" }], null);
    expect(r2.modo).toBe("basico");
    expect(r2.respuesta).toMatch(/phishing/i);
  });

  it("una pregunta de evaluación copiada: la IA recibe la advertencia y el modo básico no da la respuesta", async () => {
    const modelo: IChatLanguageModel = { disponible: true, responder: vi.fn(async () => "Te explico el concepto…") };
    await new ResponderConsultaUseCase(contexto(), modelo).execute([{ role: "user", content: `${PREGUNTA_EVAL} a) LOPDP b) COIP` }], null);
    expect((modelo.responder as ReturnType<typeof vi.fn>).mock.calls[0][0]).toMatch(/coincide con una pregunta de una evaluación/);

    const basico: IChatLanguageModel = { disponible: false, responder: vi.fn() };
    const r = await new ResponderConsultaUseCase(contexto(), basico).execute([{ role: "user", content: `${PREGUNTA_EVAL} a) LOPDP b) COIP` }], null);
    expect(r.respuesta).not.toMatch(/\bCOIP\b/);
    expect(r.fuentes).toEqual([]);
  });
});
