import { describe, it, expect } from "vitest";
import { LibraryRules } from "./library.entity";

describe("LibraryRules.tieneFuenteVerificada", () => {
  it("requiere fuente oficial Y enlace oficial, no solo uno de los dos", () => {
    expect(LibraryRules.tieneFuenteVerificada({ fuenteOficial: null, enlaceOficial: null })).toBe(false);
    expect(
      LibraryRules.tieneFuenteVerificada({ fuenteOficial: "Registro Oficial", enlaceOficial: null })
    ).toBe(false);
    expect(
      LibraryRules.tieneFuenteVerificada({ fuenteOficial: null, enlaceOficial: "https://gob.ec/x" })
    ).toBe(false);
  });

  it("considera verificada una norma con ambos campos presentes", () => {
    expect(
      LibraryRules.tieneFuenteVerificada({
        fuenteOficial: "Registro Oficial del Ecuador (gob.ec)",
        enlaceOficial: "https://www.gob.ec/regulaciones/constitucion-republica-ecuador",
      })
    ).toBe(true);
  });

  it("no considera verificada una fuente con espacios en blanco únicamente", () => {
    expect(LibraryRules.tieneFuenteVerificada({ fuenteOficial: "   ", enlaceOficial: "   " })).toBe(false);
  });
});

describe("LibraryRules.filtrarPorCategoria", () => {
  const doc = (categoria: "LOPDP" | "COIP") => ({
    id: categoria,
    titulo: categoria,
    categoria,
    tags: [],
    contenido: "",
    descargas: 0,
    updatedAt: "2024-01-01T00:00:00.000Z", // fijo: evita que dos llamadas a doc() difieran por milisegundos
    estado: "VIGENTE" as const,
    articulos: [],
  });

  it("sin categoría devuelve todos los documentos", () => {
    const docs = [doc("LOPDP"), doc("COIP")];
    expect(LibraryRules.filtrarPorCategoria(docs)).toHaveLength(2);
  });

  it("filtra solo los documentos de la categoría indicada", () => {
    const docs = [doc("LOPDP"), doc("COIP")];
    expect(LibraryRules.filtrarPorCategoria(docs, "COIP")).toEqual([doc("COIP")]);
  });
});
