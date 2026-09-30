import { describe, expect, it } from "vitest";
import { detectarTipoImagen, validarArchivoImagen, validarInfografia, TAMANO_MAXIMO_IMAGEN } from "./infographic";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const JPG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
const WEBP = new Uint8Array([...Buffer.from("RIFF"), 0, 0, 0, 0, ...Buffer.from("WEBP")]);
const SVG = new Uint8Array(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'>"));
const PDF = new Uint8Array(Buffer.from("%PDF-1.7 ......"));

describe("infografías", () => {
  it("detecta el tipo real por la firma del archivo", () => {
    expect(detectarTipoImagen(PNG)).toBe("image/png");
    expect(detectarTipoImagen(JPG)).toBe("image/jpeg");
    expect(detectarTipoImagen(WEBP)).toBe("image/webp");
    expect(detectarTipoImagen(SVG)).toBeNull(); // SVG puede contener scripts: se rechaza
    expect(detectarTipoImagen(PDF)).toBeNull();
  });

  it("rechaza archivos vacíos, demasiado grandes o de otro formato", () => {
    expect(validarArchivoImagen(1000, PNG)).toBe("image/png");
    expect(() => validarArchivoImagen(0, PNG)).toThrow(/vacío/);
    expect(() => validarArchivoImagen(TAMANO_MAXIMO_IMAGEN + 1, PNG)).toThrow(/4 MB/);
    expect(() => validarArchivoImagen(1000, PDF)).toThrow(/PNG, JPG o WebP/);
  });

  it("valida los datos: módulo, título e imagen con enlace seguro", () => {
    expect(validarInfografia({ courseId: "c1", titulo: " Infografía ", urlImagen: "/images/x.png" })).toEqual({
      courseId: "c1", titulo: "Infografía", urlImagen: "/images/x.png", descripcion: null,
    });
    expect(() => validarInfografia({ titulo: "a", urlImagen: "/x.png" })).toThrow(/módulo/);
    expect(() => validarInfografia({ courseId: "c", titulo: "a", urlImagen: "" })).toThrow(/imagen/);
    expect(() => validarInfografia({ courseId: "c", titulo: "a", urlImagen: "javascript:alert(1)" })).toThrow();
    expect(() => validarInfografia({ courseId: "c", titulo: "a", urlImagen: "//evil.com/x.png" })).toThrow();
  });
});
