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

// Rutas académicas/comunitarias, válidas para ESTUDIANTE y DOCENTE (un
// administrador gestiona este contenido desde /admin, no navega aquí).
const SECCIONES: SeccionNav[] = [
  {
    titulo: "Principal",
    enlaces: [{ href: "/dashboard", label: "Inicio", roles: ["ESTUDIANTE", "DOCENTE"], icon: "Home" }],
  },
  {
    titulo: "Académico",
    enlaces: [
      { href: "/modulos", label: "Módulos", roles: ["ESTUDIANTE", "DOCENTE"], icon: "BookOpen" },
      { href: "/biblioteca", label: "Biblioteca", roles: ["ESTUDIANTE", "DOCENTE"], icon: "Library" },
      { href: "/evaluaciones", label: "Evaluaciones", roles: ["ESTUDIANTE", "DOCENTE"], icon: "ClipboardCheck" },
      { href: "/casos-practicos", label: "Casos prácticos", roles: ["ESTUDIANTE", "DOCENTE"], icon: "Scale" },
      { href: "/autoevaluacion", label: "Autoevaluación", roles: ["ESTUDIANTE", "DOCENTE"], icon: "ClipboardList" },
      { href: "/docente/estudiantes", label: "Mis estudiantes", roles: ["DOCENTE"], icon: "Users" },
      { href: "/mi-tutoria", label: "Mi tutoría", roles: ["ESTUDIANTE"], icon: "GraduationCap" },
    ],
  },
  {
    titulo: "Comunidad",
    enlaces: [
      { href: "/foro", label: "Foro", roles: ["ESTUDIANTE", "DOCENTE"], icon: "MessagesSquare" },
      { href: "/ranking", label: "Ranking", roles: ["ESTUDIANTE", "DOCENTE"], icon: "Trophy" },
      { href: "/retos", label: "Retos", roles: ["ESTUDIANTE", "DOCENTE"], icon: "Target" },
      { href: "/glosario", label: "Glosario", roles: ["ESTUDIANTE", "DOCENTE"], icon: "BookMarked" },
      { href: "/noticias", label: "Noticias", roles: ["ESTUDIANTE", "DOCENTE"], icon: "Newspaper" },
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
  if (rol === "DOCENTE")
    return { href: "/docente", label: "Panel docente", roles: ["DOCENTE"], icon: "Settings" };
  return undefined;
}

// ============================================================
// CONFIGURACIÓN DEL SIDEBAR LATERAL (escritorio)
// ============================================================
// Un único componente de sidebar (components/sidebar/app-sidebar.tsx) se
// alimenta de una lista de items distinta según el rol — nunca se copia el
// componente 4 veces. Docente y Estudiante reutilizan exactamente la misma
// navegación de arriba (cero riesgo de que el sidebar muestre algo que el
// navbar/drawer no muestran); Administrador reutiliza las rutas reales que
// ya existían en el antiguo `admin-sidebar.tsx`.

export const ITEMS_SIDEBAR_ADMIN: EnlaceNav[] = [
  { href: "/admin/estadisticas", label: "Estadísticas", roles: ["ADMINISTRADOR"], icon: "LayoutDashboard" },
  { href: "/admin/usuarios", label: "Usuarios y roles", roles: ["ADMINISTRADOR"], icon: "Users" },
  { href: "/admin/tutorias", label: "Tutorías", roles: ["ADMINISTRADOR"], icon: "UserCheck" },
  { href: "/admin/cursos", label: "Módulos", roles: ["ADMINISTRADOR"], icon: "GraduationCap" },
  { href: "/admin/biblioteca", label: "Biblioteca", roles: ["ADMINISTRADOR"], icon: "Library" },
  { href: "/admin/evaluaciones", label: "Evaluaciones", roles: ["ADMINISTRADOR"], icon: "ClipboardList" },
  { href: "/admin/casos-practicos", label: "Casos prácticos", roles: ["ADMINISTRADOR"], icon: "Scale" },
  { href: "/admin/glosario", label: "Glosario", roles: ["ADMINISTRADOR"], icon: "BookMarked" },
  { href: "/admin/noticias", label: "Noticias", roles: ["ADMINISTRADOR"], icon: "Newspaper" },
  { href: "/admin/foro", label: "Foro", roles: ["ADMINISTRADOR"], icon: "MessagesSquare" },
  { href: "/admin/logs", label: "Logs", roles: ["ADMINISTRADOR"], icon: "ScrollText" },
];

/** Items del sidebar lateral de escritorio para un rol dado. Docente y
 * Estudiante: la misma navegación de `obtenerEnlacesPlanos`, con "Perfil"
 * fijado al final. Administrador: sus rutas reales de gestión. */
export function obtenerItemsSidebar(rol: Rol): EnlaceNav[] {
  if (rol === "ADMINISTRADOR") return ITEMS_SIDEBAR_ADMIN;

  const perfil: EnlaceNav = { href: "/perfil", label: "Mi perfil", roles: [rol], icon: "User" };
  return [...obtenerEnlacesPlanos(rol), perfil];
}
