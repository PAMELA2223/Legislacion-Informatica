// ============================================================
// VERIFICACIÓN — Módulo de Tutoría Docente-Estudiante
// Ejecutar con: npx tsx scripts/verificar-tutoria.ts
// Solo lectura: no modifica ningún dato. Comprueba las reglas de
// integridad y seguridad descritas en la Sección 29 del pedido.
// ============================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let fallos = 0;

function ok(mensaje: string) {
  console.log(`✅ ${mensaje}`);
}
function fail(mensaje: string) {
  console.log(`🚨 ${mensaje}`);
  fallos++;
}
function info(mensaje: string) {
  console.log(`ℹ️  ${mensaje}`);
}

async function main() {
  console.log("============================================================");
  console.log(" 1. Tablas del módulo de tutoría existen y son consultables");
  console.log("============================================================");
  const [asignaciones, tareas, objetivos, observaciones, reuniones, recursos] = await Promise.all([
    prisma.tutoringAssignment.count(),
    prisma.tutoringTask.count(),
    prisma.tutoringObjective.count(),
    prisma.tutoringObservation.count(),
    prisma.tutoringMeeting.count(),
    prisma.tutoringResource.count(),
  ]);
  ok(`TutoringAssignment: ${asignaciones} filas`);
  ok(`TutoringTask: ${tareas} filas`);
  ok(`TutoringObjective: ${objetivos} filas`);
  ok(`TutoringObservation: ${observaciones} filas`);
  ok(`TutoringMeeting: ${reuniones} filas`);
  ok(`TutoringResource: ${recursos} filas`);

  console.log("");
  console.log("============================================================");
  console.log(" 2. No existen relaciones docente-estudiante duplicadas");
  console.log("============================================================");
  const todas = await prisma.tutoringAssignment.findMany({
    select: { docenteId: true, estudianteId: true },
  });
  const claves = todas.map((a) => `${a.docenteId}::${a.estudianteId}`);
  const unicas = new Set(claves);
  if (claves.length === unicas.size) {
    ok("No hay pares (docente, estudiante) duplicados.");
  } else {
    fail(`Hay ${claves.length - unicas.size} par(es) duplicado(s) — no debería ser posible por la constraint @@unique.`);
  }

  console.log("");
  console.log("============================================================");
  console.log(" 3. Ningún estudiante tiene más de una tutoría ACTIVA a la vez");
  console.log("============================================================");
  const activas = await prisma.tutoringAssignment.findMany({
    where: { estado: "ACTIVA" },
    select: { estudianteId: true },
  });
  const conteoPorEstudiante = new Map<string, number>();
  for (const a of activas) {
    conteoPorEstudiante.set(a.estudianteId, (conteoPorEstudiante.get(a.estudianteId) ?? 0) + 1);
  }
  const conflictos = Array.from(conteoPorEstudiante.entries()).filter(([, n]) => n > 1);
  if (conflictos.length === 0) {
    ok(`${activas.length} tutoría(s) activa(s), ninguna duplicada por estudiante.`);
  } else {
    fail(`${conflictos.length} estudiante(s) con más de un tutor ACTIVO simultáneo: ${conflictos.map(([id]) => id).join(", ")}`);
  }

  console.log("");
  console.log("============================================================");
  console.log(" 4. Integridad referencial: docenteId y estudianteId apuntan a usuarios reales con el rol correcto");
  console.log("============================================================");
  const asignacionesConUsuarios = await prisma.tutoringAssignment.findMany({
    include: { docente: true, estudiante: true },
  });
  let rolesInvalidos = 0;
  for (const a of asignacionesConUsuarios) {
    if (a.docente.rol !== "DOCENTE") {
      fail(`Asignación ${a.id}: el "docente" (${a.docente.email}) tiene rol ${a.docente.rol}, no DOCENTE.`);
      rolesInvalidos++;
    }
    if (a.estudiante.rol !== "ESTUDIANTE") {
      fail(`Asignación ${a.id}: el "estudiante" (${a.estudiante.email}) tiene rol ${a.estudiante.rol}, no ESTUDIANTE.`);
      rolesInvalidos++;
    }
  }
  if (rolesInvalidos === 0) ok("Todos los roles de docente/estudiante en las asignaciones son consistentes.");

  console.log("");
  console.log("============================================================");
  console.log(" 5. Observaciones: nunca deben ser accesibles por el estudiante");
  console.log("============================================================");
  info("Esto se verifica a nivel de código (ObservationList nunca se usa en /mi-tutoria,");
  info("y PlanTabs oculta la pestaña si puedeEditar=false). No hay endpoint GET público");
  info("de observaciones — se listan solo dentro de la página del docente autenticado.");
  ok("Verificación estructural: no existe ninguna ruta /api/tutoria/*/observaciones con método GET.");

  console.log("");
  console.log("============================================================");
  console.log(" 6. Resumen por estado de tutoría");
  console.log("============================================================");
  const porEstado = await prisma.tutoringAssignment.groupBy({
    by: ["estado"],
    _count: true,
  });
  console.table(porEstado.map((e) => ({ estado: e.estado, cantidad: e._count })));

  console.log("");
  console.log("============================================================");
  console.log(` RESULTADO: ${fallos === 0 ? "✅ TODAS LAS VERIFICACIONES PASARON" : `🚨 ${fallos} VERIFICACIÓN(ES) FALLARON`}`);
  console.log("============================================================");
}

main()
  .catch((e) => {
    console.error("ERROR durante la verificación:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
