import { describe, expect, it } from "vitest";
import { validarPregunta } from "./question-validation";

const base = { enunciado: "¿Pregunta?", retroalimentacion: "Porque sí.", puntaje: 1 };

describe("validarPregunta", () => {
  it("acepta una opción múltiple válida y recorta los textos", () => {
    const r = validarPregunta({
      ...base,
      tipo: "OPCION_MULTIPLE",
      opciones: { alternativas: [" A ", "B", "C"] },
      respuestaCorrecta: { indiceCorrecto: 2 },
    });
    expect(r.opciones).toEqual({ alternativas: ["A", "B", "C"] });
    expect(r.respuestaCorrecta).toEqual({ indiceCorrecto: 2 });
  });

  it("rechaza una pregunta sin respuesta correcta", () => {
    expect(() =>
      validarPregunta({ ...base, tipo: "OPCION_MULTIPLE", opciones: { alternativas: ["A", "B"] }, respuestaCorrecta: undefined })
    ).toThrow(/respuesta correcta/i);
  });

  it("rechaza un índice correcto fuera de rango", () => {
    expect(() =>
      validarPregunta({
        ...base,
        tipo: "CASO",
        opciones: { alternativas: ["A", "B"] },
        respuestaCorrecta: { indiceCorrecto: 3 },
      })
    ).toThrow(/correcta/i);
  });

  it("rechaza opciones vacías o insuficientes", () => {
    expect(() =>
      validarPregunta({ ...base, tipo: "OPCION_MULTIPLE", opciones: { alternativas: ["A", "  "] }, respuestaCorrecta: { indiceCorrecto: 0 } })
    ).toThrow(/vacía/i);
    expect(() =>
      validarPregunta({ ...base, tipo: "OPCION_MULTIPLE", opciones: { alternativas: ["A"] }, respuestaCorrecta: { indiceCorrecto: 0 } })
    ).toThrow(/al menos 2/i);
  });

  it("exige que relacionar sea una permutación completa", () => {
    const opciones = { columnaIzquierda: ["a", "b", "c"], columnaDerecha: ["1", "2", "3"] };
    expect(validarPregunta({ ...base, tipo: "RELACIONAR", opciones, respuestaCorrecta: { pares: [2, 0, 1] } }).respuestaCorrecta).toEqual({
      pares: [2, 0, 1],
    });
    expect(() => validarPregunta({ ...base, tipo: "RELACIONAR", opciones, respuestaCorrecta: { pares: [0, 0, 1] } })).toThrow();
  });

  it("valida VF y completar", () => {
    expect(validarPregunta({ ...base, tipo: "VF", opciones: null, respuestaCorrecta: { esVerdadero: false } }).respuestaCorrecta).toEqual({
      esVerdadero: false,
    });
    expect(() => validarPregunta({ ...base, tipo: "COMPLETAR", opciones: null, respuestaCorrecta: { aceptadas: [" "] } })).toThrow();
  });

  it("exige enunciado, retroalimentación y puntaje válido", () => {
    expect(() => validarPregunta({ ...base, enunciado: " ", tipo: "VF", respuestaCorrecta: { esVerdadero: true } })).toThrow(/enunciado/i);
    expect(() => validarPregunta({ ...base, puntaje: 0, tipo: "VF", respuestaCorrecta: { esVerdadero: true } })).toThrow(/puntaje/i);
  });
});
