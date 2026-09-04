// ============================================================
// DIAGNÓSTICO — conexión Prisma/Supabase, usuarios y RLS
// Ejecutar con: npx tsx scripts/diagnostico.ts
// No modifica nada, solo lee y reporta.
// ============================================================

import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient({ log: ["query", "warn", "error"] });

function enmascarar(url: string | undefined): string {
  if (!url) return "(no definida)";
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.username}:***@${u.host}${u.pathname}${u.search}`;
  } catch {
    return "(URL inválida, revisa el formato)";
  }
}

function leerArchivoEnv(nombre: string): Record<string, string> {
  const ruta = path.resolve(process.cwd(), nombre);
  if (!fs.existsSync(ruta)) return {};
  const contenido = fs.readFileSync(ruta, "utf-8");
  const vars: Record<string, string> = {};
  for (const linea of contenido.split("\n")) {
    const m = linea.match(/^([A-Z_]+)=(.*)$/);
    if (m) vars[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return vars;
}

async function main() {
  console.log("============================================================");
  console.log(" 1. ARCHIVOS .env encontrados en el disco (comparación directa)");
  console.log("============================================================");
  const envArchivo = leerArchivoEnv(".env");
  const envLocalArchivo = leerArchivoEnv(".env.local");

  console.log(".env       DATABASE_URL:", enmascarar(envArchivo.DATABASE_URL));
  console.log(".env.local DATABASE_URL:", enmascarar(envLocalArchivo.DATABASE_URL));
  console.log(".env       DIRECT_URL:  ", enmascarar(envArchivo.DIRECT_URL));
  console.log(".env.local DIRECT_URL:  ", enmascarar(envLocalArchivo.DIRECT_URL));

  if (envArchivo.DATABASE_URL !== envLocalArchivo.DATABASE_URL) {
    console.log("");
    console.log("🚨 ALERTA: .env y .env.local tienen DATABASE_URL DIFERENTES.");
    console.log("   Esto significa que Prisma Studio (lee .env) y tu app de");
    console.log("   Next.js (lee .env.local) pueden estar apuntando a bases");
    console.log("   de datos DISTINTAS. Esta es la causa más probable de tus");
    console.log("   dos problemas. Soluciona esto antes de seguir.");
  } else {
    console.log("");
    console.log("✅ .env y .env.local tienen el mismo DATABASE_URL.");
  }

  console.log("");
  console.log("============================================================");
  console.log(" 2. Conexión que Prisma Client está usando AHORA MISMO");
  console.log("============================================================");
  console.log("DATABASE_URL activa:", enmascarar(process.env.DATABASE_URL));
  console.log("DIRECT_URL activa:  ", enmascarar(process.env.DIRECT_URL));

  console.log("");
  console.log("============================================================");
  console.log(" 3. Base de datos y esquema reales a los que responde Postgres");
  console.log("============================================================");
  const info = await prisma.$queryRaw<{ database: string; schema: string; usuario_pg: string }[]>`
    SELECT current_database() AS database, current_schema() AS schema, current_user AS usuario_pg
  `;
  console.log(info[0]);

  console.log("");
  console.log("============================================================");
  console.log(" 4. Conteo real de usuarios en la tabla 'users' (sin filtros)");
  console.log("============================================================");
  const total = await prisma.user.count();
  console.log(`Prisma cuenta ${total} usuario(s) en total.`);

  console.log("");
  console.log("============================================================");
  console.log(" 5. Listado completo de usuarios (id, email, rol)");
  console.log("============================================================");
  const usuarios = await prisma.user.findMany({
    select: { id: true, email: true, nombre: true, rol: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  console.table(usuarios);

  console.log("");
  console.log("============================================================");
  console.log(" 6. Row Level Security (RLS) en la tabla 'users'");
  console.log("============================================================");
  const rls = await prisma.$queryRaw<{ relname: string; relrowsecurity: boolean }[]>`
    SELECT relname, relrowsecurity
    FROM pg_class
    WHERE relname = 'users' AND relnamespace = 'public'::regnamespace
  `;
  console.log(rls[0]);

  if (rls[0]?.relrowsecurity) {
    console.log("");
    console.log("🚨 ALERTA: RLS está ACTIVADO en la tabla 'users'.");
    const policies = await prisma.$queryRaw<{ policyname: string; cmd: string; qual: string | null }[]>`
      SELECT policyname, cmd, qual::text AS qual
      FROM pg_policies
      WHERE tablename = 'users'
    `;
    console.log("Políticas encontradas:", policies);
    console.log("   Si el usuario de conexión de DATABASE_URL NO es el rol");
    console.log("   'postgres' (superusuario), estas políticas pueden estar");
    console.log("   filtrando silenciosamente las filas que Prisma puede ver.");
  } else {
    console.log("✅ RLS está desactivado en 'users' (normal para una tabla creada por Prisma).");
  }

  console.log("");
  console.log("============================================================");
  console.log(" DIAGNÓSTICO COMPLETO");
  console.log("============================================================");
}

main()
  .catch((e) => {
    console.error("ERROR durante el diagnóstico:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
