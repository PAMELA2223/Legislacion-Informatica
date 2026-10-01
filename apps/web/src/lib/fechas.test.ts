import { describe, expect, it } from "vitest";
import { fechaHoraCsvEC } from "./fechas";

describe("fechas en hora de Ecuador", () => {
  it("una evaluación a las 20:30 en Ecuador (01:30 UTC del día siguiente) conserva su fecha local", () => {
    expect(fechaHoraCsvEC(new Date("2026-09-30T01:30:00Z"))).toBe("2026-09-29 20:30");
  });
});
