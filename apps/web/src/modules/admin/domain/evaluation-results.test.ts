import { describe, expect, it } from "vitest";
import { filtrarResultados, leerFiltroEstado, resultadosACsv, resumirResultados, type IntentoDeEstudiante } from "./evaluation-results";

const d = (dia: number, hora = 10) => new Date(`2026-09-${String(dia).padStart(2, "0")}T${String(hora).padStart(2, "0")}:00:00Z`);
const intento = (userId: string, nombre: string, puntaje: number, fecha: Date): IntentoDeEstudiante => ({
  userId, nombre, email: `${userId}@utelvt.edu.ec`, puntaje, aprobado: puntaje >= 70, fecha,
});

const datos = [
  intento("u1", "Pamela Torres", 50, d(1)),
  intento("u1", "Pamela Torres", 85, d(3)),
  intento("u1", "Pamela Torres", 70, d(5)), // la última no es la mejor
  intento("u2", "Ángel Suárez", 40, d(2)),
  intento("u3", "Carla Mena", 100, d(4)),
];

describe("resultados de evaluación por estudiante", () => {
  const r = resumirResultados(datos);

  it("agrupa por estudiante y cuenta intentos", () => {
    expect(r.rindieron).toBe(3);
    expect(r.totalIntentos).toBe(5);
    expect(r.estudiantes.find((e) => e.userId === "u1")?.totalIntentos).toBe(3);
  });

  it("la calificación es el mejor intento (no el último) y su fecha", () => {
    const p = r.estudiantes.find((e) => e.userId === "u1")!;
    expect(p.calificacion).toBe(85);
    expect(p.fechaCalificacion).toEqual(d(3));
    expect(p.fechaPrimerIntento).toEqual(d(1));
    expect(p.fechaUltimoIntento).toEqual(d(5));
    expect(p.intentos.map((i) => i.puntaje)).toEqual([50, 85, 70]);
  });

  it("aprobados, no aprobados, promedio y tasa", () => {
    expect(r.aprobados).toBe(2);
    expect(r.noAprobados).toBe(1);
    expect(r.estudiantes.find((e) => e.userId === "u2")?.aprobado).toBe(false);
    expect(r.promedio).toBe(Math.round((85 + 40 + 100) / 3));
    expect(r.tasaAprobacion).toBe(67);
  });

  it("orden alfabético respetando tildes", () => {
    expect(r.estudiantes.map((e) => e.nombre)).toEqual(["Ángel Suárez", "Carla Mena", "Pamela Torres"]);
  });

  it("sin intentos: resumen vacío sin errores", () => {
    expect(resumirResultados([])).toMatchObject({ rindieron: 0, aprobados: 0, promedio: null, tasaAprobacion: null });
  });

  it("filtra por estado y busca por nombre o correo sin importar tildes", () => {
    expect(filtrarResultados(r.estudiantes, "aprobados").map((e) => e.userId).sort()).toEqual(["u1", "u3"]);
    expect(filtrarResultados(r.estudiantes, "no-aprobados").map((e) => e.userId)).toEqual(["u2"]);
    expect(filtrarResultados(r.estudiantes, "todos", "angel").map((e) => e.userId)).toEqual(["u2"]);
    expect(filtrarResultados(r.estudiantes, "todos", "u3@utelvt").map((e) => e.userId)).toEqual(["u3"]);
    expect(leerFiltroEstado("aprobados")).toBe("aprobados");
    expect(leerFiltroEstado("cualquier cosa")).toBe("todos");
  });

  it("genera CSV para Excel con BOM, separador ';' y celdas escapadas", () => {
    const csv = resultadosACsv({ modulo: "Módulo 1; Intro", evaluacion: "Evaluación 1" }, r.estudiantes, (f) => f.toISOString().slice(0, 10));
    expect(csv.startsWith("\uFEFF")).toBe(true);
    const lineas = csv.slice(1).split("\r\n");
    expect(lineas).toHaveLength(4);
    expect(lineas[0]).toContain("Calificación (%)");
    expect(lineas[3]).toContain('"Módulo 1; Intro"');
    expect(lineas[3]).toContain("Pamela Torres;u1@utelvt.edu.ec;Aprobado;85;2026-09-03;3;2026-09-01;2026-09-05;50% / 85% / 70%");
  });
});
