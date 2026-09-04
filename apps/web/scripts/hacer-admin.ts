// ============================================================
// HACER ADMIN — convierte a un usuario existente en ADMINISTRADOR
// Ejecutar con: npx tsx scripts/hacer-admin.ts correo@ejemplo.com
// Uso pensado para el primer administrador (el resto se gestionan
// despues desde /admin/usuarios).
// ============================================================

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: npx tsx scripts/hacer-admin.ts correo@ejemplo.com");
    process.exit(1);
  }

  const usuario = await prisma.user.findUnique({ where: { email } });
  if (!usuario) {
    console.error(`No se encontro ningun usuario con el correo: ${email}`);
    console.error("Verifica que ya te hayas registrado en la plataforma primero.");
    process.exit(1);
  }

  if (usuario.rol === "ADMINISTRADOR") {
    console.log(`${email} ya es ADMINISTRADOR. No se hizo ningun cambio.`);
    return;
  }

  await prisma.user.update({ where: { id: usuario.id }, data: { rol: "ADMINISTRADOR" } });
  console.log(`OK: ${email} (${usuario.nombre}) ahora es ADMINISTRADOR en Prisma.`);

  // Sincroniza tambien el metadata de Supabase Auth si la service key esta configurada
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey) {
    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: existente } = await supabaseAdmin.auth.admin.getUserById(usuario.id);
    await supabaseAdmin.auth.admin.updateUserById(usuario.id, {
      user_metadata: { ...existente?.user?.user_metadata, rol: "ADMINISTRADOR" },
    });
    console.log("OK: metadata de Supabase Auth tambien sincronizado.");
  } else {
    console.log(
      "Aviso: SUPABASE_SERVICE_ROLE_KEY no configurada. No es necesaria: " +
        "Prisma ya es la fuente de verdad y el acceso a /admin funcionara igual."
    );
  }

  console.log("");
  console.log(`Listo. Inicia sesion como ${email} y entra a /admin`);
}

main()
  .catch((e) => {
    console.error("ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
