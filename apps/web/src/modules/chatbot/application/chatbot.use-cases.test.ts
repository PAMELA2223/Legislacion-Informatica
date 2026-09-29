import { describe, expect, it, vi } from "vitest";
import { ResponderConsultaUseCase } from "./chatbot.use-cases";
import type { IChatContextRepository, IChatLanguageModel } from "../domain/chatbot-ports.interface";

const contexto: IChatContextRepository = {
  buscarFragmentos: vi.fn(async () => [{ tipo: "GLOSARIO" as const, titulo: "Dato personal", texto: "Información que identifica…", url: "/glosario?q=Dato" }]),
  describirPagina: vi.fn(async () => null),
};

describe("ResponderConsultaUseCase", () => {
  it("usa la IA cuando está disponible e incluye fuentes", async () => {
    const modelo: IChatLanguageModel = { disponible: true, responder: vi.fn(async () => "Un dato personal es…") };
    const r = await new ResponderConsultaUseCase(contexto, modelo).execute([{ role: "user", content: "¿Qué es un dato personal?" }], null);
    expect(r.modo).toBe("ia");
    expect(r.respuesta).toContain("dato personal");
    expect(r.fuentes[0].url).toBe("/glosario?q=Dato");
    const sistema = (modelo.responder as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(sistema).toContain("Dato personal");
  });

  it("responde en modo básico sin clave de IA o si la IA falla", async () => {
    const sinClave: IChatLanguageModel = { disponible: false, responder: vi.fn() };
    const r1 = await new ResponderConsultaUseCase(contexto, sinClave).execute([{ role: "user", content: "dato personal" }], null);
    expect(r1.modo).toBe("basico");
    expect(sinClave.responder).not.toHaveBeenCalled();

    const falla: IChatLanguageModel = { disponible: true, responder: vi.fn(async () => { throw new Error("x"); }) };
    const r2 = await new ResponderConsultaUseCase(contexto, falla).execute([{ role: "user", content: "dato personal" }], null);
    expect(r2.modo).toBe("basico");
    expect(r2.respuesta).toContain("Dato personal");
  });
});
