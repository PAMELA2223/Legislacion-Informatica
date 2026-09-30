// ============================================================
// NAVEGACIÓN CENTRALIZADA POR ROL
// ============================================================
// Única fuente de verdad de qué enlaces existen y a qué rol le corresponde
// cada uno. Tanto el navbar de escritorio (nav-bar.tsx) como el drawer
// móvil (mobile-nav-drawer.tsx) llaman a `obtenerSeccionesNavegacion()` —
// nunca mantienen su propia lista. Esto es intencional: antes existían dos
// listas separadas (una plana para escritorio, otra agrupada para móvil)
// que podían desincronizarse si se editaba una y no la otra.

import type { Rol } from "@prisma/client";

export interface EnlaceNav {
  href: string;
  label: string;
  roles: Rol[];
  icon: string; // nombre del ícono de lucide-react, resuelto por cada consumidor (navbar, drawer, sidebar)
}

export interface SeccionNav {
  titulo: string;
  enlaces: EnlaceNav[];
}

// Rutas académicas/comunitarias, válidas para ESTUDIANTE (un
// administrador gestiona este contenido desde /admin, no navega aquí).
const SECCIONES: SeccionNav[] = [
  {
    titulo: "Principal",
    enlaces: [{ href: "/dashboard", label: "Inicio", roles: ["ESTUDIANTE"], icon: "Home" }],
  },
  {
    titulo: "Académico",
    enlaces: [
      // Mismo orden que el flujo: Inicio → Autoevaluación → Módulos.
      { href: "/autoevaluacion", label: "Autoevaluación", roles: ["ESTUDIANTE"], icon: "ClipboardList" },
      { href: "/modulos", label: "Módulos", roles: ["ESTUDIANTE"], icon: "BookOpen" },
      { href: "/biblioteca", label: "Biblioteca", roles: ["ESTUDIANTE"], icon: "Library" },
      { href: "/casos-practicos", label: "Casos prácticos", roles: ["ESTUDIANTE"], icon: "Scale" },
      // "Lo más destacado" reemplaza a las antiguas categorías "Videos" e
      // "Infografías". "Evaluaciones" ya no es una categoría: vive en cada módulo.
      { href: "/destacados", label: "Lo más destacado", roles: ["ESTUDIANTE"], icon: "Sparkles" },
    ],
  },
  {
    titulo: "Comunidad",
    enlaces: [
      { href: "/foro", label: "Foro", roles: ["ESTUDIANTE"], icon: "MessagesSquare" },
      { href: "/ranking", label: "Ranking", roles: ["ESTUDIANTE"], icon: "Trophy" },
      { href: "/retos", label: "Retos", roles: ["ESTUDIANTE"], icon: "Target" },
      { href: "/glosario", label: "Glosario", roles: ["ESTUDIANTE"], icon: "BookMarked" },
      { href: "/jurisprudencia", label: "Jurisprudencia", roles: ["ESTUDIANTE"], icon: "Gavel" },
      { href: "/referencias-internacionales", label: "Referencias internacionales", roles: ["ESTUDIANTE"], icon: "Globe2" },
      { href: "/noticias", label: "Noticias", roles: ["ESTUDIANTE"], icon: "Newspaper" },
      { href: "/preguntas-frecuentes", label: "Preguntas frecuentes", roles: ["ESTUDIANTE"], icon: "HelpCircle" },
    ],
  },
];

/** Enlaces públicos para INVITADO — páginas que realmente existen, sin
 * inventar rutas. Se deja disponible con el mismo patrón de configuración
 * por si en el futuro se necesita un drawer público (ver documentación). */
export const ENLACES_INVITADO: EnlaceNav[] = [
  { href: "/", label: "Inicio", roles: ["INVITADO"], icon: "Home" },
  { href: "/#proyecto", label: "Sobre el proyecto", roles: ["INVITADO"], icon: "Info" },
  { href: "/login", label: "Iniciar sesión", roles: ["INVITADO"], icon: "LogIn" },
];

/** Enlaces visibles para un rol, agrupados en secciones — sin secciones
 * vacías (si ningún enlace de una sección aplica al rol, la sección no se
 * incluye). Usado por el drawer móvil. */
export function obtenerSeccionesNavegacion(rol: Rol): SeccionNav[] {
  return SECCIONES.map((seccion) => ({
    titulo: seccion.titulo,
    enlaces: seccion.enlaces.filter((e) => e.roles.includes(rol)),
  })).filter((seccion) => seccion.enlaces.length > 0);
}

/** Misma información en lista plana — usada por el navbar de escritorio.
 * Se deriva de `obtenerSeccionesNavegacion()`, nunca se mantiene aparte. */
export function obtenerEnlacesPlanos(rol: Rol): EnlaceNav[] {
  return obtenerSeccionesNavegacion(rol).flatMap((s) => s.enlaces);
}

/** Enlace fijo adicional (fuera de las secciones) según el rol: el acceso
 * directo a su panel específico. Se muestra siempre, no depende de la ruta activa. */
export function obtenerEnlaceRolExtra(rol: Rol): EnlaceNav | undefined {
  if (rol === "ADMINISTRADOR")
    return { href: "/admin", label: "Admin", roles: ["ADMINISTRADOR"], icon: "ShieldCheck" };
  return undefined;
}

// ============================================================
// CONFIGURACIÓN DEL SIDEBAR LATERAL (escritorio)
// ============================================================
// Un único componente de sidebar (components/sidebar/app-sidebar.tsx) se
// alimenta de una lista de items distinta según el rol — nunca se copia el
// componente 4 veces. Estudiante reutiliza exactamente la misma
// navegación de arriba (cero riesgo de que el sidebar muestre algo que el
// navbar/drawer no muestran); Administrador reutiliza las rutas reales que
// ya existían en el antiguo `admin-sidebar.tsx`.

export const ITEMS_SIDEBAR_ADMIN: EnlaceNav[] = [
  { href: "/admin/estadisticas", label: "Estadísticas", roles: ["ADMINISTRADOR"], icon: "LayoutDashboard" },
  { href: "/admin/usuarios", label: "Usuarios y roles", roles: ["ADMINISTRADOR"], icon: "Users" },
  { href: "/admin/cursos", label: "Módulos", roles: ["ADMINISTRADOR"], icon: "GraduationCap" },
  { href: "/admin/biblioteca", label: "Biblioteca", roles: ["ADMINISTRADOR"], icon: "Library" },
  { href: "/admin/autoevaluaciones", label: "Autoevaluaciones", roles: ["ADMINISTRADOR"], icon: "ClipboardCheck" },
  { href: "/admin/evaluaciones", label: "Evaluaciones", roles: ["ADMINISTRADOR"], icon: "ClipboardList" },
  { href: "/admin/destacados", label: "Lo más destacado", roles: ["ADMINISTRADOR"], icon: "Sparkles" },
  { href: "/admin/infografias", label: "Infografías", roles: ["ADMINISTRADOR"], icon: "ImageIcon" },
  { href: "/admin/chatbot", label: "Chatbot", roles: ["ADMINISTRADOR"], icon: "Bot" },
  { href: "/admin/casos-practicos", label: "Casos prácticos", roles: ["ADMINISTRADOR"], icon: "Scale" },
  { href: "/admin/glosario", label: "Glosario", roles: ["ADMINISTRADOR"], icon: "BookMarked" },
  { href: "/admin/noticias", label: "Noticias", roles: ["ADMINISTRADOR"], icon: "Newspaper" },
  { href: "/admin/faq", label: "Preguntas frecuentes", roles: ["ADMINISTRADOR"], icon: "HelpCircle" },
  { href: "/admin/jurisprudencia", label: "Jurisprudencia", roles: ["ADMINISTRADOR"], icon: "Gavel" },
  { href: "/admin/referencias-internacionales", label: "Referencias internacionales", roles: ["ADMINISTRADOR"], icon: "Globe2" },
  { href: "/admin/foro", label: "Foro", roles: ["ADMINISTRADOR"], icon: "MessagesSquare" },
  { href: "/admin/logs", label: "Logs", roles: ["ADMINISTRADOR"], icon: "ScrollText" },
];

/** Items del sidebar lateral de escritorio para un rol dado. Estudiante:
 * la misma navegación de `obtenerEnlacesPlanos`, con "Perfil"
 * fijado al final. Administrador: sus rutas reales de gestión. */
export function obtenerItemsSidebar(rol: Rol): EnlaceNav[] {
  if (rol === "ADMINISTRADOR") return ITEMS_SIDEBAR_ADMIN;

  const perfil: EnlaceNav = { href: "/perfil", label: "Mi perfil", roles: [rol], icon: "User" };
  return [...obtenerEnlacesPlanos(rol), perfil];
}

// Agrupación del menú lateral por secciones, para que una lista larga sea
// fácil de recorrer. Usa exactamente los mismos enlaces de arriba.
const GRUPOS_ADMIN: { titulo: string; hrefs: string[] }[] = [
  { titulo: "Panel", hrefs: ["/admin/estadisticas", "/admin/usuarios"] },
  {
    titulo: "Aprendizaje",
    hrefs: [
      "/admin/cursos",
      "/admin/evaluaciones",
      "/admin/autoevaluaciones",
      "/admin/infografias",
      "/admin/casos-practicos",
      "/admin/destacados",
      "/admin/chatbot",
    ],
  },
  {
    titulo: "Recursos y comunidad",
    hrefs: [
      "/admin/biblioteca",
      "/admin/glosario",
      "/admin/jurisprudencia",
      "/admin/referencias-internacionales",
      "/admin/noticias",
      "/admin/faq",
      "/admin/foro",
    ],
  },
  { titulo: "Sistema", hrefs: ["/admin/logs"] },
];

/** Secciones del sidebar lateral para un rol (con encabezados). */
export function obtenerSeccionesSidebar(rol: Rol): SeccionNav[] {
  if (rol === "ADMINISTRADOR") {
    const usados = new Set(GRUPOS_ADMIN.flatMap((g) => g.hrefs));
    const secciones = GRUPOS_ADMIN.map((g) => ({
      titulo: g.titulo,
      enlaces: g.hrefs
        .map((h) => ITEMS_SIDEBAR_ADMIN.find((i) => i.href === h))
        .filter((i): i is EnlaceNav => Boolean(i)),
    }));
    // Cualquier enlace nuevo que no esté agrupado no se pierde: va al final.
    const resto = ITEMS_SIDEBAR_ADMIN.filter((i) => !usados.has(i.href));
    if (resto.length) secciones.push({ titulo: "Otros", enlaces: resto });
    return secciones.filter((s) => s.enlaces.length > 0);
  }
  const perfil: EnlaceNav = { href: "/perfil", label: "Mi perfil", roles: [rol], icon: "User" };
  return [...obtenerSeccionesNavegacion(rol), { titulo: "Cuenta", enlaces: [perfil] }];
}
