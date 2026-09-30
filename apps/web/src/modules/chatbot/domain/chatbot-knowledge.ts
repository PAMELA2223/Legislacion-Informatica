// Base de conocimiento curada del asistente: conceptos centrales de
// legislación informática (con énfasis en Ecuador), redactados de forma breve
// y verificable. Se usa de dos maneras:
//   1. Con IA: la ficha del concepto detectado se entrega como contexto, para
//      que la respuesta sea precisa y coherente con la plataforma.
//   2. Sin IA (modo básico): permite responder según lo que se pide
//      (definición, ejemplo, explicación sencilla, diferencia o situación).
//
// Las "señales" son palabras o frases (sin tildes, en minúsculas) que indican
// el concepto aunque el estudiante no lo nombre: "me llegó un correo pidiendo
// mi contraseña" → phishing.

export interface Concepto {
  id: string;
  nombre: string;
  senales: string[];
  definicion: string;
  sencillo: string;
  ejemplo: string;
  normativa?: string;
  queHacer?: string[];
}

export const CONCEPTOS: Concepto[] = [
  {
    id: "phishing",
    nombre: "Phishing",
    senales: [
      "phishing", "pishing", "fishing", "correo falso", "mensaje falso", "enlace sospechoso", "link sospechoso",
      "ingresar mi contrasena", "ingrese mi contrasena", "ingresa tu contrasena", "pidiendo mi contrasena", "piden mi contrasena",
      "bloquear mi cuenta", "bloqueen mi cuenta", "bloquearan tu cuenta", "suspender mi cuenta", "verificar mi cuenta",
      "haciendose pasar por el banco", "se hacen pasar por", "pagina falsa", "sitio falso", "smishing", "vishing",
    ],
    definicion:
      "El phishing es un engaño en el que alguien se hace pasar por una entidad confiable (un banco, una red social, una institución) para que la víctima entregue contraseñas, datos bancarios u otra información personal.",
    sencillo:
      "Es un anzuelo digital: te mandan un mensaje que parece real para que tú mismo entregues tus claves.",
    ejemplo:
      "Recibes un correo \"del banco\" que dice que tu cuenta será bloqueada si no ingresas tu usuario y contraseña en un enlace; la página es una copia falsa y quien la creó se queda con tus datos.",
    normativa:
      "En Ecuador, usar esos datos para sacar dinero puede constituir apropiación fraudulenta por medios electrónicos (COIP, art. 190) o estafa (COIP, art. 186).",
    queHacer: [
      "No abras el enlace ni entregues datos; las entidades serias no piden contraseñas por correo o mensaje.",
      "Si ya ingresaste tus datos, cambia la contraseña de inmediato y avisa a tu banco o a la plataforma afectada.",
      "Reporta el mensaje y, si hubo pérdida de dinero, presenta la denuncia en la Fiscalía.",
    ],
  },
  {
    id: "estafa-digital",
    nombre: "Estafa digital",
    senales: [
      "estafa", "estafaron", "estafador", "fraude", "fraude en linea", "me robaron dinero", "compre y no llego",
      "pague y no", "tienda falsa", "vendedor falso", "premio falso", "gane un premio", "inversion falsa", "transferencia falsa",
    ],
    definicion:
      "Una estafa digital es un engaño realizado mediante medios tecnológicos para obtener dinero, datos o acceso a una cuenta, aprovechando la confianza o el error de la víctima.",
    sencillo: "Es cuando alguien te engaña por internet para quedarse con tu dinero o tus datos.",
    ejemplo:
      "Una página en redes sociales vende celulares a mitad de precio; pagas por transferencia y el vendedor desaparece sin enviar nada.",
    normativa:
      "El COIP sanciona la estafa (art. 186) y la apropiación fraudulenta por medios electrónicos (art. 190).",
    queHacer: [
      "Guarda las pruebas: capturas, conversaciones, comprobantes de pago y el enlace o perfil del estafador.",
      "Informa de inmediato a tu banco para intentar detener la transacción.",
      "Presenta la denuncia en la Fiscalía General del Estado.",
    ],
  },
  {
    id: "delito-informatico",
    nombre: "Delito informático",
    senales: ["delito informatico", "delitos informaticos", "ciberdelito", "ciberdelitos", "ciberdelincuencia", "crimen informatico"],
    definicion:
      "Un delito informático es una conducta sancionada por la ley penal que se comete usando sistemas informáticos o que ataca sistemas, datos o información.",
    sencillo: "Es un delito en el que la computadora o internet es el arma o el objetivo.",
    ejemplo:
      "Entrar sin permiso a la cuenta de correo de otra persona para leer sus mensajes es un delito informático, aunque no se robe dinero.",
    normativa:
      "En Ecuador están tipificados en el COIP; por ejemplo, el acceso no consentido a un sistema informático (art. 234) y la revelación ilegal de bases de datos (art. 229).",
  },
  {
    id: "datos-personales",
    nombre: "Protección de datos personales",
    senales: [
      "datos personales", "proteccion de datos", "mis datos", "lopdp", "base de datos de clientes", "vendieron mis datos",
      "usan mis datos", "utiliza mis datos", "utilizo mis datos", "uso mis datos", "sin autorizacion", "tratamiento de datos",
      "derechos del titular", "derecho de acceso", "rectificacion", "eliminacion de datos", "portabilidad",
    ],
    definicion:
      "La protección de datos personales es el derecho a controlar quién usa la información que te identifica (nombre, cédula, correo, fotos, ubicación) y para qué la usa.",
    sencillo: "Tus datos son tuyos: nadie debería usarlos sin tu permiso ni para algo distinto a lo que aceptaste.",
    ejemplo:
      "Si una tienda usa tu número de teléfono, que diste solo para una entrega, para enviarte publicidad de otras empresas, está usando tus datos para una finalidad que no autorizaste.",
    normativa:
      "Está reconocido en la Constitución (art. 66, num. 19) y regulado por la Ley Orgánica de Protección de Datos Personales (2021), que otorga, entre otros, los derechos de acceso, rectificación, eliminación, oposición y portabilidad.",
    queHacer: [
      "Pide por escrito a la empresa o persona responsable que te informe qué datos tiene y que deje de usarlos o los elimine.",
      "Si no responde o sigue usándolos, puedes presentar una denuncia ante la Superintendencia de Protección de Datos Personales.",
      "Si hubo un perjuicio grave, consulta con un profesional del derecho.",
    ],
  },
  {
    id: "publicacion-sin-permiso",
    nombre: "Publicación de datos o imágenes sin permiso",
    senales: [
      "publico mis datos", "publicaron mis datos", "publica mis datos", "publicar mis datos", "subio mi foto", "subieron mi foto",
      "publico mi foto", "publicaron mi foto", "sin mi permiso", "sin permiso", "difundio mis", "compartio mis fotos",
      "expuso mis datos", "mi numero en redes", "mi direccion en redes", "violacion a la intimidad", "intimidad",
    ],
    definicion:
      "Difundir sin autorización datos personales o imágenes de otra persona vulnera su derecho a la protección de datos y a la intimidad, y según el caso puede generar responsabilidad administrativa o penal.",
    sencillo: "Nadie puede publicar tu información o tus fotos privadas sin que tú lo permitas.",
    ejemplo:
      "Un excompañero publica en un grupo de redes sociales tu número de celular y tu dirección para que otros te molesten.",
    normativa:
      "La LOPDP protege tus datos personales y el COIP sanciona la violación a la intimidad (art. 178), por ejemplo difundir comunicaciones o imágenes privadas sin consentimiento.",
    queHacer: [
      "Guarda evidencia (capturas con fecha y enlace de la publicación).",
      "Solicita a quien lo publicó y a la red social que retiren el contenido (las plataformas tienen formularios de denuncia).",
      "Ejerce tu derecho de eliminación y, si no lo retiran, acude a la Superintendencia de Protección de Datos Personales o, si es un delito, a la Fiscalía.",
    ],
  },
  {
    id: "privacidad",
    nombre: "Privacidad",
    senales: ["privacidad", "vida privada", "derecho a la privacidad"],
    definicion:
      "La privacidad es el derecho a mantener un ámbito de tu vida fuera del conocimiento y la intromisión de otros: tu hogar, tus comunicaciones, tu vida familiar.",
    sencillo: "Es tu espacio personal: lo que no tiene por qué saber ni ver nadie más.",
    ejemplo: "Leer sin permiso los chats de WhatsApp de otra persona invade su privacidad.",
    normativa: "La Constitución del Ecuador protege la intimidad personal y familiar y la inviolabilidad de la correspondencia (art. 66).",
  },
  {
    id: "habeas-data",
    nombre: "Hábeas data",
    senales: ["habeas data", "abeas data", "acceder a mis datos", "conocer mis datos", "que datos tienen de mi"],
    definicion:
      "El hábeas data es una garantía constitucional que permite a una persona conocer, actualizar, rectificar o pedir la eliminación de los datos que sobre ella constan en archivos públicos o privados.",
    sencillo: "Es la herramienta legal para saber qué información guardan sobre ti y corregirla.",
    ejemplo: "Si una central de riesgos mantiene una deuda que ya pagaste, puedes exigir que se corrija ese dato.",
    normativa: "Constitución del Ecuador, art. 92.",
  },
  {
    id: "consentimiento",
    nombre: "Consentimiento en protección de datos",
    senales: ["consentimiento", "autorizacion para usar", "acepte los terminos", "terminos y condiciones", "politica de privacidad"],
    definicion:
      "El consentimiento es la autorización que das para que usen tus datos; según la LOPDP debe ser libre, específico, informado e inequívoco.",
    sencillo: "Significa que dijiste \"sí\" sabiendo exactamente para qué usarán tus datos.",
    ejemplo:
      "Una aplicación que pide acceso a tus contactos debe explicarte para qué; aceptar un formulario de registro no la autoriza a vender tus contactos a terceros.",
    normativa: "Ley Orgánica de Protección de Datos Personales.",
  },
  {
    id: "suplantacion",
    nombre: "Suplantación de identidad",
    senales: [
      "suplantacion", "suplantaron", "se hace pasar por mi", "perfil falso", "cuenta falsa con mi nombre", "usan mi nombre",
      "robaron mi identidad", "robo de identidad",
    ],
    definicion:
      "La suplantación de identidad ocurre cuando alguien se hace pasar por otra persona, por ejemplo creando un perfil falso con su nombre y fotos, para engañar o causar un perjuicio.",
    sencillo: "Es cuando alguien finge ser tú.",
    ejemplo: "Alguien crea una cuenta de Instagram con tus fotos y escribe a tus contactos pidiéndoles dinero prestado.",
    normativa: "El COIP sanciona la suplantación de identidad (art. 212).",
    queHacer: [
      "Denuncia el perfil falso ante la red social y pide a tus contactos que también lo reporten.",
      "Avisa a tus contactos para que no caigan en el engaño.",
      "Guarda evidencias y, si hay perjuicio, denuncia en la Fiscalía.",
    ],
  },
  {
    id: "acceso-no-consentido",
    nombre: "Acceso no consentido a un sistema informático",
    senales: [
      "hackearon", "hackeo", "hackear", "hacker", "entraron a mi cuenta", "robaron mi cuenta", "acceso no autorizado",
      "acceso no consentido", "sin permiso a mi cuenta", "adivino mi contrasena", "me robaron la cuenta",
    ],
    definicion:
      "El acceso no consentido consiste en entrar, sin autorización, a un sistema informático, una cuenta o un dispositivo ajeno.",
    sencillo: "Es entrar a una cuenta o computadora que no es tuya sin permiso del dueño.",
    ejemplo: "Un empleado usa la contraseña de un compañero para entrar a su correo corporativo y leer sus mensajes.",
    normativa: "Es un delito en Ecuador: acceso no consentido a un sistema informático, telemático o de telecomunicaciones (COIP, art. 234).",
    queHacer: [
      "Recupera la cuenta y cambia la contraseña; activa la verificación en dos pasos.",
      "Revisa y cierra las sesiones abiertas en otros dispositivos.",
      "Si hubo daño o robo de información, guarda evidencias y denuncia en la Fiscalía.",
    ],
  },
  {
    id: "ciberacoso",
    nombre: "Ciberacoso",
    senales: ["ciberacoso", "ciberbullying", "acoso en redes", "me acosan", "me amenazan", "amenazas por redes", "me insultan en redes", "grooming"],
    definicion:
      "El ciberacoso es el hostigamiento repetido a una persona mediante medios digitales: mensajes, publicaciones, amenazas o humillaciones en línea.",
    sencillo: "Es molestar, amenazar o humillar a alguien una y otra vez por internet.",
    ejemplo: "Un grupo crea memes ofensivos sobre un compañero y los comparte a diario en el chat del curso.",
    queHacer: [
      "No respondas a las provocaciones y bloquea a la persona.",
      "Guarda evidencias (capturas con fecha) y reporta el contenido en la plataforma.",
      "Cuéntaselo a una persona de confianza; si hay amenazas, denuncia en la Fiscalía.",
    ],
  },
  {
    id: "firma-electronica",
    nombre: "Firma electrónica",
    senales: ["firma electronica", "firma digital", "firmar electronicamente", "token de firma", "certificado de firma"],
    definicion:
      "La firma electrónica son datos en formato electrónico que identifican a quien firma un documento y demuestran que lo aprobó.",
    sencillo: "Es tu firma, pero en versión digital y con validez legal.",
    ejemplo: "Un contrato firmado con un certificado de firma electrónica vale igual que uno firmado a mano en papel.",
    normativa:
      "La Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos (2002) le reconoce la misma validez y efectos jurídicos que a la firma manuscrita.",
  },
  {
    id: "comercio-electronico",
    nombre: "Comercio electrónico",
    senales: ["comercio electronico", "compras en linea", "compra en linea", "tienda en linea", "e-commerce", "ecommerce", "contrato electronico", "mensaje de datos", "mensajes de datos"],
    definicion:
      "El comercio electrónico es la compra y venta de bienes o servicios por medios electrónicos; los contratos y mensajes de datos tienen validez jurídica.",
    sencillo: "Es comprar y vender por internet, con las mismas reglas y derechos que en una tienda física.",
    ejemplo: "Comprar un curso en una plataforma en línea y pagar con tarjeta es un contrato electrónico válido.",
    normativa:
      "Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos: los mensajes de datos tienen igual valor jurídico que los documentos escritos.",
  },
  {
    id: "propiedad-intelectual",
    nombre: "Propiedad intelectual y derechos de autor",
    senales: [
      "propiedad intelectual", "derechos de autor", "derecho de autor", "copyright", "pirateria", "plagio", "descargar peliculas",
      "copiar un trabajo", "software pirata", "licencia", "creative commons",
    ],
    definicion:
      "La propiedad intelectual protege las creaciones de la mente; los derechos de autor protegen obras como textos, música, fotos, videos y software.",
    sencillo: "Lo que alguien crea le pertenece: para usarlo necesitas su permiso o una licencia.",
    ejemplo: "Subir a tu canal una película completa sin autorización del titular infringe sus derechos de autor.",
    normativa:
      "En Ecuador se regula principalmente en el Código Orgánico de la Economía Social de los Conocimientos, Creatividad e Innovación (Código Ingenios).",
  },
  {
    id: "malware",
    nombre: "Malware y ransomware",
    senales: ["malware", "virus", "ransomware", "secuestraron mis archivos", "cifraron mis archivos", "troyano", "spyware", "keylogger"],
    definicion:
      "El malware es software malicioso que daña un sistema o roba información; el ransomware es un tipo que cifra los archivos y pide un rescate para devolverlos.",
    sencillo: "Es un programa dañino que se mete en tu equipo para robar, espiar o bloquear tus archivos.",
    ejemplo: "Abres un adjunto \"factura.pdf.exe\" y todos tus documentos quedan bloqueados con un mensaje que exige un pago.",
    normativa: "Dañar o alterar sistemas o datos puede constituir ataque a la integridad de sistemas informáticos (COIP, art. 232).",
  },
  {
    id: "evidencia-digital",
    nombre: "Evidencia digital",
    senales: ["evidencia digital", "prueba digital", "capturas de pantalla", "captura de pantalla", "como pruebo", "sirve como prueba", "cadena de custodia"],
    definicion:
      "La evidencia digital es la información en formato electrónico que puede servir como prueba en un proceso: mensajes, correos, registros o archivos.",
    sencillo: "Son las pruebas que están en tu celular o computadora.",
    ejemplo:
      "Una captura de pantalla de una amenaza ayuda, pero es más sólida si se conserva el mensaje original en el dispositivo y un perito lo extrae con cadena de custodia.",
  },
];

/** Comparaciones frecuentes, para responder "¿cuál es la diferencia?". */
export const COMPARACIONES: Record<string, string> = {
  "datos-personales|privacidad":
    "La privacidad protege tu espacio íntimo frente a intromisiones (que nadie invada tu vida privada); la protección de datos protege el control sobre tu información personal, incluso la que compartes públicamente (quién la usa y para qué).",
  "estafa-digital|phishing":
    "El phishing es una técnica de engaño para obtener tus datos o contraseñas; la estafa digital es el perjuicio patrimonial que se logra con un engaño (el phishing suele ser el primer paso de una estafa).",
  "firma-electronica|comercio-electronico":
    "El comercio electrónico es la actividad de comprar y vender por medios electrónicos; la firma electrónica es una herramienta que permite firmar documentos y contratos dentro de esa actividad.",
  "acceso-no-consentido|suplantacion":
    "El acceso no consentido es entrar sin permiso a una cuenta o sistema ajeno; la suplantación es hacerse pasar por otra persona (puede hacerse sin entrar a su cuenta, por ejemplo con un perfil falso).",
  "datos-personales|habeas-data":
    "La protección de datos es el derecho; el hábeas data es la acción judicial para hacerlo valer cuando alguien no te permite conocer, corregir o eliminar tus datos.",
};

export function comparacion(a: string, b: string): string | undefined {
  return COMPARACIONES[`${a}|${b}`] ?? COMPARACIONES[`${b}|${a}`];
}
