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

describe("ResponderConsultaUseCase — nuevas reglas", () => {
  const sinIA: IChatLanguageModel = { disponible: false, responder: vi.fn() };
  const vacio = (pagina: { tipo: "modulo"; titulo: string; descripcion: string; extracto: string } | null = null): IChatContextRepository => ({
    buscarFragmentos: vi.fn(async () => []),
    describirPagina: vi.fn(async () => pagina),
    enunciadosDeEvaluaciones: vi.fn(async () => []),
  });
  const moduloDatos = { tipo: "modulo" as const, titulo: "Protección de Datos Personales", descripcion: "LOPDP, consentimiento y derechos del titular", extracto: "" };

  it("'Explícame este tema de una manera sencilla' dentro de un módulo usa el tema del módulo", async () => {
    const r = await new ResponderConsultaUseCase(vacio(moduloDatos), sinIA).execute(
      [{ role: "user", content: "Explícame este tema de una manera sencilla" }],
      "/modulos/proteccion-datos-personales"
    );
    expect(r.respuesta).toMatch(/Tus datos son tuyos/);
    expect(r.meta).toMatchObject({ intencion: "simplificar", tema: "datos-personales", contexto: "modulo", conInformacion: true });
  });

  it("'¿Qué significa consentimiento?' en el módulo de protección de datos", async () => {
    const r = await new ResponderConsultaUseCase(vacio(moduloDatos), sinIA).execute(
      [{ role: "user", content: "¿Qué significa consentimiento?" }],
      "/modulos/proteccion-datos-personales"
    );
    expect(r.respuesta).toMatch(/libre, específico, informado e inequívoco/);
  });

  it("sin información suficiente lo dice claramente (no inventa) y se registra como tal", async () => {
    const r = await new ResponderConsultaUseCase(vacio(), sinIA).execute([{ role: "user", content: "¿Qué establece la ley sobre los drones?" }], null);
    expect(r.respuesta).toMatch(/No encuentro información suficiente sobre ese tema dentro del contenido disponible/);
    expect(r.meta.conInformacion).toBe(false);
  });

  it("una pregunta fuera de tema se redirige a la función educativa", async () => {
    const r = await new ResponderConsultaUseCase(vacio(), sinIA).execute([{ role: "user", content: "¿Cuál es la capital de Australia?" }], null);
    expect(r.respuesta).toMatch(/^Puedo ayudarte principalmente con temas de legislación informática/);
  });

  it("respeta los contenidos configurados por el administrador", async () => {
    const ctx = vacio();
    const soloGlosario = { activo: true, fuentes: ["GLOSARIO" as const] };
    const r = await new ResponderConsultaUseCase(ctx, sinIA, soloGlosario).execute([{ role: "user", content: "¿Qué es phishing?" }], null);
    expect((ctx.buscarFragmentos as ReturnType<typeof vi.fn>).mock.calls[0][1]).toEqual(["GLOSARIO"]);
    // Sin la base de conocimiento habilitada, no responde con sus fichas:
    expect(r.respuesta).toMatch(/No encuentro información suficiente/);
  });

  it("la IA recibe la regla de no inventar y la estructura concepto → explicación → ejemplo", async () => {
    const modelo: IChatLanguageModel = { disponible: true, responder: vi.fn(async () => "…") };
    await new ResponderConsultaUseCase(vacio(), modelo).execute([{ role: "user", content: "¿Qué es el comercio electrónico?" }], null);
    const sistema = (modelo.responder as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(sistema).toMatch(/Responde ÚNICAMENTE con base en/);
    expect(sistema).toMatch(/No encuentro información suficiente/);
    expect(sistema).toMatch(/concepto → explicación sencilla → ejemplo práctico/);
  });

  it("caso del correo del banco: identifica el riesgo y medidas de prevención", async () => {
    const r = await new ResponderConsultaUseCase(vacio(), sinIA).execute(
      [{ role: "user", content: "Una persona recibe un correo que aparenta ser de su banco y le solicita ingresar sus datos y contraseña mediante un enlace. ¿Qué tipo de situación es?" }],
      null
    );
    expect(r.respuesta.toLowerCase()).toContain("phishing");
    expect(r.respuesta).toMatch(/Qué puedes hacer/);
  });
});
