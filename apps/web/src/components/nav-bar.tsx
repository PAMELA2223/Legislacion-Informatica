"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Moon, Sun, LogOut, ShieldCheck, Scale } from "lucide-react";
import { useTheme } from "next-themes";
import type { Rol } from "@prisma/client";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import {
  obtenerEnlacesPlanos,
  obtenerEnlaceRolExtra,
  obtenerSeccionesNavegacion,
} from "@/lib/navigation";
import { MobileNavDrawer } from "./mobile-nav-drawer";

const ETIQUETAS_ROL: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
  INVITADO: "Invitado",
};

// Un acento de color distinto por rol, para diferenciar visualmente el
// área administrativa/docente sin cambiar la identidad general (Sección 34
// y 37 del pedido: "diferenciar visualmente el área administrativa").
const ACENTO_ROL: Record<string, string> = {
  ADMINISTRADOR: "bg-gold/15 text-gold border-gold/30",
  DOCENTE: "bg-accent/15 text-accent border-accent/30",
  ESTUDIANTE: "bg-primary/15 text-primary-hover border-primary/30",
  INVITADO: "bg-white/10 text-slate-300 border-white/20",
};

export function NavBar({
  rol,
  nombre = "",
  email = "",
}: {
  rol: Rol;
  nombre?: string;
  email?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [abierto, setAbierto] = useState(false);

  // Misma fuente para escritorio y móvil (lib/navigation.ts) — nunca dos
  // listas mantenidas por separado, para que ambos respeten exactamente
  // el mismo RBAC.
  const enlacesPlanos = obtenerEnlacesPlanos(rol);
  const secciones = obtenerSeccionesNavegacion(rol);
  const enlaceRolExtra = obtenerEnlaceRolExtra(rol);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-navy shadow-card-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo + identidad */}
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow-primary">
            <Scale className="w-[18px] h-[18px] text-white" strokeWidth={2.25} />
          </span>
          <span className="hidden sm:flex flex-col leading-none">
            <span className="font-bold text-white text-sm tracking-tight">Legislación Informática</span>
            <span className="text-[10px] text-slate-400 tracking-wide uppercase">Plataforma académica</span>
          </span>
        </Link>

        {/* ============ DESKTOP ============ */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto flex-1 justify-center">
          {enlacesPlanos.map((link) => {
            const activo = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm rounded-lg px-3 py-2 whitespace-nowrap transition-colors ${
                  activo ? "text-white font-medium bg-white/10" : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
                {activo && (
                  <span className="absolute left-3 right-3 -bottom-[9px] h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Cambiar tema"
            className="rounded-lg p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {enlaceRolExtra && (
            <Link
              href={enlaceRolExtra.href}
              className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 border bg-white/5 text-white border-white/10 hover:bg-white/10 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {enlaceRolExtra.label}
            </Link>
          )}

          <Link
            href="/perfil"
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold">
              {(nombre || "?").charAt(0).toUpperCase()}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 border ${ACENTO_ROL[rol]}`}>
              {ETIQUETAS_ROL[rol] ?? rol}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="rounded-lg p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* ============ MÓVIL: botón hamburguesa ============ */}
        <button
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={abierto}
          className="md:hidden h-10 w-10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors motion-reduce:transition-none shrink-0"
        >
          <span className="relative w-5 h-5 block">
            <Menu
              className={`absolute inset-0 transition-all duration-200 motion-reduce:transition-none ${
                abierto ? "opacity-0 rotate-45 scale-75" : "opacity-100 rotate-0 scale-100"
              }`}
            />
            <X
              className={`absolute inset-0 transition-all duration-200 motion-reduce:transition-none ${
                abierto ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-45 scale-75"
              }`}
            />
          </span>
        </button>
      </div>

      {/* ============ MÓVIL: drawer (misma navegación que desktop) ============ */}
      <MobileNavDrawer
        abierto={abierto}
        onClose={() => setAbierto(false)}
        secciones={secciones}
        enlaceRolExtra={enlaceRolExtra}
        pathname={pathname ?? ""}
        nombre={nombre || "Usuario"}
        email={email}
        rolLabel={ETIQUETAS_ROL[rol] ?? rol}
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onLogout={handleLogout}
      />
    </header>
  );
}
