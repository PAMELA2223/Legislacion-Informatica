// Avisos breves (toasts) globales.
// El estado vive en este módulo (no en un componente): así un aviso como
// "Módulo eliminado" sigue visible aunque la fila que tenía el botón
// desaparezca y aunque router.refresh() vuelva a montar los componentes.

export interface Aviso {
  id: number;
  texto: string;
}

const DURACION_MS = 7000;
let avisos: Aviso[] = [];
const oyentes = new Set<() => void>();
const notificar = () => oyentes.forEach((o) => o());

export function mostrarAviso(texto: string) {
  const id = Date.now() + Math.random();
  avisos = [...avisos, { id, texto }];
  notificar();
  setTimeout(() => cerrarAviso(id), DURACION_MS);
}

export function cerrarAviso(id: number) {
  avisos = avisos.filter((a) => a.id !== id);
  notificar();
}

export function obtenerAvisos(): Aviso[] {
  return avisos;
}

const SIN_AVISOS: Aviso[] = [];
export function obtenerAvisosServidor(): Aviso[] {
  return SIN_AVISOS;
}

export function suscribirAvisos(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}
