// Resultados de una evaluación de módulo, agrupados por estudiante, para el
// panel de administración (solo consulta: no cambia nada de las evaluaciones).
//
// Usa la MISMA regla que aplica el flujo del estudiante (learning-path):
//   - la calificación que cuenta es el mejor intento;
//   - el estudiante aprobó si alcanzó el mínimo (70%) en algún intento.
// Así el panel y lo que ve el estudiante nunca se contradicen.

export interface IntentoDeEstudiante {
  userId: string;
  nombre: string;
  email: string;
  puntaje: number;
  aprobado: boolean;
  fecha: Date;
}

export interface ResultadoEstudiante {
  userId: string;
  nombre: string;
  email: string;
  aprobado: boolean;
  /** Calificación que cuenta (mejor intento). */
  calificacion: number;
  /** Fecha del intento que cuenta. */
  fechaCalificacion: Date;
  fechaPrimerIntento: Date;
  fechaUltimoIntento: Date;
  totalIntentos: number;
  /** Historial en orden cronológico. */
  intentos: { puntaje: number; aprobado: boolean; fecha: Date }[];
}

export interface ResumenResultados {
  estudiantes: ResultadoEstudiante[];
  rindieron: number;
  aprobados: number;
  noAprobados: number;
  /** Promedio de las calificaciones que cuentan (null si nadie rindió). */
  promedio: number | null;
  /** % de estudiantes que aprobaron (null si nadie rindió). */
  tasaAprobacion: number | null;
  totalIntentos: number;
}

export type FiltroEstado = "todos" | "aprobados" | "no-aprobados";

export function resumirResultados(intentos: IntentoDeEstudiante[]): ResumenResultados {
  const porEstudiante = new Map<string, IntentoDeEstudiante[]>();
  for (const i of [...intentos].sort((a, b) => a.fecha.getTime() - b.fecha.getTime())) {
    const lista = porEstudiante.get(i.userId) ?? [];
    lista.push(i);
    porEstudiante.set(i.userId, lista);
  }

  const estudiantes: ResultadoEstudiante[] = Array.from(porEstudiante.values()).map((lista) => {
    // Mejor intento; ante empate, el más antiguo (cuando lo logró por primera vez).
    const mejor = lista.reduce((m, i) => (i.puntaje > m.puntaje ? i : m));
    return {
      userId: lista[0].userId,
      nombre: lista[0].nombre,
      email: lista[0].email,
      aprobado: lista.some((i) => i.aprobado),
      calificacion: mejor.puntaje,
      fechaCalificacion: mejor.fecha,
      fechaPrimerIntento: lista[0].fecha,
      fechaUltimoIntento: lista[lista.length - 1].fecha,
      totalIntentos: lista.length,
      intentos: lista.map(({ puntaje, aprobado, fecha }) => ({ puntaje, aprobado, fecha })),
    };
  });

  // Orden por defecto: alfabético por nombre (fácil de ubicar a un estudiante).
  estudiantes.sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

  const rindieron = estudiantes.length;
  const aprobados = estudiantes.filter((e) => e.aprobado).length;
  return {
    estudiantes,
    rindieron,
    aprobados,
    noAprobados: rindieron - aprobados,
    promedio: rindieron ? Math.round(estudiantes.reduce((s, e) => s + e.calificacion, 0) / rindieron) : null,
    tasaAprobacion: rindieron ? Math.round((aprobados / rindieron) * 100) : null,
    totalIntentos: intentos.length,
  };
}

function normalizar(t: string) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function filtrarResultados(lista: ResultadoEstudiante[], estado: FiltroEstado, busqueda = ""): ResultadoEstudiante[] {
  const q = normalizar(busqueda.trim());
  return lista.filter(
    (e) =>
      (estado === "todos" || (estado === "aprobados" ? e.aprobado : !e.aprobado)) &&
      (!q || normalizar(e.nombre).includes(q) || normalizar(e.email).includes(q))
  );
}

export function leerFiltroEstado(valor: string | undefined): FiltroEstado {
  return valor === "aprobados" || valor === "no-aprobados" ? valor : "todos";
}

/** CSV para Excel (separador ";" y BOM UTF-8, para que las tildes se vean bien). */
export function resultadosACsv(
  meta: { modulo: string; evaluacion: string },
  estudiantes: ResultadoEstudiante[],
  formatoFecha: (d: Date) => string
): string {
  const celda = (v: string | number) => {
    const s = String(v);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const filas = [
    ["Módulo", "Evaluación", "Estudiante", "Correo", "Estado", "Calificación (%)", "Fecha de la calificación", "Intentos", "Primer intento", "Último intento", "Historial de notas"],
    ...estudiantes.map((e) => [
      meta.modulo,
      meta.evaluacion,
      e.nombre,
      e.email,
      e.aprobado ? "Aprobado" : "No aprobado",
      e.calificacion,
      formatoFecha(e.fechaCalificacion),
      e.totalIntentos,
      formatoFecha(e.fechaPrimerIntento),
      formatoFecha(e.fechaUltimoIntento),
      e.intentos.map((i) => `${i.puntaje}%`).join(" / "),
    ]),
  ];
  return "\uFEFF" + filas.map((f) => f.map(celda).join(";")).join("\r\n");
}
