// Pruebas de la corrección de la mensajería: el chatbot analiza PRIMERO el
// mensaje actual y nunca responde con un tema distinto.
import { describe, expect, it, vi } from "vitest";
import { ResponderConsultaUseCase } from "./chatbot.use-cases";
import type { IChatContextRepository, IChatLanguageModel } from "../domain/chatbot-ports.interface";
import type { FragmentoContexto, MensajeChat } from "../domain/chatbot.entity";

const u = (content: string): MensajeChat => ({ role: "user", content });
const a = (content: string): MensajeChat => ({ role: "assistant", content });
const LECCION_CONTRASENAS: FragmentoContexto = {
  tipo: "LECCION",
  titulo: "Seguridad de contraseñas y autenticación",
  texto: "Una contraseña segura es larga, única para cada servicio y no se basa en información fácil de adivinar.",
  url: "/modulos/seguridad-contrasenas",
};
const MODULO_CONTRASENAS = { tipo: "modulo" as const, titulo: "Seguridad de contraseñas y autenticación", descripcion: "Contraseñas seguras y verificación en dos pasos", extracto: "Una contraseña segura es larga…" };

/** Contexto que SIEMPRE devuelve la lección de contraseñas: simula el peor caso de la captura. */
function contexto(pagina: typeof MODULO_CONTRASENAS | null = null) {
  return {
    buscarFragmentos: vi.fn(async () => [LECCION_CONTRASENAS]),
    describirPagina: vi.fn(async () => pagina),
    enunciadosDeEvaluaciones: vi.fn(async () => []),
  } satisfies IChatContextRepository;
}
const sinIA = (): IChatLanguageModel => ({ disponible: false, responder: vi.fn() });
const conIA = (): IChatLanguageModel => ({ disponible: true, responder: vi.fn(async () => "respuesta de la IA") });

describe("1. Saludos", () => {
  it("ESCENARIO DE LA CAPTURA: 'hola' tras hablar de contraseñas → saluda, no explica contraseñas", async () => {
    const ctx = contexto();
    const r = await new ResponderConsultaUseCase(ctx, sinIA()).execute(
      [u("¿Cómo creo una contraseña segura?"), a("Según el contenido de la plataforma (Seguridad de contraseñas…)"), u("hola")],
      "/dashboard"
    );
    expect(r.respuesta).toMatch(/^¡Hola! 👋 Soy tu asistente de legislación informática/);
    expect(r.respuesta).not.toMatch(/contraseña/i);
    expect(r.fuentes).toEqual([]);
    expect(ctx.buscarFragmentos).not.toHaveBeenCalled(); // ni siquiera busca contenido
  });

  it.each(["Hola", "Hola 👋", "Buenos días", "Buenas tardes", "Buenas noches", "hola!!", "Hola asistente"])("'%s' → saludo", async (texto) => {
    const r = await new ResponderConsultaUseCase(contexto(), sinIA()).execute([u(texto)], null);
    expect(r.respuesta).toMatch(/Soy tu asistente de legislación informática/);
    expect(r.meta.intencion).toBe("saludo");
  });

  it("'¿Cómo estás?' responde de forma natural", async () => {
    const r = await new ResponderConsultaUseCase(contexto(), sinIA()).execute([u("¿Cómo estás?")], null);
    expect(r.respuesta).toMatch(/^¡Muy bien, gracias por preguntar!/);
  });

  it("'¿Qué puedes hacer?' explica sus funciones sin desarrollar un tema", async () => {
    const r = await new ResponderConsultaUseCase(contexto(), sinIA()).execute([u("¿Qué puedes hacer?")], null);
    expect(r.respuesta).toMatch(/Puedo ayudarte a comprender/);
    expect(r.meta.intencion).toBe("capacidades");
  });

  it("los saludos no gastan una consulta a la IA, aunque esté activa", async () => {
    const modelo = conIA();
    const r = await new ResponderConsultaUseCase(contexto(), modelo).execute([u("Buenas tardes")], null);
    expect(modelo.responder).not.toHaveBeenCalled();
    expect(r.respuesta).toMatch(/¡Hola! 👋/);
  });

  it("'hola, ¿qué es el phishing?' NO es solo un saludo: responde la pregunta", async () => {
    const r = await new ResponderConsultaUseCase(contexto(), sinIA()).execute([u("Hola, ¿qué es el phishing?")], null);
    expect(r.respuesta).toMatch(/phishing es un engaño/i);
  });

  it("agradecimientos y despedidas", async () => {
    expect((await new ResponderConsultaUseCase(contexto(), sinIA()).execute([u("muchas gracias")], null)).respuesta).toMatch(/De nada/);
    expect((await new ResponderConsultaUseCase(contexto(), sinIA()).execute([u("adiós")], null)).respuesta).toMatch(/Hasta pronto/);
  });
});

describe("2-3. Preguntas y contexto", () => {
  it("¿Qué es un delito informático? → responde ese tema", async () => {
    const r = await new ResponderConsultaUseCase(contexto(), sinIA()).execute([u("¿Qué es un delito informático?")], null);
    expect(r.respuesta).toMatch(/delito informático es/i);
  });

  it("'¿Y cuál es un ejemplo?' usa el tema anterior (protección de datos); un 'Hola' posterior NO continúa el tema", async () => {
    const h = [u("¿Qué es la protección de datos?"), a("La protección de datos personales es…")];
    const ej = await new ResponderConsultaUseCase(contexto(), sinIA()).execute([...h, u("¿Y cuál es un ejemplo?")], null);
    expect(ej.respuesta).toMatch(/^Ejemplo de protección de datos/i);
    const hola = await new ResponderConsultaUseCase(contexto(), sinIA()).execute([...h, u("¿Y cuál es un ejemplo?"), a(ej.respuesta), u("Hola")], null);
    expect(hola.respuesta).toMatch(/^¡Hola!/);
    expect(hola.respuesta).not.toMatch(/datos/i);
  });

  it("una pregunta nueva no arrastra las palabras de la conversación anterior a la búsqueda", async () => {
    const ctx = contexto();
    await new ResponderConsultaUseCase(ctx, sinIA()).execute([u("¿Cómo creo una contraseña segura?"), a("…"), u("¿Qué es la firma electrónica?")], null);
    const terminos = (ctx.buscarFragmentos.mock.calls[0] as unknown as [string[]])[0];
    expect(terminos).not.toContain("contraseña");
    expect(terminos).toContain("firma");
  });
});

describe("4. El módulo actual es contexto secundario", () => {
  it("en el módulo de contraseñas, 'hola' → saludo (no el contenido del módulo)", async () => {
    const r = await new ResponderConsultaUseCase(contexto(MODULO_CONTRASENAS), sinIA()).execute([u("hola")], "/modulos/seguridad-contrasenas");
    expect(r.respuesta).toMatch(/^¡Hola!/);
  });

  it("en el módulo de contraseñas, '¿cómo puedo crear una contraseña segura?' → usa el contenido del módulo", async () => {
    const r = await new ResponderConsultaUseCase(contexto(MODULO_CONTRASENAS), sinIA()).execute(
      [u("¿Cómo puedo crear una contraseña segura?")],
      "/modulos/seguridad-contrasenas"
    );
    expect(r.respuesta).toMatch(/contraseña segura es larga/);
  });

  it("con IA: el módulo se envía marcado como contexto SECUNDARIO y la IA debe responder al último mensaje", async () => {
    const modelo = conIA();
    await new ResponderConsultaUseCase(contexto(MODULO_CONTRASENAS), modelo).execute([u("¿Qué es la firma electrónica?")], "/modulos/seguridad-contrasenas");
    const [sistema, mensajes] = (modelo.responder as ReturnType<typeof vi.fn>).mock.calls[0] as [string, MensajeChat[]];
    expect(sistema).toMatch(/CONTEXTO SECUNDARIO/);
    expect(sistema).toMatch(/Si pregunta otra cosa, no lo menciones/);
    expect(sistema).toMatch(/Responde SIEMPRE al ÚLTIMO mensaje/);
    // La pregunta del estudiante va como mensaje del estudiante; el módulo NO se envía como pregunta.
    expect(mensajes[mensajes.length - 1]).toEqual({ role: "user", content: "¿Qué es la firma electrónica?" });
    expect(mensajes.some((m) => m.content.includes("Seguridad de contraseñas"))).toBe(false);
  });

  it("no muestra contenido no relacionado con la pregunta actual", async () => {
    const r = await new ResponderConsultaUseCase(contexto(), sinIA()).execute([u("¿Qué es la propiedad intelectual?")], null);
    expect(r.respuesta).not.toMatch(/contraseña/i);
    expect(r.fuentes.map((f) => f.titulo)).not.toContain(LECCION_CONTRASENAS.titulo);
  });
});

describe("5-6. Fuera de tema y mensajes vacíos", () => {
  it("¿Cuál es el clima de hoy? → redirige a los temas de la plataforma", async () => {
    const r = await new ResponderConsultaUseCase(contexto(), sinIA()).execute([u("¿Cuál es el clima de hoy?")], null);
    expect(r.respuesta).toMatch(/^Puedo ayudarte principalmente con temas de legislación informática/);
    expect(r.meta.intencion).toBe("fuera-de-tema");
  });

  it("un tema del ámbito sin información → lo indica (no lo trata como fuera de tema)", async () => {
    const ctx = { ...contexto(), buscarFragmentos: vi.fn(async () => []) };
    const r = await new ResponderConsultaUseCase(ctx, sinIA()).execute([u("¿Qué dice la ley sobre los drones?")], null);
    expect(r.respuesta).toMatch(/No encuentro información suficiente/);
  });

  it.each(["", "   ", "\n"])("mensaje vacío (%j): no se consulta a la IA ni se genera respuesta", async (texto) => {
    const modelo = conIA();
    await expect(new ResponderConsultaUseCase(contexto(), modelo).execute([u(texto)], null)).rejects.toThrow();
    expect(modelo.responder).not.toHaveBeenCalled();
  });
});
