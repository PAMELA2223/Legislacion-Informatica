"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Scale,
  Home,
  BookOpen,
  Library,
  ClipboardCheck,
  ClipboardList,
  MessagesSquare,
  Trophy,
  Target,
  BookMarked,
  Newspaper,
  Users,
  GraduationCap,
  User,
  ShieldCheck,
  Settings,
  LayoutDashboard,
  UserCheck,
  ScrollText,
  Info,
  LogIn,
  type LucideIcon,
} from "lucide-react";
import type { Rol } from "@prisma/client";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import type { EnlaceNav } from "@/lib/navigation";

// Un solo lugar donde se resuelve el nombre de ícono (string, dato plano
// que sí puede viajar de un Server Component a este Client Component) a un
// componente real de lucide-react.
const ICONOS: Record<string, LucideIcon> = {
  Home,
  BookOpen,
  Library,
  ClipboardCheck,
  ClipboardList,
  Scale,
  MessagesSquare,
  Trophy,
  Target,
  BookMarked,
  Newspaper,
  Users,
  GraduationCap,
  User,
  ShieldCheck,
  Settings,
  LayoutDashboard,
  UserCheck,
  ScrollText,
  Info,
  LogIn,
};

function resolverIcono(nombre: string): LucideIcon {
  return ICONOS[nombre] ?? Home;
}

const ETIQUETAS_ROL: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
  INVITADO: "Invitado",
};

export function AppSidebar({
  items,
  rol,
  nombre,
  email,
}: {
  items: EnlaceNav[];
  rol: Rol;
  nombre: string;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [colapsado, setColapsado] = useState(false);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] bg-surface border-r border-border
        transition-[width] duration-300 ease-out motion-reduce:transition-none
        ${colapsado ? "w-[76px]" : "w-64"}`}
    >
      {/* Encabezado: logo + botón de colapsar */}
      <div className={`flex items-center h-14 shrink-0 border-b border-border ${colapsado ? "justify-center px-0" : "justify-between px-4"}`}>
        {!colapsado && (
          <span className="flex items-center gap-2 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Scale className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="text-xs font-semibold text-foreground truncate">Navegación</span>
          </span>
        )}
        <button
          onClick={() => setColapsado((v) => !v)}
          aria-label={colapsado ? "Expandir menú" : "Contraer menú"}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-background-secondary hover:text-foreground transition-colors motion-reduce:transition-none"
        >
          {colapsado ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 flex flex-col gap-1">
        {items.map((item) => {
          const activo =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(item.href);
          const Icono = resolverIcono(item.icon);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={colapsado ? item.label : undefined}
              aria-current={activo ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors motion-reduce:transition-none ${
                colapsado ? "justify-center" : ""
              } ${
                activo
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-background-secondary"
              }`}
            >
              {activo && !colapsado && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
              )}
              <Icono className="w-[18px] h-[18px] shrink-0" />
              {!colapsado && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Usuario + cerrar sesión */}
      <div className={`border-t border-border p-3 shrink-0 ${colapsado ? "flex flex-col items-center gap-2" : ""}`}>
        {colapsado ? (
          <>
            <div
              title={`${nombre} · ${ETIQUETAS_ROL[rol] ?? rol}`}
              className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold"
            >
              {(nombre || "?").charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors motion-reduce:transition-none"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5 rounded-xl bg-background-secondary p-2.5 mb-2">
              <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                {(nombre || "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{nombre}</p>
                <p className="text-[11px] text-muted-foreground">{ETIQUETAS_ROL[rol] ?? rol}</p>
                {email && <p className="text-[10px] text-disabled-foreground truncate">{email}</p>}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors motion-reduce:transition-none"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
