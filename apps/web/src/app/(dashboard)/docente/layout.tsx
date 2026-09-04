import { requireRole } from "@/lib/authorization";

// Antes, cada página bajo /docente/* repetía su propio chequeo de rol
// (docente/page.tsx, docente/agregar-estudiante/page.tsx,
// docente/estudiantes/page.tsx) — riesgo real de que una página nueva se
// agregue sin protección. Se centraliza aquí, igual que ya existía para
// /admin. Páginas que necesitan una restricción MÁS estricta que "DOCENTE
// o ADMINISTRADOR" (ej. /docente/agregar-estudiante, que es solo DOCENTE)
// agregan su propio chequeo adicional encima de este.
export default async function DocenteLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["DOCENTE", "ADMINISTRADOR"]);
  return <>{children}</>;
}
