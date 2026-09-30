import { afterEach, describe, expect, it, vi } from "vitest";
import { cerrarAviso, mostrarAviso, obtenerAvisos, suscribirAvisos } from "./avisos";

describe("avisos globales", () => {
  afterEach(() => vi.useRealTimers());
  it("guardan el aviso fuera de los componentes, notifican y expiran", () => {
    vi.useFakeTimers();
    const oyente = vi.fn();
    const quitar = suscribirAvisos(oyente);
    mostrarAviso("Módulo eliminado");
    expect(obtenerAvisos().map((a) => a.texto)).toContain("Módulo eliminado");
    expect(oyente).toHaveBeenCalled();
    vi.advanceTimersByTime(7001);
    expect(obtenerAvisos()).toHaveLength(0);
    mostrarAviso("otro");
    cerrarAviso(obtenerAvisos()[0].id);
    expect(obtenerAvisos()).toHaveLength(0);
    quitar();
  });
});
