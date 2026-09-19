// ============================================================
// CARGAR RECURSOS — pega URLs de video/PDF para lecciones y
// documentos de biblioteca que todavia no las tienen.
// Ejecutar con: npx tsx scripts/cargar-recursos.ts
// Solo actualiza lo que tú confirmes; Enter en vacío = omitir.
// ============================================================

import { PrismaClient } from "@prisma/client";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const prisma = new PrismaClient();
const rl = readline.createInterface({ input, output });

// ------------------------------------------------------------
// Sugerencias verificadas (fuentes oficiales / educativas reales).
// Se buscaron y confirmaron como enlaces que sí cargan contenido real
// antes de agregarlas aquí. Sirven como PUNTO DE PARTIDA — siempre
// puedes escribir otra URL en su lugar si prefieres una distinta.
// ------------------------------------------------------------

// Videos sugeridos por título exacto de lección "Video introductorio: X"
const VIDEOS_SUGERIDOS: Record<string, string> = {
  "Introducción al Derecho Informático": "https://www.youtube.com/watch?v=siWHxrjvfMc",
  "Marco Jurídico Ecuatoriano": "https://www.youtube.com/watch?v=2A2jjt42oyY",
  "Protección de Datos Personales": "https://www.youtube.com/watch?v=p3nATAVU6kM",
  "Delitos Informáticos": "https://www.youtube.com/watch?v=zFzNNc79Ndw",
  "Comercio Electrónico": "https://www.youtube.com/watch?v=zjQ4SghZjKo",
  "Propiedad Intelectual": "https://www.youtube.com/watch?v=_-zSfG4MYOw",
  "Ética y Competencias Digitales": "https://www.youtube.com/watch?v=mYYU-7eW1SM",
  "Casos Reales": "https://www.youtube.com/watch?v=jVlEg6jmIhs",
};

// PDFs oficiales sugeridos por título exacto de documento de biblioteca
const PDFS_SUGERIDOS: Record<string, string> = {
  "Constitución de la República del Ecuador":
    "https://www.asambleanacional.gob.ec/sites/default/files/private/asambleanacional/filesasambleanacionalnameuid-20/transparencia-2015/literal-a/a2/Const-Enmienda-2015.pdf",
  "Ley Orgánica de Protección de Datos Personales":
    "https://www.telecomunicaciones.gob.ec/wp-content/uploads/2021/06/Ley-Organica-de-Datos-Personales.pdf",
  "Código Orgánico Integral Penal":
    "https://www.defensa.gob.ec/wp-content/uploads/downloads/2021/03/COIP_act_feb-2021.pdf",
  "Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos":
    "https://www.telecomunicaciones.gob.ec/wp-content/uploads/downloads/2012/11/Ley-de-Comercio-Electronico-Firmas-y-Mensajes-de-Datos.pdf",
};

// PDFs sugeridos por título exacto de lección "Lectura PDF: X" (lecturas
// generales del tema del módulo — no confundir con PDFS_SUGERIDOS, que
// son los documentos de la Biblioteca jurídica).
const LECTURAS_PDF_SUGERIDAS: Record<string, string> = {
  "Introducción al Derecho Informático":
    "http://www.scielo.org.co/pdf/dere/n29/n29a13.pdf",
  "Marco Jurídico Ecuatoriano":
    "https://www.asambleanacional.gob.ec/sites/default/files/private/asambleanacional/filesasambleanacionalnameuid-20/transparencia-2015/literal-a/a2/Const-Enmienda-2015.pdf",
  "Protección de Datos Personales":
    "https://www.telecomunicaciones.gob.ec/wp-content/uploads/2021/06/Ley-Organica-de-Datos-Personales.pdf",
  "Delitos Informáticos":
    "https://www.defensa.gob.ec/wp-content/uploads/downloads/2021/03/COIP_act_feb-2021.pdf",
  "Comercio Electrónico":
    "https://www.telecomunicaciones.gob.ec/wp-content/uploads/downloads/2012/11/Ley-de-Comercio-Electronico-Firmas-y-Mensajes-de-Datos.pdf",
  "Propiedad Intelectual": "https://www.wipo.int/edocs/pubdocs/es/wipo_pub_450_2020.pdf",
  "Ética y Competencias Digitales":
    "https://somos-digital.org/wp-content/uploads/2022/04/digcomp2.2_castellano.pdf",
  "Casos Reales": "https://www.fiscalia.gob.ec/pdf/politica-criminal/Ciberdelitos-Perfil-Criminologico.pdf",
};

// Imágenes de infografía sugeridas (URL de imagen directa, verificada) por
// título exacto de lección "Infografía: X". A diferencia de videos/PDFs,
// las infografías reales casi nunca tienen una URL de imagen estable y
// pública, así que esta lista es intencionalmente más corta.
const INFOGRAFIAS_SUGERIDAS: Record<string, string> = {
  "Protección de Datos Personales":
    "https://www.incibe.es/sites/default/files/images/concienciacion/c5-eg-permisos_apps_riesgos_0.2.jpg",
  "Delitos Informáticos":
    "https://www.incibe.es/sites/default/files/images/concienciacion/imagen-poster-phishing.png",
  "Comercio Electrónico":
    "https://www.incibe.es/sites/default/files/images/concienciacion/imagen-infografia-carding.png",
  "Casos Reales":
    "https://www.incibe.es/sites/default/files/images/concienciacion/c14_img_infografia-tecnicas-ingenieria-social.jpg",
  // Estas 4 fueron diseñadas a medida para este proyecto y viven dentro
  // del propio sitio (apps/web/public/images/infografias/) — por eso la
  // URL es una ruta relativa, no un enlace externo. Solo funcionan una
  // vez que este código esté desplegado (GitHub -> Vercel).
  "Introducción al Derecho Informático":
    "/images/infografias/infografia-introduccion-derecho-informatico.png",
  "Marco Jurídico Ecuatoriano":
    "/images/infografias/infografia-marco-juridico-ecuatoriano.png",
  "Propiedad Intelectual":
    "/images/infografias/infografia-propiedad-intelectual.png",
  "Ética y Competencias Digitales":
    "/images/infografias/infografia-etica-competencias-digitales.png",
};

function extraerTituloModulo(tituloLeccion: string): string | null {
  // "Video introductorio: X" / "Lectura PDF: X" / "Infografía: X" -> "X"
  const m = tituloLeccion.match(/^(?:Video introductorio|Lectura PDF|Infografía):\s*(.+)$/);
  return m ? m[1] : null;
}

async function preguntar(mensaje: string): Promise<string> {
  const respuesta = await rl.question(mensaje);
  return respuesta.trim();
}

/**
 * Pregunta por una URL, mostrando una sugerencia verificada si existe.
 * Enter vacío -> usa la sugerencia (si hay) o se omite (si no hay).
 * Cualquier otro texto -> se usa tal cual lo que el usuario escriba.
 */
async function preguntarUrl(sugerencia: string | undefined): Promise<string | null> {
  if (sugerencia) {
    console.log(`  Sugerencia verificada: ${sugerencia}`);
    const respuesta = await preguntar("  Enter para usar esta, o pega otra URL: ");
    return respuesta || sugerencia;
  }
  const respuesta = await preguntar("  URL (Enter para omitir, no hay sugerencia para esta): ");
  return respuesta || null;
}

async function cargarVideosYRecursosDeLecciones() {
  console.log("");
  console.log("============================================================");
  console.log(" LECCIONES sin recurso (video, PDF, audio, etc.)");
  console.log("============================================================");

  const lecciones = await prisma.lesson.findMany({
    where: {
      AND: [
        { OR: [{ urlRecurso: null }, { urlRecurso: "" }] },
        // TEXTO no usa urlRecurso (usa el campo "contenido"), así que no
        // tiene sentido preguntar una URL para ese tipo de lección.
        { tipo: { not: "TEXTO" } },
      ],
    },
    include: { course: { select: { titulo: true } } },
    orderBy: [{ courseId: "asc" }, { orden: "asc" }],
  });

  if (lecciones.length === 0) {
    console.log("  Todas las lecciones ya tienen su recurso cargado.");
    return { actualizadas: 0, total: 0 };
  }

  console.log(`  Encontradas ${lecciones.length} leccion(es) sin recurso.\n`);

  let actualizadas = 0;
  for (const leccion of lecciones) {
    console.log(`----------------------------------------------------------`);
    console.log(`Módulo: ${leccion.course.titulo}`);
    console.log(`Lección: ${leccion.titulo}  (tipo: ${leccion.tipo})`);

    const tituloModulo = extraerTituloModulo(leccion.titulo);
    let sugerencia: string | undefined;
    if (leccion.tipo === "VIDEO" && tituloModulo) {
      sugerencia = VIDEOS_SUGERIDOS[tituloModulo];
    } else if (leccion.tipo === "PDF" && tituloModulo) {
      sugerencia = LECTURAS_PDF_SUGERIDAS[tituloModulo];
    } else if (leccion.tipo === "INFOGRAFIA" && tituloModulo) {
      sugerencia = INFOGRAFIAS_SUGERIDAS[tituloModulo];
    }

    if ((leccion.tipo === "VIDEO" || leccion.tipo === "PDF") && !sugerencia) {
      console.log(
        leccion.tipo === "VIDEO"
          ? "  Pega un enlace normal de YouTube (watch?v=... o youtu.be/...)"
          : "  Pega un enlace directo a un PDF real."
      );
    }
    if ((leccion.tipo === "INFOGRAFIA" || leccion.tipo === "PODCAST") && !sugerencia) {
      console.log(
        "  No tengo una sugerencia automática para este tipo (infografía/podcast: " +
          "es difícil encontrar un enlace directo confiable). Pega una URL si tienes " +
          "una, o presiona Enter para omitir por ahora."
      );
    }

    const url = await preguntarUrl(sugerencia);
    if (!url) {
      console.log("  Omitido.");
      continue;
    }
    await prisma.lesson.update({ where: { id: leccion.id }, data: { urlRecurso: url } });
    console.log("  OK, guardado.");
    actualizadas++;
  }

  return { actualizadas, total: lecciones.length };
}

async function cargarPdfsDeBiblioteca() {
  console.log("");
  console.log("============================================================");
  console.log(" DOCUMENTOS DE BIBLIOTECA sin PDF (archivoUrl)");
  console.log("============================================================");

  const documentos = await prisma.libraryDocument.findMany({
    where: { OR: [{ archivoUrl: null }, { archivoUrl: "" }] },
    orderBy: { titulo: "asc" },
  });

  if (documentos.length === 0) {
    console.log("  Todos los documentos ya tienen su PDF cargado.");
    return { actualizadas: 0, total: 0 };
  }

  console.log(`  Encontrados ${documentos.length} documento(s) sin PDF.\n`);

  let actualizadas = 0;
  for (const doc of documentos) {
    console.log(`----------------------------------------------------------`);
    console.log(`Documento: ${doc.titulo}`);

    const url = await preguntarUrl(PDFS_SUGERIDOS[doc.titulo]);
    if (!url) {
      console.log("  Omitido.");
      continue;
    }
    await prisma.libraryDocument.update({ where: { id: doc.id }, data: { archivoUrl: url } });
    console.log("  OK, guardado.");
    actualizadas++;
  }

  return { actualizadas, total: documentos.length };
}

async function main() {
  console.log("============================================================");
  console.log(" CARGAR RECURSOS (videos y PDFs)");
  console.log(" Este script te va a mostrar, uno por uno, cada leccion y");
  console.log(" documento que todavia no tiene su recurso. Para varios ya");
  console.log(" te sugiere una URL real y verificada (oficial/educativa):");
  console.log(" presiona Enter para aceptarla, o pega otra si prefieres.");
  console.log(" Enter sin sugerencia = omitir y seguir con el siguiente");
  console.log(" (puedes cerrar la ventana en cualquier momento con Ctrl+C).");
  console.log("============================================================");

  const lecciones = await cargarVideosYRecursosDeLecciones();
  const documentos = await cargarPdfsDeBiblioteca();

  console.log("");
  console.log("============================================================");
  console.log(" RESUMEN");
  console.log("============================================================");
  console.log(`  Lecciones actualizadas:  ${lecciones.actualizadas} / ${lecciones.total}`);
  console.log(`  Documentos actualizados: ${documentos.actualizadas} / ${documentos.total}`);
  console.log("");
  console.log("  Vuelve a correr este script cuando quieras para cargar lo");
  console.log("  que falte -- solo te preguntara por lo que siga vacio.");
}

main()
  .catch((e) => {
    console.error("ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
