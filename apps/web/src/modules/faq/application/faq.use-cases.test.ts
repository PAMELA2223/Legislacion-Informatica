import { describe, it, expect } from "vitest";
import { agruparPorCategoria } from "./faq.use-cases";
import type { FaqItem } from "../domain/faq.entity";

function item(overrides: Partial<FaqItem>): FaqItem {
  return {
    id: "1",
    pregunta: "¿Pregunta?",
    respuesta: "Respuesta.",
    categoria: "General",
    orden: 1,
    publicado: true,
    ...overrides,
  };
}

describe("agruparPorCategoria", () => {
  it("agrupa las preguntas bajo su categoría", () => {
    const items = [
      item({ id: "1", categoria: "Ciberseguridad" }),
      item({ id: "2", categoria: "Firma electrónica" }),
      item({ id: "3", categoria: "Ciberseguridad" }),
    ];
    const grupos = agruparPorCategoria(items);
    expect(grupos.get("Ciberseguridad")).toHaveLength(2);
    expect(grupos.get("Firma electrónica")).toHaveLength(1);
  });

  it("conserva el orden de primera aparición de cada categoría", () => {
    const items = [
      item({ id: "1", categoria: "B" }),
      item({ id: "2", categoria: "A" }),
    ];
    const categorias = Array.from(agruparPorCategoria(items).keys());
    expect(categorias).toEqual(["B", "A"]);
  });

  it("con una lista vacía devuelve un mapa vacío", () => {
    expect(agruparPorCategoria([]).size).toBe(0);
  });
});
