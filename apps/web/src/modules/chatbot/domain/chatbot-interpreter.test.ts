import { describe, expect, it } from "vitest";
import { coincidenciaConPregunta, interpretarConsulta, normalizar, UMBRAL_COINCIDENCIA_EVALUACION } from "./chatbot-interpreter";
import type { MensajeChat } from "./chatbot.entity";

const u = (content: string): MensajeChat => ({ role: "user", content });
const a = (content: string): MensajeChat => ({ role: "assistant", content });
const ids = (h: MensajeChat[]) => interpretarConsulta(h).conceptos.map((c) => c.id);

describe("interpretación de consultas (ejemplos del documento)", () => {
  it("¿Qué es un delito informático? → definición de delito informático", () => {
    const r = interpretarConsulta([u("¿Qué es un delito informático?")]);
    expect(r.intencion).toBe("definicion");
    expect(r.conceptos[0].id).toBe("delito-informatico");
  });

  it("situación sin nombrar el concepto: correo que pide la contraseña → phishing", () => {
    const r = interpretarConsulta([
      u("Me llegó un correo diciendo que debo ingresar mi contraseña en un enlace para evitar que bloqueen mi cuenta. ¿Qué tipo de situación es?"),
    ]);
    expect(r.intencion).toBe("situacion");
    expect(r.conceptos[0].id).toBe("phishing");
  });

  it("¿Qué puedo hacer si alguien utiliza mis datos personales sin autorización? → situación de protección de datos", () => {
    const r = interpretarConsulta([u("¿Qué puedo hacer si alguien utiliza mis datos personales sin autorización?")]);
    expect(r.intencion).toBe("situacion");
    expect(r.conceptos[0].id).toBe("datos-personales");
  });

  it("¿Qué hago si una persona publica mis datos personales sin permiso? → publicación sin permiso", () => {
    const r = interpretarConsulta([u("¿Qué hago si una persona publica mis datos personales sin permiso?")]);
    expect(r.intencion).toBe("situacion");
    expect(r.conceptos[0].id).toBe("publicacion-sin-permiso");
  });

  it("Explícame qué es una estafa digital / ponme un ejemplo de delito informático", () => {
    expect(ids([u("Explícame qué es una estafa digital.")])[0]).toBe("estafa-digital");
    const r = interpretarConsulta([u("Ponme un ejemplo de un delito informático.")]);
    expect(r.intencion).toBe("ejemplo");
    expect(r.conceptos[0].id).toBe("delito-informatico");
  });

  it("¿Qué diferencia existe entre privacidad y protección de datos? → diferencia con ambos conceptos", () => {
    const r = interpretarConsulta([u("¿Qué diferencia existe entre privacidad y protección de datos?")]);
    expect(r.intencion).toBe("diferencia");
    expect(r.conceptos.map((c) => c.id).sort()).toEqual(["datos-personales", "privacidad"]);
  });

  it("seguimientos: 'Ponme un ejemplo', 'Explícamelo más fácil', '¿Cuál es la diferencia?' usan el tema anterior", () => {
    const h = [u("¿Qué es phishing?"), a("El phishing es un engaño…")];
    const ej = interpretarConsulta([...h, u("Ponme un ejemplo.")]);
    expect(ej.intencion).toBe("ejemplo");
    expect(ej.conceptos[0].id).toBe("phishing");
    expect(ej.temaDelHistorial).toBe(true);

    const fac = interpretarConsulta([...h, u("Explícamelo más fácil")]);
    expect(fac.intencion).toBe("simplificar");
    expect(fac.conceptos[0].id).toBe("phishing");

    const dif = interpretarConsulta([u("¿Qué es una estafa digital?"), a("…"), u("¿y el phishing?"), a("…"), u("¿Cuál es la diferencia?")]);
    expect(dif.intencion).toBe("diferencia");
    expect(dif.conceptos.map((c) => c.id).sort()).toEqual(["estafa-digital", "phishing"]);
  });

  it("pedir la respuesta de una evaluación se reconoce", () => {
    expect(interpretarConsulta([u("¿Cuál es la respuesta correcta de la pregunta 3 de mi evaluación?")]).intencion).toBe("respuesta-evaluacion");
    expect(interpretarConsulta([u("dame las respuestas de la autoevaluación")]).intencion).toBe("respuesta-evaluacion");
  });

  it("no confunde la palabra suelta con otro concepto (tildes y mayúsculas)", () => {
    expect(normalizar("¿Qué es el PHISHING?")).toBe("que es el phishing");
    expect(ids([u("¿Qué es la firma electrónica?")])[0]).toBe("firma-electronica");
    expect(interpretarConsulta([u("hola")]).intencion).toBe("saludo");
  });
});

describe("coincidencia con preguntas de evaluación", () => {
  const pregunta = "¿Qué cuerpo legal ecuatoriano sanciona conductas como el acceso no consentido a un sistema informático?";
  it("detecta una pregunta copiada", () => {
    expect(coincidenciaConPregunta(`${pregunta} a) LOPDP b) COIP`, pregunta)).toBeGreaterThanOrEqual(UMBRAL_COINCIDENCIA_EVALUACION);
  });
  it("no bloquea consultas cortas y legítimas sobre el mismo tema", () => {
    expect(coincidenciaConPregunta("¿Qué es el acceso no consentido?", pregunta)).toBeLessThan(UMBRAL_COINCIDENCIA_EVALUACION);
    expect(coincidenciaConPregunta("¿Qué es un sistema informático?", pregunta)).toBeLessThan(UMBRAL_COINCIDENCIA_EVALUACION);
  });
});

describe("interpretación — frases del nuevo documento", () => {
  it("'de una manera sencilla' es un pedido de explicación sencilla", () => {
    expect(interpretarConsulta([u("Explícame este tema de una manera sencilla")]).intencion).toBe("simplificar");
    expect(interpretarConsulta([u("¿Me lo explicas de forma más simple?")]).intencion).toBe("simplificar");
  });
  it("caso narrado en tercera persona: correo que aparenta ser del banco → phishing (situación)", () => {
    const r = interpretarConsulta([
      u("Una persona recibe un correo que aparenta ser de su banco y le solicita ingresar sus datos y contraseña mediante un enlace."),
    ]);
    expect(r.intencion).toBe("situacion");
    expect(r.conceptos[0].id).toBe("phishing");
  });
  it("pistas combinadas sin frases exactas: SMS + clave + link → phishing", () => {
    expect(ids([u("Me mandaron un SMS con un link para actualizar mi clave")])[0]).toBe("phishing");
  });
  it("las pistas combinadas no se activan con solo una o dos pistas", () => {
    expect(ids([u("¿Cómo creo una contraseña segura para mi correo?")])).not.toContain("phishing");
  });
  it("otras preguntas del documento", () => {
    expect(ids([u("¿Qué es el comercio electrónico?")])[0]).toBe("comercio-electronico");
    expect(ids([u("¿Qué protege la propiedad intelectual?")])[0]).toBe("propiedad-intelectual");
    const ej = interpretarConsulta([u("¿Cuál sería un ejemplo de una situación relacionada con la protección de datos?")]);
    expect(ej.intencion).toBe("ejemplo");
    expect(ej.conceptos[0].id).toBe("datos-personales");
    const seg = interpretarConsulta([u("¿Qué es un delito informático?"), a("Un delito informático es…"), u("¿Y cuál sería un ejemplo?")]);
    expect(seg.intencion).toBe("ejemplo");
    expect(seg.conceptos[0].id).toBe("delito-informatico");
  });
});

describe("seguimiento: el tema sale de lo que preguntó el estudiante", () => {
  it("no se desvía por conceptos mencionados en la respuesta del asistente", () => {
    const r = interpretarConsulta([
      u("¿Qué es un delito informático?"),
      a("Un delito informático es una conducta sancionada… Por ejemplo: entrar sin permiso a la cuenta de otra persona. Acceso no consentido (COIP, art. 234)."),
      u("¿Y cuál sería un ejemplo?"),
    ]);
    expect(r.conceptos[0].id).toBe("delito-informatico");
  });
  it("si el estudiante nunca nombró un tema, usa el de la respuesta anterior", () => {
    const r = interpretarConsulta([u("hola"), a("Puedo explicarte qué es el phishing."), u("dame un ejemplo")]);
    expect(r.conceptos[0].id).toBe("phishing");
  });
});
