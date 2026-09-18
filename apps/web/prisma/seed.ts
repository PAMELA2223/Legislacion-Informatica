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
  {
    numero: 9,
    slug: "seguridad-de-la-informacion",
    titulo: "Seguridad de la Información",
    descripcion:
      "Concepto de seguridad de la información, principios de confidencialidad, integridad y disponibilidad, gestión de riesgos y buenas prácticas de protección.",
    resumen:
      "Introduce el marco conceptual de la seguridad de la información —anterior y más amplio que la ciberseguridad— como base para proteger cualquier tipo de información, digital o no, frente a amenazas comunes.",
    propositoAcademico:
      "Que el estudiante comprenda los principios CID (confidencialidad, integridad, disponibilidad), identifique amenazas comunes a la información y aplique buenas prácticas básicas de gestión de riesgos.",
    bibliografia:
      "ISO/IEC 27001 — Sistemas de gestión de seguridad de la información (referencia comparada).\nMINTEL Ecuador. Esquema Gubernamental de Seguridad de la Información (EGSI).",
  },
  {
    numero: 10,
    slug: "ciberseguridad",
    titulo: "Ciberseguridad",
    descripcion:
      "Amenazas informáticas, malware, phishing, robo de información, seguridad de contraseñas, autenticación, protección de dispositivos y de redes.",
    resumen:
      "Profundiza en la seguridad aplicada específicamente al entorno digital: cómo reconocer amenazas comunes y aplicar buenas prácticas de protección personal, sin contenido sensacionalista.",
    propositoAcademico:
      "Que el estudiante identifique amenazas informáticas frecuentes (malware, phishing) y aplique medidas prácticas de autoprotección: contraseñas seguras, autenticación multifactor y buenas prácticas en redes.",
    bibliografia:
      "INCIBE (Instituto Nacional de Ciberseguridad de España). Recursos de concienciación #AprendeCiberseguridad.\nMINTEL Ecuador. Agenda de Transformación Digital — eje de ciberseguridad.",
  },
  {
    numero: 11,
    slug: "derechos-y-obligaciones-usuarios-digitales",
    titulo: "Derechos y Obligaciones de los Usuarios Digitales",
    descripcion:
      "Derechos de los usuarios digitales, protección de datos personales, privacidad, acceso a servicios digitales, responsabilidades del usuario y consecuencias jurídicas del uso indebido de recursos digitales.",
    resumen:
      "Conecta cada derecho digital con la obligación correlativa y la normativa aplicable, para que el estudiante entienda tanto lo que puede exigir como lo que debe cumplir al usar tecnología.",
    propositoAcademico:
      "Que el estudiante distinga derechos digitales (privacidad, acceso, protección de datos) de las obligaciones y responsabilidades que conlleva el uso de sistemas informáticos, y comprenda las consecuencias jurídicas de su incumplimiento.",
    bibliografia:
      "Constitución de la República del Ecuador (2008), artículos 66 y 92.\nLey Orgánica de Protección de Datos Personales (Ecuador, 2021).\nCódigo Orgánico Integral Penal (COIP) — disposiciones sobre uso indebido de sistemas informáticos.",
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
// AMPLIACIÓN — Lecciones de texto reales para los módulos 9, 10 y 11
// (Secciones 2.1, 2.2 y 2.3 del pedido de ampliación). A diferencia de
// leccionesPara() —que genera solo el esqueleto de recursos pendientes de
// redacción editorial— estos tres módulos son contenido nuevo pedido
// explícitamente, así que llevan lecciones de texto con contenido real,
// educativo y no sensacionalista, cubriendo cada subtema solicitado.
// ============================================================

const LECCIONES_SEGURIDAD_INFORMACION = [
  {
    tipo: "TEXTO" as const,
    titulo: "¿Qué es la seguridad de la información?",
    orden: 1,
    contenido:
      "La seguridad de la información es la disciplina que protege cualquier tipo de información —digital, impresa o hablada— frente a accesos, usos, divulgaciones, interrupciones o destrucciones no autorizadas. Es un concepto más amplio que la ciberseguridad: mientras esta última se enfoca en el entorno digital, la seguridad de la información abarca también documentos físicos, conversaciones y procesos organizacionales.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Principios de confidencialidad, integridad y disponibilidad (CID)",
    orden: 2,
    contenido:
      "Todo esquema de seguridad de la información se apoya en tres principios conocidos como la tríada CID. Confidencialidad: solo las personas autorizadas pueden acceder a la información. Integridad: la información no puede ser modificada de forma no autorizada ni corrompida sin detectarse. Disponibilidad: la información y los sistemas que la contienen deben estar accesibles cuando se los necesita legítimamente.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Gestión de riesgos de la información",
    orden: 3,
    contenido:
      "Gestionar riesgos de información implica identificar qué activos de información existen, qué amenazas podrían afectarlos, qué tan vulnerables son y qué impacto tendría que la amenaza se concrete. A partir de ese análisis se decide si el riesgo se evita, se reduce con controles, se transfiere (por ejemplo mediante un seguro) o se acepta conscientemente, siempre documentando la decisión.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Amenazas comunes a la información",
    orden: 4,
    contenido:
      "Entre las amenazas más frecuentes están el error humano (por ejemplo, enviar información a un destinatario equivocado), la pérdida o robo de dispositivos con información sensible, el acceso no autorizado por terceros, los desastres naturales que afectan la infraestructura, y fallas técnicas de hardware o software que provocan pérdida de datos.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Buenas prácticas de protección de la información",
    orden: 5,
    contenido:
      "Algunas prácticas básicas y ampliamente recomendadas incluyen: clasificar la información según su sensibilidad, limitar el acceso según el principio de necesidad de conocer, mantener copias de respaldo (backups) periódicas, cifrar información sensible tanto en tránsito como almacenada, y capacitar continuamente a las personas que manejan información crítica.",
  },
];

const LECCIONES_CIBERSEGURIDAD = [
  {
    tipo: "TEXTO" as const,
    titulo: "¿Qué es la ciberseguridad?",
    orden: 1,
    contenido:
      "La ciberseguridad es la rama de la seguridad de la información enfocada específicamente en proteger sistemas, redes, dispositivos y datos frente a amenazas que se originan o se propagan a través del entorno digital. Comparte los principios de confidencialidad, integridad y disponibilidad, pero los aplica a un contexto tecnológico concreto: computadoras, celulares, redes y servicios en línea.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Amenazas informáticas y malware",
    orden: 2,
    contenido:
      "El malware (software malicioso) es un término general para programas diseñados para dañar, espiar o tomar control no autorizado de un dispositivo. Incluye virus, que se propagan infectando archivos; ransomware, que cifra la información y exige un pago para liberarla; y spyware, que recopila información del usuario sin su consentimiento. Estas amenazas suelen ingresar mediante archivos adjuntos, descargas o enlaces engañosos.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Phishing y robo de información",
    orden: 3,
    contenido:
      "El phishing es una técnica de ingeniería social en la que un atacante se hace pasar por una entidad confiable —un banco, una institución pública, un contacto conocido— para engañar a la víctima y que esta entregue información sensible como contraseñas o datos bancarios. Se distribuye principalmente por correo electrónico, pero también existen variantes por SMS (smishing) y por llamada telefónica (vishing). La recomendación general es nunca entregar contraseñas o códigos de verificación a través de un enlace recibido sin haber verificado la fuente por un canal oficial.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Seguridad de contraseñas y autenticación",
    orden: 4,
    contenido:
      "Una contraseña segura es larga, única para cada servicio y no se basa en información fácil de adivinar (fechas, nombres). Reutilizar la misma contraseña en varios servicios es una de las prácticas más riesgosas, porque una sola filtración compromete todas las cuentas asociadas. La autenticación multifactor (MFA) añade una segunda verificación —un código temporal, una notificación en el celular— y reduce drásticamente el riesgo de acceso no autorizado, incluso si la contraseña es robada.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Protección de dispositivos y seguridad en redes",
    orden: 5,
    contenido:
      "Mantener el sistema operativo y las aplicaciones actualizadas cierra vulnerabilidades conocidas que los atacantes suelen aprovechar. En cuanto a redes, conectarse a redes Wi-Fi públicas sin protección expone el tráfico a posibles interceptaciones; se recomienda evitar operaciones sensibles (banca, correos con información confidencial) en redes abiertas no confiables, y usar el cifrado disponible (WPA2/WPA3) en redes propias.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Buenas prácticas para usuarios",
    orden: 6,
    contenido:
      "A nivel de usuario, algunas prácticas centrales son: verificar la fuente antes de hacer clic en un enlace o descargar un archivo, activar la autenticación multifactor cuando esté disponible, mantener copias de respaldo de la información importante, revisar periódicamente los permisos otorgados a aplicaciones, y reportar cualquier incidente sospechoso a la institución o canal correspondiente sin demora.",
  },
];

const LECCIONES_DERECHOS_OBLIGACIONES = [
  {
    tipo: "TEXTO" as const,
    titulo: "Derechos de los usuarios digitales",
    orden: 1,
    contenido:
      "Los usuarios digitales tienen derechos reconocidos tanto en la Constitución como en normativa específica: el derecho a la protección de sus datos personales (Art. 66.19 de la Constitución), el derecho de acceso a la información pública, el derecho a la privacidad de sus comunicaciones, y el derecho a acceder a servicios digitales sin discriminación arbitraria.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Protección de datos personales y privacidad",
    orden: 2,
    contenido:
      "La Ley Orgánica de Protección de Datos Personales (LOPDP) reconoce al titular de los datos derechos como el acceso, la rectificación, la actualización, la eliminación y la oposición al tratamiento de su información. Ejercer estos derechos no requiere justificar una razón: basta con dirigir la solicitud al responsable del tratamiento, quien debe responder dentro de los plazos que fija la ley.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Acceso a servicios digitales",
    orden: 3,
    contenido:
      "El acceso a servicios digitales —trámites en línea, educación virtual, comercio electrónico— es cada vez más una condición para ejercer otros derechos, lo que ha llevado a hablar de una \"brecha digital\" cuando ciertos grupos quedan excluidos de ese acceso. Las políticas públicas de transformación digital buscan reducir esa brecha, pero el usuario también tiene responsabilidades para usar esos servicios de forma segura y adecuada.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Responsabilidades y uso responsable de las tecnologías",
    orden: 4,
    contenido:
      "Todo derecho digital viene acompañado de responsabilidades: usar la información y los sistemas de forma que no vulnere los derechos de terceros, no difundir contenido falso o difamatorio, respetar la propiedad intelectual ajena, y proteger razonablemente las propias credenciales y dispositivos para no facilitar accesos indebidos a través de ellos.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Obligaciones y consecuencias jurídicas del uso indebido",
    orden: 5,
    contenido:
      "El uso indebido de sistemas informáticos —por ejemplo, el acceso no consentido a un sistema, la difusión no autorizada de datos personales de terceros o la suplantación de identidad digital— puede generar responsabilidad civil, administrativa e incluso penal, según lo tipificado en el Código Orgánico Integral Penal (COIP) y lo previsto en la LOPDP. Conocer estas consecuencias es parte de ejercer una ciudadanía digital informada.",
  },
];

// ============================================================
// AMPLIACIÓN — Contratos electrónicos y transacciones digitales
// (Secciones 2.6 y 2.7 del pedido de ampliación). Se AGREGAN estas
// lecciones de texto AL FINAL del esqueleto ya existente del curso
// "Comercio Electrónico" (orden 6 en adelante) — no se toca ni se
// reemplaza ninguna de las 5 lecciones que ya tenía (video, PDF,
// infografía, ejemplos, podcast).
// ============================================================

const LECCIONES_AMPLIACION_COMERCIO_ELECTRONICO = [
  {
    tipo: "TEXTO" as const,
    titulo: "Contratos electrónicos: concepto y características",
    orden: 6,
    contenido:
      "Un contrato electrónico es aquel en el que la oferta y la aceptación se manifiestan por medio de mensajes de datos, sin que las partes necesiten estar físicamente presentes ni usar papel. Sus características principales son: se perfecciona en un entorno digital, puede celebrarse entre personas distantes, y su prueba depende de mensajes de datos y registros electrónicos en lugar de documentos físicos firmados a mano.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Elementos y formación del contrato electrónico",
    orden: 7,
    contenido:
      "Como cualquier contrato, el electrónico requiere consentimiento, objeto y causa lícitos. La particularidad está en el consentimiento: se manifiesta mediante clics, marcado de casillas o cualquier acción equivalente que exprese la voluntad de contratar, y el momento de perfeccionamiento suele fijarse cuando el oferente recibe la aceptación del destinatario, salvo que la ley o las partes dispongan otra cosa.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Validez jurídica y firma electrónica en los contratos",
    orden: 8,
    contenido:
      "La Ley de Comercio Electrónico reconoce a los mensajes de datos el mismo valor jurídico que a los documentos escritos, y a la firma electrónica los mismos efectos que a una firma manuscrita. Esto significa que un contrato electrónico correctamente formado es tan exigible como uno en papel, siempre que se pueda demostrar la identidad de las partes y la integridad del contenido acordado.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Obligaciones de las partes, evidencia digital e incumplimiento",
    orden: 9,
    contenido:
      "Cada parte de un contrato electrónico debe cumplir con lo pactado igual que en un contrato tradicional: entregar el bien o servicio, pagar el precio, respetar las condiciones informadas. Ante un incumplimiento, la evidencia digital —registros del sistema, correos de confirmación, huellas de auditoría (logs)— cumple el papel que cumpliría un documento firmado en un contrato en papel, por lo que conservar esos registros es clave para poder reclamar derechos.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Transacciones digitales: concepto, características y tipos",
    orden: 10,
    contenido:
      "Una transacción digital es cualquier operación de intercambio de bienes, servicios o dinero realizada por medios electrónicos. Existen distintos tipos: comercio electrónico B2C (empresa a consumidor), B2B (entre empresas), C2C (entre particulares, como en marketplaces), y transferencias o pagos digitales entre cuentas bancarias o billeteras electrónicas. Todas comparten la característica de dejar un registro electrónico verificable de la operación.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Pagos digitales, seguridad y protección de datos en transacciones",
    orden: 11,
    contenido:
      "Los pagos digitales —tarjetas, transferencias, billeteras electrónicas— dependen de que la información financiera del usuario esté protegida durante toda la operación. Esto exige cifrado de la comunicación, verificación de identidad y cumplimiento de normativa de protección de datos, ya que en cada transacción se procesan datos personales y financieros que la LOPDP considera de tratamiento especialmente cuidadoso.",
  },
  {
    tipo: "TEXTO" as const,
    titulo: "Riesgos, responsabilidades, evidencia y normativa aplicable",
    orden: 12,
    contenido:
      "Entre los riesgos más comunes en transacciones digitales están el fraude con tarjetas, la suplantación de identidad y las plataformas fraudulentas que imitan tiendas legítimas. La responsabilidad ante estos riesgos se distribuye entre el usuario (verificar la fuente antes de pagar), el proveedor del servicio (implementar medidas de seguridad razonables) y, cuando corresponde, la entidad financiera. La Ley de Comercio Electrónico y la Ley Orgánica de Defensa del Consumidor son la normativa aplicable de referencia en Ecuador, y los comprobantes y registros electrónicos de la transacción constituyen la evidencia principal en caso de disputa.",
  },
];

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
    numeroIdentificacion: "Registro Oficial 449",
    pais: "Ecuador",
    institucionEmisora: "Asamblea Constituyente",
    fechaEmision: new Date("2008-10-20"),
    estado: "VIGENTE" as const,
    fuenteOficial: "Registro Oficial del Ecuador (gob.ec)",
    enlaceOficial: "https://www.gob.ec/regulaciones/constitucion-republica-ecuador",
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
    numeroIdentificacion: "Registro Oficial Suplemento 459",
    pais: "Ecuador",
    institucionEmisora: "Asamblea Nacional del Ecuador",
    fechaEmision: new Date("2021-05-26"),
    estado: "VIGENTE" as const,
    fuenteOficial: "Registro Oficial del Ecuador (gob.ec)",
    enlaceOficial: "https://www.gob.ec/regulaciones/ley-organica-proteccion-datos-personales",
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
    numeroIdentificacion: "Registro Oficial Suplemento 180",
    pais: "Ecuador",
    institucionEmisora: "Asamblea Nacional del Ecuador",
    fechaEmision: new Date("2014-02-10"),
    estado: "VIGENTE" as const,
    fuenteOficial: "Registro Oficial del Ecuador (gob.ec)",
    enlaceOficial: "https://www.gob.ec/regulaciones/180-codigo-organico-integral-penal",
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
    numeroIdentificacion: "Registro Oficial Suplemento 557",
    pais: "Ecuador",
    institucionEmisora: "Congreso Nacional del Ecuador",
    fechaEmision: new Date("2002-04-17"),
    estado: "VIGENTE" as const,
    fuenteOficial: "Registro Oficial del Ecuador (gob.ec)",
    enlaceOficial: "https://www.gob.ec/regulaciones/ley-comercio-electronico-firmas-mensajes-datos",
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

// ============================================================
// AMPLIACIÓN — PREGUNTAS FRECUENTES (FAQ)
// ============================================================

const PREGUNTAS_FAQ = [
  {
    categoria: "Derecho informático",
    pregunta: "¿Qué es el derecho informático?",
    respuesta:
      "Es la rama del derecho que regula las relaciones jurídicas relacionadas con el uso de las tecnologías de la información: protección de datos, comercio electrónico, propiedad intelectual digital, delitos informáticos y evidencia digital, entre otros ámbitos.",
  },
  {
    categoria: "Protección de datos",
    pregunta: "¿Qué establece la Ley Orgánica de Protección de Datos Personales (LOPDP)?",
    respuesta:
      "Regula el tratamiento de datos personales en Ecuador: exige el consentimiento del titular, reconoce derechos como acceso, rectificación y eliminación, y establece obligaciones para quienes recopilan o procesan datos personales.",
  },
  {
    categoria: "Protección de datos",
    pregunta: "¿Qué es un dato personal?",
    respuesta:
      "Es cualquier información que identifica o hace identificable a una persona natural, como su nombre, cédula, correo electrónico, dirección IP o datos biométricos.",
  },
  {
    categoria: "Ciberseguridad",
    pregunta: "¿Cuál es la diferencia entre seguridad de la información y ciberseguridad?",
    respuesta:
      "La seguridad de la información protege la confidencialidad, integridad y disponibilidad de cualquier información, sin importar su formato (digital o físico). La ciberseguridad es una parte de esa disciplina, enfocada específicamente en proteger sistemas, redes y datos frente a amenazas del entorno digital.",
  },
  {
    categoria: "Ciberseguridad",
    pregunta: "¿Qué es el phishing?",
    respuesta:
      "Es una técnica de engaño en la que un atacante se hace pasar por una entidad confiable (un banco, una empresa, un contacto) para obtener información sensible como contraseñas o datos bancarios, generalmente a través de correos o mensajes fraudulentos.",
  },
  {
    categoria: "Firma electrónica",
    pregunta: "¿Una firma electrónica tiene la misma validez que una firma manuscrita?",
    respuesta:
      "Sí. Según la Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos, la firma electrónica tiene igual validez jurídica y los mismos efectos que una firma manuscrita, siempre que cumpla los requisitos legales establecidos.",
  },
  {
    categoria: "Contratos electrónicos",
    pregunta: "¿Un contrato firmado electrónicamente es legalmente vinculante en Ecuador?",
    respuesta:
      "Sí. Los mensajes de datos y los contratos electrónicos tienen el mismo valor jurídico que los documentos escritos, siempre que se pueda verificar el consentimiento de las partes y la integridad de la información.",
  },
  {
    categoria: "Transacciones digitales",
    pregunta: "¿Qué protección tiene un consumidor en una compra por comercio electrónico?",
    respuesta:
      "La normativa ecuatoriana reconoce derechos como la información clara y previa sobre el producto o servicio, y remite a la Ley Orgánica de Defensa del Consumidor y a la Ley de Comercio Electrónico para regular la validez de la transacción y la resolución de conflictos.",
  },
  {
    categoria: "Derechos digitales",
    pregunta: "¿Qué es la acción de hábeas data?",
    respuesta:
      "Es una garantía constitucional (Art. 92 de la Constitución) que permite a cualquier persona conocer, acceder, actualizar o eliminar la información que sobre ella conste en bases de datos públicas o privadas.",
  },
  {
    categoria: "Normativa",
    pregunta: "¿Qué normas conforman el marco legal informático en Ecuador?",
    respuesta:
      "Principalmente la Constitución de la República, la Ley Orgánica de Protección de Datos Personales (LOPDP), el Código Orgánico Integral Penal (COIP, en lo relativo a delitos informáticos) y la Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos.",
  },
];

async function seedFaq() {
  for (const [i, p] of PREGUNTAS_FAQ.entries()) {
    await prisma.faqItem.upsert({
      where: { id: `faq-${i + 1}` },
      update: { ...p, orden: i + 1, publicado: true },
      create: { id: `faq-${i + 1}`, ...p, orden: i + 1, publicado: true },
    });
  }
  console.log(`Seed completo: ${PREGUNTAS_FAQ.length} preguntas frecuentes cargadas.`);
}

// ============================================================
// AMPLIACIÓN — JURISPRUDENCIA INFORMÁTICA
// ============================================================
// IMPORTANTE: solo casos reales, verificados contra la fuente oficial.
// No se inventan sentencias ni enlaces — cada caso aquí fue confirmado
// contra el sitio oficial correspondiente antes de cargarse.

const CASOS_JURISPRUDENCIA = [
  {
    nombreCaso: "Sentencia No. 2064-14-EP/21 (protección de datos personales e intimidad)",
    pais: "Ecuador",
    anio: 2021,
    tema: "Protección de datos personales, hábeas data, intimidad digital",
    resumen:
      "La Corte Constitucional del Ecuador resolvió una acción extraordinaria de protección sobre la divulgación no consentida de fotografías íntimas, determinando que constituyen datos personales protegidos.",
    problemaJuridico:
      "Si el tratamiento no consentido de fotografías íntimas de una persona vulnera sus derechos a la protección de datos personales, la intimidad y la autodeterminación informativa, y si procede la acción de hábeas data en este contexto.",
    decision:
      "La Corte determinó que las fotografías íntimas constituyen datos personales y que su tratamiento sin consentimiento vulneró los derechos a la protección de datos, la imagen, la honra y la intimidad de la persona afectada.",
    importancia:
      "Es jurisprudencia vinculante en Ecuador sobre el alcance del concepto de dato personal, el consentimiento del titular y la expectativa razonable de privacidad en el entorno digital.",
    fuenteOficial: "Corte Constitucional del Ecuador",
    enlaceOficial: "https://www.corteconstitucional.gob.ec/sentencia-2064-14-ep-21/",
    verificado: true,
    publicado: true,
  },
  {
    nombreCaso: "Google Spain, S.L. y Google Inc. contra AEPD y Mario Costeja González (\"derecho al olvido\")",
    pais: "Unión Europea",
    anio: 2014,
    tema: "Derecho al olvido, protección de datos, motores de búsqueda",
    resumen:
      "El Tribunal de Justicia de la Unión Europea (TJUE) resolvió si un motor de búsqueda es responsable del tratamiento de datos personales que aparecen en páginas web de terceros indexadas por él.",
    problemaJuridico:
      "Si una persona puede solicitar a un motor de búsqueda la eliminación de enlaces a información personal legítima mas desactualizada o irrelevante, y si el gestor del buscador es responsable de ese tratamiento de datos.",
    decision:
      "El TJUE declaró que el gestor de un motor de búsqueda es responsable del tratamiento de datos personales indexados y que el titular puede solicitar, bajo ciertas condiciones, la eliminación de enlaces que le conciernen (\"derecho al olvido\").",
    importancia:
      "Es el precedente fundacional del derecho al olvido en materia de protección de datos, ampliamente citado en Ecuador y Latinoamérica para interpretar el alcance de los derechos digitales frente a intermediarios de internet.",
    fuenteOficial: "EUR-Lex (base de datos oficial de legislación de la Unión Europea), Asunto C-131/12",
    enlaceOficial: "https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:62012CJ0131",
    verificado: true,
    publicado: true,
  },
  {
    nombreCaso: "Carpenter v. United States",
    pais: "Estados Unidos",
    anio: 2018,
    tema: "Privacidad digital, datos de geolocalización, evidencia digital",
    resumen:
      "La Corte Suprema de los Estados Unidos resolvió si el gobierno necesita una orden judicial para obtener los registros históricos de ubicación de un teléfono celular (cell-site location information) en poder de un tercero (la operadora telefónica).",
    problemaJuridico:
      "Si la obtención sin orden judicial de datos de geolocalización de un celular, en poder de una empresa de telecomunicaciones, constituye una \"búsqueda\" protegida por la Cuarta Enmienda de la Constitución de EE.UU.",
    decision:
      "La Corte Suprema resolvió (5-4) que acceder a los registros históricos de geolocalización de un celular sí constituye una búsqueda bajo la Cuarta Enmienda, por lo que el gobierno generalmente necesita una orden judicial respaldada por causa probable.",
    importancia:
      "Es un precedente clave en evidencia digital y privacidad frente a terceros proveedores de servicios digitales, relevante para discutir los límites de la vigilancia estatal sobre datos generados por dispositivos móviles.",
    fuenteOficial: "Corte Suprema de los Estados Unidos (Supreme Court of the United States)",
    enlaceOficial: "https://www.supremecourt.gov/opinions/17pdf/585us1r62_mlho.pdf",
    verificado: true,
    publicado: true,
  },
];

async function seedJurisprudencia() {
  for (const [i, c] of CASOS_JURISPRUDENCIA.entries()) {
    await prisma.jurisprudenceCase.upsert({
      where: { id: `jurisprudencia-${i + 1}` },
      update: c,
      create: { id: `jurisprudencia-${i + 1}`, ...c },
    });
  }
  console.log(`Seed completo: ${CASOS_JURISPRUDENCIA.length} casos de jurisprudencia cargados.`);
}

// ============================================================
// AMPLIACIÓN — VIDEOS E INFOGRAFÍAS REALES
// ============================================================
// Solo recursos reales de fuentes institucionales/educativas — enlaces
// verificados antes de cargarse, ninguno inventado.

const VIDEOS = [
  {
    titulo: "¿Qué es el phishing? | #AprendeCiberseguridad",
    descripcion:
      "Explicación breve de qué es el phishing, cómo opera un atacante haciéndose pasar por una entidad legítima y cómo protegerse.",
    categoria: "Ciberseguridad",
    url: "https://www.youtube.com/watch?v=uhzV5-iFb5E",
    fuente: "INCIBE (Instituto Nacional de Ciberseguridad de España)",
    publicado: true,
  },
  {
    titulo: "Phishing: caso real atendido por la Línea de Ayuda en Ciberseguridad 017",
    descripcion:
      "Caso real de smishing (phishing por SMS) consultado en la línea gratuita de ayuda en ciberseguridad de INCIBE.",
    categoria: "Ciberseguridad",
    url: "https://www.youtube.com/watch?v=7T32WBQRrBA",
    fuente: "INCIBE (Instituto Nacional de Ciberseguridad de España)",
    publicado: true,
  },
];

async function seedVideos() {
  for (const [i, v] of VIDEOS.entries()) {
    await prisma.videoResource.upsert({
      where: { id: `video-${i + 1}` },
      update: v,
      create: { id: `video-${i + 1}`, ...v },
    });
  }
  console.log(`Seed completo: ${VIDEOS.length} videos cargados.`);
}

const INFOGRAFIAS = [
  {
    titulo: "Cómo identificar el phishing",
    descripcion:
      "Infografía con pistas visuales para reconocer un correo electrónico de phishing antes de caer en el engaño.",
    categoria: "Ciberseguridad",
    url: "https://www.incibe.es/sites/default/files/docs/c14-pdf-infografia-identificar_phishing.pdf",
    fuente: "INCIBE (Instituto Nacional de Ciberseguridad de España)",
    publicado: true,
  },
  {
    titulo: "¿Cuáles son tus derechos de protección de datos?",
    descripcion:
      "Resumen visual de los derechos que otorga la normativa de protección de datos personales (acceso, rectificación, oposición, supresión, portabilidad, limitación).",
    categoria: "Protección de datos",
    url: "https://www.aepd.es/infografias/cuales-son-tus-derechos-de-proteccion-de-datos.pdf",
    fuente: "AEPD (Agencia Española de Protección de Datos)",
    publicado: true,
  },
];

async function seedInfografias() {
  for (const [i, inf] of INFOGRAFIAS.entries()) {
    await prisma.infographic.upsert({
      where: { id: `infografia-${i + 1}` },
      update: inf,
      create: { id: `infografia-${i + 1}`, ...inf },
    });
  }
  console.log(`Seed completo: ${INFOGRAFIAS.length} infografías cargadas.`);
}

// ============================================================
// AMPLIACIÓN — NORMATIVA Y REFERENCIAS INTERNACIONALES
// ============================================================
// Solo instrumentos internacionales reales, con enlace verificado a la
// fuente oficial del organismo emisor — ninguno inventado.

const REFERENCIAS_INTERNACIONALES = [
  {
    titulo: "Convenio sobre la Ciberdelincuencia (Convenio de Budapest)",
    organismo: "Consejo de Europa",
    tema: "Ciberseguridad, delitos informáticos, evidencia digital",
    categoria: "Ciberseguridad",
    resumen:
      "Primer tratado internacional que busca armonizar las leyes nacionales contra el ciberdelito, mejorar las técnicas de investigación y facilitar la cooperación internacional en la obtención de evidencia electrónica. Es la base de la legislación contra la ciberdelincuencia en la mayoría de países que cuentan con ella.",
    urlOficial: "https://www.coe.int/en/web/conventions/full-list/-/conventions/treaty/185",
    publicado: true,
  },
  {
    titulo: "Ley Modelo de la CNUDMI sobre Comercio Electrónico (1996)",
    organismo: "CNUDMI / UNCITRAL (Comisión de las Naciones Unidas para el Derecho Mercantil Internacional)",
    tema: "Comercio electrónico, mensajes de datos",
    categoria: "Comercio electrónico",
    resumen:
      "Primer texto legislativo en adoptar los principios de no discriminación, neutralidad tecnológica y equivalencia funcional entre la información en papel y la información electrónica. Sirvió de base para la legislación de comercio electrónico de más de 100 países, incluyendo la Ley de Comercio Electrónico del Ecuador.",
    urlOficial: "https://uncitral.un.org/en/texts/ecommerce/modellaw/electronic_commerce",
    publicado: true,
  },
  {
    titulo: "Ley Modelo de la CNUDMI sobre Firmas Electrónicas (2001)",
    organismo: "CNUDMI / UNCITRAL (Comisión de las Naciones Unidas para el Derecho Mercantil Internacional)",
    tema: "Firma electrónica",
    categoria: "Firma electrónica",
    resumen:
      "Complementa la Ley Modelo sobre Comercio Electrónico estableciendo un enfoque neutral en cuanto a tecnología para reconocer la validez jurídica de las firmas electrónicas, sin favorecer una tecnología específica (permite tanto firmas basadas en criptografía como otras técnicas).",
    urlOficial: "https://uncitral.un.org/en/texts/ecommerce/modellaw/electronic_signatures",
    publicado: true,
  },
  {
    titulo: "Reglamento General de Protección de Datos (RGPD) — Reglamento (UE) 2016/679",
    organismo: "Unión Europea (Parlamento Europeo y Consejo)",
    tema: "Protección de datos personales",
    categoria: "Protección de datos",
    resumen:
      "Norma de referencia mundial en protección de datos personales, que unifica las reglas de tratamiento de datos en la Unión Europea y refuerza derechos como el acceso, la rectificación, la supresión y la portabilidad. Ha influido en la redacción de leyes de protección de datos en América Latina, incluida la LOPDP de Ecuador.",
    urlOficial: "https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX%3A32016R0679",
    publicado: true,
  },
];

async function seedReferenciasInternacionales() {
  for (const [i, r] of REFERENCIAS_INTERNACIONALES.entries()) {
    await prisma.internationalReference.upsert({
      where: { id: `referencia-${i + 1}` },
      update: r,
      create: { id: `referencia-${i + 1}`, ...r },
    });
  }
  console.log(`Seed completo: ${REFERENCIAS_INTERNACIONALES.length} referencias internacionales cargadas.`);
}

// Módulos ampliados que llevan lecciones de texto reales en vez del
// esqueleto genérico (ver LECCIONES_* arriba).
const LECCIONES_POR_SLUG: Record<string, ReturnType<typeof leccionesPara>> = {
  "seguridad-de-la-informacion": LECCIONES_SEGURIDAD_INFORMACION,
  ciberseguridad: LECCIONES_CIBERSEGURIDAD,
  "derechos-y-obligaciones-usuarios-digitales": LECCIONES_DERECHOS_OBLIGACIONES,
};

// Módulos existentes a los que se AGREGAN lecciones nuevas al final del
// esqueleto ya generado por leccionesPara(), sin reemplazar las que ya
// tenían (Secciones 2.6 y 2.7 del pedido de ampliación).
const LECCIONES_ADICIONALES_POR_SLUG: Record<string, ReturnType<typeof leccionesPara>> = {
  "comercio-electronico": LECCIONES_AMPLIACION_COMERCIO_ELECTRONICO,
};

async function main() {
  for (const modulo of MODULOS) {
    const curso = await prisma.course.upsert({
      where: { slug: modulo.slug },
      update: { ...modulo, orden: modulo.numero },
      create: { ...modulo, orden: modulo.numero },
    });

    const lecciones = [
      ...(LECCIONES_POR_SLUG[modulo.slug] ?? leccionesPara(modulo.titulo)),
      ...(LECCIONES_ADICIONALES_POR_SLUG[modulo.slug] ?? []),
    ];
    for (const leccion of lecciones) {
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
  await seedFaq();
  await seedJurisprudencia();
  await seedVideos();
  await seedInfografias();
  await seedReferenciasInternacionales();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
