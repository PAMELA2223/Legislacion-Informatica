import { NavBar } from "@/components/nav-bar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { requireAutenticado } from "@/lib/authorization";
import { obtenerItemsSidebar } from "@/lib/navigation";

// Punto de protección central de TODA el área autenticada de la plataforma
// (/dashboard, /modulos, /biblioteca, /evaluaciones, /admin, /docente,
// /mi-tutoria, etc). Bloquea aquí, en un solo lugar, a quien no tiene
// sesión y a INVITADO (que no tiene acceso a ninguna sección interna,
// solo a las páginas públicas fuera de este grupo de rutas). Cada
// subárea (/admin, /docente) además aplica su propio layout con una
// restricción de rol más estricta.
//
// El sidebar lateral (solo escritorio) vive aquí, una única vez para los
// 3 roles con acceso — su contenido cambia según `obtenerItemsSidebar(rol)`,
// la misma fuente que ya usa el navbar superior y el menú móvil. En móvil
// no se duplica: sigue usando el drawer existente disparado desde NavBar.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireAutenticado();
  const itemsSidebar = obtenerItemsSidebar(ctx.rol);

  return (
    <div className="min-h-screen bg-background">
      <NavBar rol={ctx.rol} nombre={ctx.nombre} email={ctx.email} />
      <div className="flex">
        <AppSidebar items={itemsSidebar} rol={ctx.rol} nombre={ctx.nombre} email={ctx.email} />
        <main id="contenido-principal" className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
