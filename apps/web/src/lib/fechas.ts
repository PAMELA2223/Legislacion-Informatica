// Formato de fechas en la zona horaria de Ecuador. Los servidores (Vercel)
// trabajan en UTC: sin indicar la zona, una evaluación rendida a las 20:00
// en Ecuador aparecería con la fecha del día siguiente.
const ZONA = "America/Guayaquil";

export function fechaHoraEC(d: Date): string {
  return d.toLocaleString("es-EC", { timeZone: ZONA, day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function fechaEC(d: Date): string {
  return d.toLocaleDateString("es-EC", { timeZone: ZONA, day: "2-digit", month: "short", year: "numeric" });
}

/** AAAA-MM-DD HH:mm (para CSV / Excel). */
export function fechaHoraCsvEC(d: Date): string {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const v = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${v("year")}-${v("month")}-${v("day")} ${v("hour")}:${v("minute")}`;
}
