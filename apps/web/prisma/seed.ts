// Seed de la Fase 3: carga los 8 módulos educativos oficiales
// Ejecutar con: npx prisma db seed  (configurar "prisma.seed" en package.json)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MODULOS = [
  {
    numero: 1,
    slug: "introduccion-derecho-informatico",
    titulo: "Introducción al Derecho Informático",
    descripcion:
      "Conceptos básicos, evolución histórica e importancia del derecho informático en la sociedad digital.",
    resumen:
      "Este módulo sitúa al estudiante en el marco conceptual general antes de abordar normativa específica, construyendo el vocabulario base necesario para los módulos siguientes.",
    propositoAcademico:
      "Situar al estudiante en el marco conceptual general antes de abordar normativa específica; construye el vocabulario base necesario para los módulos siguientes.",
    bibliografia:
      "Téllez Valdés, J. (2009). Derecho Informático. McGraw-Hill.\nAsamblea Nacional del Ecuador. (2021). Ley Orgánica de Protección de Datos Personales.",
  },
  {
    numero: 2,
    slug: "marco-juridico-ecuatoriano",
    titulo: "Marco Jurídico Ecuatoriano",
    descripcion:
      "Constitución del Ecuador, derechos digitales, acceso a la información y privacidad.",
    resumen:
      "Se conectan los principios constitucionales con el uso cotidiano de la tecnología, sentando la base normativa nacional.",
    propositoAcademico:
      "Conectar los principios constitucionales con el uso cotidiano de la tecnología, sentando la base normativa nacional.",
    bibliografia:
      "Constitución de la República del Ecuador (2008), artículos 66 y 92.\nLey Orgánica de Transparencia y Acceso a la Información Pública.",
  },
  {
    numero: 3,
    slug: "proteccion-datos-personales",
    titulo: "Protección de Datos Personales",
    descripcion:
      "Principios de la LOPDP, tratamiento de datos, derechos del titular y obligaciones del responsable.",
    resumen:
      "Se desarrolla la competencia práctica para identificar tratamientos indebidos de datos personales.",
    propositoAcademico:
      "Desarrollar competencia práctica para identificar tratamientos indebidos de datos personales.",
    bibliografia:
      "Ley Orgánica de Protección de Datos Personales (Ecuador, 2021).\nReglamento General de Protección de Datos (UE) — referencia comparada.",
  },
  {
    numero: 4,
    slug: "delitos-informaticos",
    titulo: "Delitos Informáticos",
    descripcion:
      "Tipificación en el COIP, modalidades de fraude y ataques informáticos, evidencia digital.",
    resumen:
      "Se capacita al estudiante para reconocer conductas delictivas informáticas y su marco de sanción.",
    propositoAcademico:
      "Capacitar al estudiante para reconocer conductas delictivas y su marco de sanción.",
    bibliografia:
      "Código Orgánico Integral Penal (COIP), Título IV, Capítulo Tercero.\nActa de recomendaciones sobre evidencia digital, Fiscalía General del Estado.",
  },
  {
    numero: 5,
    slug: "comercio-electronico",
    titulo: "Comercio Electrónico",
    descripcion:
      "Ley de Comercio Electrónico, Firmas y Mensajes de Datos; contratos electrónicos, firma electrónica, protección al consumidor digital.",
    resumen:
      "Se aplica la normativa a transacciones digitales reales: compras, contratos y firmas.",
    propositoAcademico:
      "Aplicar la normativa a transacciones digitales reales (compras, contratos, firmas).",
    bibliografia:
      "Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos (Ecuador, 2002).\nLey Orgánica de Defensa del Consumidor.",
  },
  {
    numero: 6,
    slug: "propiedad-intelectual",
    titulo: "Propiedad Intelectual",
    descripcion:
      "Derechos de autor en entornos digitales, software, licenciamiento y plagio.",
    resumen:
      "Se vincula la creación y distribución de contenido digital con su marco legal de protección.",
    propositoAcademico:
      "Vincular la creación y distribución de contenido digital con su marco legal de protección.",
    bibliografia:
      "Código Orgánico de la Economía Social de los Conocimientos, Creatividad e Innovación (Ingenios).",
  },
  {
    numero: 7,
    slug: "etica-competencias-digitales",
    titulo: "Ética y Competencias Digitales",
    descripcion:
      "Ética en el uso de tecnología, ciudadanía digital, uso responsable de la información.",
    resumen:
      "Se desarrolla el eje transversal de ética que atraviesa todos los demás módulos y se mide en la autoevaluación.",
    propositoAcademico:
      "Desarrollar el eje transversal de ética que atraviesa todos los demás módulos y se mide en la autoevaluación.",
    bibliografia:
      "UNESCO. (2019). Marco de Competencias Digitales para Docentes.\nMINTEL Ecuador. Agenda de Transformación Digital.",
  },
  {
    numero: 8,
    slug: "casos-reales",
    titulo: "Casos Reales",
    descripcion:
      "Integración de los siete módulos anteriores en situaciones reales documentadas: sentencias, noticias y jurisprudencia ecuatoriana.",
    resumen:
      "Cierre del itinerario formativo mediante síntesis y aplicación integral del conocimiento adquirido.",
    propositoAcademico:
      "Cierre del itinerario formativo mediante síntesis y aplicación integral del conocimiento adquirido.",
    bibliografia:
      "Corte Nacional de Justicia del Ecuador. Repositorio de sentencias en materia informática.",
  },
];

// Cada módulo recibe el mismo esqueleto de recursos (video, PDF, infografía,
// ejemplos, bibliografía, resumen) tal como exige la Fase 1 / documento de análisis.
function leccionesPara(tituloModulo: string) {
  return [
    { tipo: "VIDEO" as const, titulo: `Video introductorio: ${tituloModulo}`, orden: 1 },
    { tipo: "PDF" as const, titulo: `Lectura PDF: ${tituloModulo}`, orden: 2 },
    { tipo: "INFOGRAFIA" as const, titulo: `Infografía: ${tituloModulo}`, orden: 3 },
    { tipo: "TEXTO" as const, titulo: `Ejemplos prácticos: ${tituloModulo}`, orden: 4, contenido: "Contenido de ejemplo pendiente de redacción editorial." },
    { tipo: "PODCAST" as const, titulo: `Podcast: ${tituloModulo}`, orden: 5 },
  ];
}

// ============================================================
// FASE 4 — BIBLIOTECA JURÍDICA (documentos y artículos oficiales)
// ============================================================

const DOCUMENTOS_BIBLIOTECA = [
  {
    slug: "constitucion",
    titulo: "Constitución de la República del Ecuador",
    categoria: "CONSTITUCION" as const,
    tags: ["derechos digitales", "privacidad", "acceso a la información"],
    contenido:
      "Norma suprema del Ecuador. Reconoce el derecho a la protección de datos personales, la inviolabilidad y el secreto de las comunicaciones, y el acceso a la información pública.",
    articulos: [
      { numero: "Art. 66", titulo: "Derecho a la protección de datos personales", texto: "Se reconoce y garantizará a las personas el derecho a la protección de datos de carácter personal, que incluye el acceso y la decisión sobre información y datos de este carácter, así como su correspondiente protección." },
      { numero: "Art. 92", titulo: "Acción de hábeas data", texto: "Toda persona tiene derecho a conocer de la existencia y a acceder a los documentos, datos genéticos, bancos o archivos de datos personales e informes que sobre sí misma consten en entidades públicas o privadas." },
    ],
  },
  {
    slug: "lopdp",
    titulo: "Ley Orgánica de Protección de Datos Personales",
    categoria: "LOPDP" as const,
    tags: ["protección de datos", "privacidad", "consentimiento"],
    contenido:
      "Regula el tratamiento de datos personales en Ecuador, estableciendo principios, derechos del titular y obligaciones del responsable del tratamiento.",
    articulos: [
      { numero: "Art. 7", titulo: "Principio de consentimiento", texto: "El tratamiento de datos personales requiere el consentimiento libre, específico, informado e inequívoco del titular, salvo las excepciones previstas en la ley." },
      { numero: "Art. 16", titulo: "Derechos del titular", texto: "El titular de los datos tiene derecho de acceso, rectificación, actualización, eliminación, oposición, portabilidad y a no ser objeto de una decisión basada única y exclusivamente en un tratamiento automatizado." },
    ],
  },
  {
    slug: "coip",
    titulo: "Código Orgánico Integral Penal",
    categoria: "COIP" as const,
    tags: ["delitos informáticos", "sanciones", "evidencia digital"],
    contenido:
      "Tipifica los delitos informáticos en el Ecuador: acceso no consentido, ataques a sistemas informáticos, apropiación fraudulenta y otros delitos relacionados con las TIC.",
    articulos: [
      { numero: "Art. 229", titulo: "Revelación ilegal de bases de datos", texto: "La persona que revele información registrada, contenida en ficheros, archivos, bases de datos o medios semejantes, será sancionada." },
      { numero: "Art. 234", titulo: "Acceso no consentido a un sistema informático", texto: "Se sanciona a quien acceda de forma no consentida a todo o parte de un sistema informático o telemático." },
    ],
  },
  {
    slug: "ley-comercio-electronico",
    titulo: "Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos",
    categoria: "COMERCIO_ELECTRONICO" as const,
    tags: ["comercio electrónico", "firma electrónica", "contratos"],
    contenido:
      "Regula los mensajes de datos, la firma electrónica, los servicios de certificación y la contratación electrónica en el Ecuador.",
    articulos: [
      { numero: "Art. 2", titulo: "Reconocimiento jurídico de los mensajes de datos", texto: "Los mensajes de datos tendrán igual valor jurídico que los documentos escritos." },
      { numero: "Art. 14", titulo: "Efectos jurídicos de la firma electrónica", texto: "La firma electrónica tendrá igual validez y se le reconocerán los mismos efectos jurídicos que a una firma manuscrita." },
    ],
  },
];

async function seedBiblioteca() {
  for (const doc of DOCUMENTOS_BIBLIOTECA) {
    const { articulos, slug, ...datosDoc } = doc;
    const documento = await prisma.libraryDocument.upsert({
      where: { id: slug },
      update: datosDoc,
      create: { id: slug, ...datosDoc },
    });

    for (const [i, articulo] of articulos.entries()) {
      await prisma.libraryArticle.upsert({
        where: { id: `${documento.id}-articulo-${i + 1}` },
        update: { ...articulo, orden: i + 1 },
        create: {
          id: `${documento.id}-articulo-${i + 1}`,
          documentId: documento.id,
          ...articulo,
          orden: i + 1,
        },
      });
    }
  }
  console.log(`Seed completo: ${DOCUMENTOS_BIBLIOTECA.length} documentos de biblioteca jurídica cargados.`);
}

// ============================================================
// FASE 5 — EVALUACIONES (ejemplo con los 5 tipos de pregunta)
// ============================================================

async function seedEvaluaciones() {
  const modulo1 = await prisma.course.findUnique({ where: { slug: "introduccion-derecho-informatico" } });
  if (!modulo1) {
    console.log("Aviso: no se encontró el Módulo 1, se omite el seed de evaluaciones.");
    return;
  }

  const evaluacion = await prisma.evaluation.upsert({
    where: { id: "eval-modulo-1" },
    update: { titulo: "Evaluación: Introducción al Derecho Informático", courseId: modulo1.id, tiempoLimite: 10, orden: 1 },
    create: {
      id: "eval-modulo-1",
      titulo: "Evaluación: Introducción al Derecho Informático",
      courseId: modulo1.id,
      tipo: "modulo",
      tiempoLimite: 10,
      orden: 1,
    },
  });

  const preguntas = [
    {
      id: "eval-modulo-1-p1",
      tipo: "VF" as const,
      enunciado: "El derecho informático regula exclusivamente los delitos cometidos por computadora.",
      opciones: undefined,
      respuestaCorrecta: { esVerdadero: false },
      retroalimentacion:
        "Falso. El derecho informático abarca un campo mucho más amplio: protección de datos, comercio electrónico, propiedad intelectual, ética digital, entre otros — no solo delitos.",
      puntaje: 1,
      orden: 1,
    },
    {
      id: "eval-modulo-1-p2",
      tipo: "OPCION_MULTIPLE" as const,
      enunciado: "¿Cuál de las siguientes NO es una rama que aborda el derecho informático?",
      opciones: { alternativas: ["Protección de datos personales", "Comercio electrónico", "Derecho marítimo internacional", "Propiedad intelectual digital"] },
      respuestaCorrecta: { indiceCorrecto: 2 },
      retroalimentacion:
        "El derecho marítimo internacional no forma parte del derecho informático; las otras tres son ramas centrales de esta disciplina.",
      puntaje: 1,
      orden: 2,
    },
    {
      id: "eval-modulo-1-p3",
      tipo: "RELACIONAR" as const,
      enunciado: "Relaciona cada concepto con su definición correcta.",
      opciones: {
        columnaIzquierda: ["Dato personal", "Firma electrónica", "Delito informático"],
        columnaDerecha: [
          "Conducta tipificada que afecta sistemas o datos informáticos",
          "Mecanismo que da validez jurídica a un mensaje de datos",
          "Información que identifica o hace identificable a una persona",
        ],
      },
      respuestaCorrecta: { pares: [2, 1, 0] },
      retroalimentacion:
        "Dato personal → identifica a una persona; Firma electrónica → da validez jurídica; Delito informático → conducta tipificada.",
      puntaje: 1,
      orden: 3,
    },
    {
      id: "eval-modulo-1-p4",
      tipo: "COMPLETAR" as const,
      enunciado: "La rama del derecho que regula el uso de las tecnologías de la información se llama derecho ______.",
      opciones: undefined,
      respuestaCorrecta: { aceptadas: ["informatico", "informático"] },
      retroalimentacion: "La respuesta correcta es 'informático'.",
      puntaje: 1,
      orden: 4,
    },
    {
      id: "eval-modulo-1-p5",
      tipo: "CASO" as const,
      enunciado:
        "Caso: Una empresa ecuatoriana comparte la base de datos de sus clientes con un tercero sin su consentimiento. ¿Qué principio jurídico se está vulnerando?",
      opciones: { alternativas: ["Libertad de expresión", "Principio de consentimiento en protección de datos", "Derecho a la propiedad intelectual", "Derecho al comercio electrónico"] },
      respuestaCorrecta: { indiceCorrecto: 1 },
      retroalimentacion:
        "Se vulnera el principio de consentimiento de la LOPDP: el tratamiento y la cesión de datos personales requieren autorización expresa del titular.",
      puntaje: 1,
      orden: 5,
    },
  ];

  for (const p of preguntas) {
    await prisma.question.upsert({
      where: { id: p.id },
      update: p as never,
      create: { ...p, evaluationId: evaluacion.id } as never,
    });
  }

  console.log("Seed completo: evaluación de ejemplo del Módulo 1 cargada (5 tipos de pregunta).");
}

// ============================================================
// FASE 6 — CASOS PRÁCTICOS (uno por categoría oficial)
// ============================================================

const CASOS_PRACTICOS = [
  {
    id: "caso-proteccion-datos-1",
    titulo: "Venta de base de datos de clientes sin autorización",
    categoria: "PROTECCION_DATOS" as const,
    escenario:
      "Una empresa de comercio electrónico ecuatoriana vende su base de datos de 10,000 clientes a una empresa de marketing, sin haber solicitado el consentimiento de los titulares.",
    descripcion:
      "El gerente de la empresa argumenta que los datos son 'un activo comercial' y que no existe prohibición expresa para monetizarlos, siempre que no se revele información financiera sensible.",
    normativaAplicable:
      "Ley Orgánica de Protección de Datos Personales (LOPDP), artículos 7 y 16; Constitución del Ecuador, artículo 66.",
    derechosVulnerados:
      "Derecho a la protección de datos personales y derecho al consentimiento informado sobre el tratamiento y cesión de los propios datos.",
    sanciones:
      "La LOPDP contempla sanciones administrativas que van desde amonestación hasta multas de hasta el 1% de los ingresos anuales de la empresa infractora, según la gravedad.",
    actuacionCorrecta:
      "La empresa debía solicitar el consentimiento expreso, libre e informado de cada titular antes de ceder sus datos a un tercero, e informar la finalidad específica del tratamiento.",
    retroalimentacionJuridica:
      "Los datos personales no son un 'activo comercial' de libre disposición: la LOPDP establece que su titular conserva el control sobre ellos incluso después de haberlos entregado a una empresa. La cesión a terceros exige un nuevo consentimiento específico.",
    nivelDificultad: "BASICO" as const,
    competenciaDesarrollada: "Protección de Datos",
    opciones: {
      alternativas: [
        "La empresa actuó correctamente porque los datos le pertenecen tras la compra",
        "La empresa debía solicitar consentimiento expreso antes de ceder los datos a un tercero",
        "La empresa solo necesitaba informar a los clientes después de la venta",
        "No se requiere consentimiento si los datos no incluyen información financiera",
      ],
    },
    indiceCorrecto: 1,
    orden: 1,
  },
  {
    id: "caso-delitos-informaticos-1",
    titulo: "Acceso no autorizado a cuenta de correo corporativo",
    categoria: "DELITOS_INFORMATICOS" as const,
    escenario:
      "Un extrabajador utiliza credenciales que aún no habían sido revocadas para ingresar al correo corporativo de su antiguo empleador y descargar información de clientes.",
    descripcion:
      "El extrabajador argumenta que 'nadie le prohibió expresamente' seguir usando la cuenta tras su salida, ya que la empresa nunca desactivó el acceso.",
    normativaAplicable:
      "Código Orgánico Integral Penal (COIP), artículo 234 (Acceso no consentido a un sistema informático).",
    derechosVulnerados:
      "Inviolabilidad de las comunicaciones y de los sistemas informáticos de la empresa; confidencialidad de la información de terceros (clientes).",
    sanciones:
      "El COIP sanciona el acceso no consentido a un sistema informático con pena privativa de libertad, cuya gravedad aumenta si se obtiene provecho económico o se afecta a terceros.",
    actuacionCorrecta:
      "El acceso debía cesar inmediatamente al finalizar la relación laboral, independientemente de si la empresa desactivó o no las credenciales; la falta de revocación no constituye autorización.",
    retroalimentacionJuridica:
      "El consentimiento para acceder a un sistema informático se vincula a la relación laboral vigente, no a la persistencia técnica de una contraseña. Usar credenciales tras la desvinculación configura acceso no consentido, sin importar el descuido administrativo de la empresa.",
    nivelDificultad: "INTERMEDIO" as const,
    competenciaDesarrollada: "Delitos Informáticos",
    opciones: {
      alternativas: [
        "Fue legal porque la empresa nunca revocó el acceso",
        "Configura acceso no consentido a un sistema informático, sancionado por el COIP",
        "Solo es una falta administrativa, no un delito",
        "Es legal si no se comparte la información descargada con terceros",
      ],
    },
    indiceCorrecto: 1,
    orden: 2,
  },
  {
    id: "caso-comercio-electronico-1",
    titulo: "Contrato electrónico rechazado por falta de 'firma manuscrita'",
    categoria: "COMERCIO_ELECTRONICO" as const,
    escenario:
      "Un proveedor se niega a cumplir un contrato firmado electrónicamente, alegando que 'no es válido' porque no tiene firma manuscrita ni sello físico.",
    descripcion:
      "El contrato fue celebrado mediante una plataforma que registra la firma electrónica de ambas partes junto con marca de tiempo y verificación de identidad.",
    normativaAplicable:
      "Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos, artículos 2 y 14.",
    derechosVulnerados:
      "Derecho a la seguridad jurídica en las transacciones electrónicas y al reconocimiento legal de los mensajes de datos.",
    sanciones:
      "El incumplimiento del contrato válidamente celebrado puede derivar en responsabilidad civil por daños y perjuicios, exigible ante la justicia ordinaria.",
    actuacionCorrecta:
      "El proveedor debía cumplir el contrato: la firma electrónica tiene la misma validez jurídica que una firma manuscrita conforme a la ley ecuatoriana.",
    retroalimentacionJuridica:
      "La Ley de Comercio Electrónico reconoce expresamente que los mensajes de datos y las firmas electrónicas tienen el mismo valor jurídico que los documentos físicos y las firmas manuscritas. Negarse a cumplir por esa razón no tiene sustento legal.",
    nivelDificultad: "BASICO" as const,
    competenciaDesarrollada: "Comercio Electrónico",
    opciones: {
      alternativas: [
        "El proveedor tiene razón: solo la firma manuscrita es válida legalmente",
        "El contrato es válido; la firma electrónica tiene el mismo valor jurídico que la manuscrita",
        "El contrato requiere además un sello notarial para ser válido",
        "Solo es válido si ambas partes firmaron también en papel",
      ],
    },
    indiceCorrecto: 1,
    orden: 3,
  },
  {
    id: "caso-evidencia-digital-1",
    titulo: "Captura de pantalla como única prueba de una amenaza en línea",
    categoria: "EVIDENCIA_DIGITAL" as const,
    escenario:
      "Una persona recibe amenazas por redes sociales y toma una captura de pantalla como evidencia, pero elimina la conversación original de la aplicación después.",
    descripcion:
      "Al presentar la denuncia, la fiscalía cuestiona la fuerza probatoria de la captura, ya que no existe forma de verificar su origen ni su integridad tras haberse borrado el mensaje original.",
    normativaAplicable:
      "COIP, disposiciones sobre cadena de custodia de evidencia digital; guías de la Fiscalía General del Estado sobre preservación de evidencia electrónica.",
    derechosVulnerados:
      "Derecho a la tutela judicial efectiva, afectado por la debilidad probatoria derivada de una cadena de custodia inadecuada.",
    sanciones:
      "No aplica sanción a la víctima; sin embargo, la evidencia mal preservada puede ser desestimada o requerir peritaje adicional, retrasando el proceso contra el agresor.",
    actuacionCorrecta:
      "Se debía preservar el mensaje original sin eliminarlo, respaldarlo mediante herramientas forenses o al menos con metadatos verificables (hash, fecha del sistema), y reportarlo a la plataforma antes de borrar cualquier rastro.",
    retroalimentacionJuridica:
      "La evidencia digital exige cadena de custodia: una captura de pantalla aislada es fácilmente cuestionable en su autenticidad. Preservar el mensaje original y su metadata fortalece significativamente el valor probatorio ante la fiscalía.",
    nivelDificultad: "AVANZADO" as const,
    competenciaDesarrollada: "Evidencia Digital",
    opciones: {
      alternativas: [
        "La captura de pantalla es prueba suficiente por sí sola",
        "Debía preservarse el mensaje original y su metadata para mantener la cadena de custodia",
        "No es necesario conservar evidencia digital en casos de acoso en línea",
        "Basta con el testimonio de la víctima, sin evidencia técnica adicional",
      ],
    },
    indiceCorrecto: 1,
    orden: 4,
  },
];

async function seedCasosPracticos() {
  for (const caso of CASOS_PRACTICOS) {
    await prisma.caseStudy.upsert({
      where: { id: caso.id },
      update: caso as never,
      create: caso as never,
    });
  }
  console.log(`Seed completo: ${CASOS_PRACTICOS.length} casos prácticos cargados (uno por categoría).`);
}

// ============================================================
// FASE 6 — AUTOEVALUACIÓN DE COMPETENCIAS DIGITALES (6 ejes x 2 preguntas)
// ============================================================

const PREGUNTAS_AUTOEVALUACION = [
  { eje: "SEGURIDAD_DIGITAL" as const, enunciado: "Utilizo contraseñas distintas y seguras para mis cuentas digitales importantes." },
  { eje: "SEGURIDAD_DIGITAL" as const, enunciado: "Sé identificar un intento de phishing o un enlace sospechoso antes de hacer clic." },
  { eje: "PROTECCION_DATOS" as const, enunciado: "Antes de compartir mis datos personales en una plataforma, reviso para qué serán usados." },
  { eje: "PROTECCION_DATOS" as const, enunciado: "Conozco los derechos que tengo sobre mis datos personales según la ley ecuatoriana." },
  { eje: "ASPECTOS_LEGALES" as const, enunciado: "Entiendo qué conductas en línea pueden constituir un delito informático en Ecuador." },
  { eje: "ASPECTOS_LEGALES" as const, enunciado: "Sé qué validez legal tiene un contrato o una firma electrónica en Ecuador." },
  { eje: "ETICA" as const, enunciado: "Reflexiono sobre el impacto de lo que publico en línea antes de compartirlo." },
  { eje: "ETICA" as const, enunciado: "Respeto la propiedad intelectual ajena al usar o compartir contenido digital." },
  { eje: "CIUDADANIA_DIGITAL" as const, enunciado: "Participo de forma respetuosa y constructiva en espacios digitales colectivos (foros, redes)." },
  { eje: "CIUDADANIA_DIGITAL" as const, enunciado: "Conozco los canales oficiales para denunciar un abuso o delito informático en Ecuador." },
  { eje: "USO_RESPONSABLE_INFORMACION" as const, enunciado: "Verifico la fuente de una noticia antes de compartirla en redes sociales." },
  { eje: "USO_RESPONSABLE_INFORMACION" as const, enunciado: "Distingo entre información verificada y desinformación en internet." },
];

async function seedAutoevaluacion() {
  for (const [i, p] of PREGUNTAS_AUTOEVALUACION.entries()) {
    await prisma.selfAssessmentQuestion.upsert({
      where: { id: `autoeval-p${i + 1}` },
      update: { ...p, orden: i + 1 },
      create: { id: `autoeval-p${i + 1}`, ...p, orden: i + 1 },
    });
  }
  console.log(`Seed completo: ${PREGUNTAS_AUTOEVALUACION.length} preguntas de autoevaluación cargadas (6 ejes).`);
}

// ============================================================
// FASE 8 — INSIGNIAS (deben coincidir con los ids de CRITERIOS_INSIGNIAS)
// ============================================================

const INSIGNIAS = [
  { id: "primer-paso", nombre: "Primer paso", descripcion: "Completaste tu primera lección.", icono: "Footprints", criterio: "Completa 1 lección" },
  { id: "modulo-completo", nombre: "Módulo completo", descripcion: "Completaste tu primer módulo educativo.", icono: "GraduationCap", criterio: "Completa 1 módulo" },
  { id: "evaluador-aprobado", nombre: "Evaluador aprobado", descripcion: "Aprobaste tu primera evaluación.", icono: "ClipboardCheck", criterio: "Aprueba 1 evaluación" },
  { id: "jurista-junior", nombre: "Jurista junior", descripcion: "Resolviste correctamente tu primer caso práctico.", icono: "Scale", criterio: "Resuelve 1 caso correctamente" },
  { id: "estudiante-nivel-5", nombre: "Estudiante destacado", descripcion: "Alcanzaste el nivel 5.", icono: "Star", criterio: "Alcanza el nivel 5" },
  { id: "maraton-modulos", nombre: "Maratonista", descripcion: "Completaste 4 módulos educativos.", icono: "Trophy", criterio: "Completa 4 módulos" },
];

async function seedInsignias() {
  for (const insignia of INSIGNIAS) {
    await prisma.badge.upsert({ where: { id: insignia.id }, update: insignia, create: insignia });
  }
  console.log(`Seed completo: ${INSIGNIAS.length} insignias cargadas.`);
}

// ============================================================
// FASE 8 — GLOSARIO JURÍDICO
// ============================================================

const TERMINOS_GLOSARIO = [
  { termino: "Dato personal", definicion: "Información concerniente a una persona natural, identificada o identificable.", categoria: "Protección de Datos" },
  { termino: "Titular de datos", definicion: "Persona natural a quien pertenecen los datos personales objeto de tratamiento.", categoria: "Protección de Datos" },
  { termino: "Firma electrónica", definicion: "Datos electrónicos que permiten identificar al firmante de un mensaje de datos.", categoria: "Comercio Electrónico" },
  { termino: "Mensaje de datos", definicion: "Información generada, enviada o archivada por medios electrónicos, con reconocimiento jurídico.", categoria: "Comercio Electrónico" },
  { termino: "Acceso no consentido", definicion: "Ingreso a un sistema informático sin autorización del titular, tipificado como delito en el COIP.", categoria: "Delitos Informáticos" },
  { termino: "Evidencia digital", definicion: "Información almacenada o transmitida en formato digital que puede usarse como prueba en un proceso legal.", categoria: "Delitos Informáticos" },
  { termino: "Cadena de custodia", definicion: "Procedimiento que garantiza la integridad de la evidencia desde su recolección hasta su presentación judicial.", categoria: "Delitos Informáticos" },
  { termino: "Habeas data", definicion: "Acción constitucional que permite a una persona conocer y controlar la información que sobre ella conste en registros públicos o privados.", categoria: "Marco Jurídico" },
  { termino: "Propiedad intelectual", definicion: "Derechos que protegen las creaciones del intelecto humano, incluido el software.", categoria: "Propiedad Intelectual" },
  { termino: "Ciudadanía digital", definicion: "Ejercicio responsable y ético de los derechos y deberes en entornos digitales.", categoria: "Ética Digital" },
];

async function seedGlosario() {
  for (const [i, t] of TERMINOS_GLOSARIO.entries()) {
    await prisma.glossaryTerm.upsert({
      where: { id: `glosario-${i + 1}` },
      update: { ...t, orden: i + 1 },
      create: { id: `glosario-${i + 1}`, ...t, orden: i + 1 },
    });
  }
  console.log(`Seed completo: ${TERMINOS_GLOSARIO.length} términos de glosario cargados.`);
}

// ============================================================
// FASE 8 — NOTICIAS
// ============================================================

const NOTICIAS = [
  {
    id: "noticia-1",
    titulo: "Ecuador refuerza la aplicación de la Ley Orgánica de Protección de Datos Personales",
    resumen: "La autoridad de protección de datos avanza en la reglamentación y en procesos sancionatorios para empresas que incumplen la LOPDP.",
    contenido:
      "Desde su entrada en vigencia, la Ley Orgánica de Protección de Datos Personales ha generado un proceso progresivo de adecuación por parte de empresas públicas y privadas en Ecuador. Las autoridades competentes han iniciado campañas de socialización y, en paralelo, procesos de fiscalización sobre el tratamiento de datos personales en sectores como el financiero, la salud y el comercio electrónico.",
    fuente: "Contenido educativo de la plataforma",
    fechaPublicacion: new Date("2025-03-15"),
  },
  {
    id: "noticia-2",
    titulo: "Aumentan denuncias por delitos informáticos vinculados a fraude en banca en línea",
    resumen: "La Fiscalía reporta un incremento de denuncias relacionadas con phishing y acceso no consentido a cuentas bancarias.",
    contenido:
      "Los organismos de control han identificado un aumento sostenido de denuncias relacionadas con fraude electrónico, principalmente mediante técnicas de phishing dirigidas a usuarios de banca en línea. Se recomienda a la ciudadanía verificar los canales oficiales de comunicación de las instituciones financieras y evitar hacer clic en enlaces no verificados.",
    fuente: "Contenido educativo de la plataforma",
    fechaPublicacion: new Date("2025-05-02"),
  },
  {
    id: "noticia-3",
    titulo: "Comercio electrónico ecuatoriano crece y plantea nuevos retos regulatorios",
    resumen: "El crecimiento sostenido de las ventas en línea exige mayor claridad sobre protección al consumidor digital.",
    contenido:
      "El comercio electrónico en Ecuador continúa en expansión, lo que ha puesto en agenda la necesidad de fortalecer la protección al consumidor digital, la validez de los contratos electrónicos y los mecanismos de resolución de conflictos en transacciones en línea, todos ellos regulados por la Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos.",
    fuente: "Contenido educativo de la plataforma",
    fechaPublicacion: new Date("2025-06-20"),
  },
];

async function seedNoticias() {
  for (const n of NOTICIAS) {
    await prisma.news.upsert({ where: { id: n.id }, update: n, create: n });
  }
  console.log(`Seed completo: ${NOTICIAS.length} noticias cargadas.`);
}

async function main() {
  for (const modulo of MODULOS) {
    const curso = await prisma.course.upsert({
      where: { slug: modulo.slug },
      update: { ...modulo, orden: modulo.numero },
      create: { ...modulo, orden: modulo.numero },
    });

    for (const leccion of leccionesPara(modulo.titulo)) {
      await prisma.lesson.upsert({
        where: { id: `${curso.id}-${leccion.orden}` }, // idempotencia simple para el seed
        update: leccion,
        create: { id: `${curso.id}-${leccion.orden}`, courseId: curso.id, ...leccion },
      });
    }
  }
  console.log(`Seed completo: ${MODULOS.length} módulos educativos cargados.`);

  await seedBiblioteca();
  await seedEvaluaciones();
  await seedCasosPracticos();
  await seedAutoevaluacion();
  await seedInsignias();
  await seedGlosario();
  await seedNoticias();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
