"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  X,
  Home,
  BookOpen,
  Library,
  ClipboardCheck,
  Scale,
  ClipboardList,
  MessagesSquare,
  Trophy,
  Target,
  BookMarked,
  Newspaper,
  Users,
  GraduationCap,
  User,
  Settings,
  ShieldCheck,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import type { EnlaceNav, SeccionNav } from "@/lib/navigation";

// Alias para no romper el resto del archivo si se reutilizan estos nombres
export type EnlaceMovil = EnlaceNav;
export type SeccionMovil = SeccionNav;

// Un icono por ruta — mismo criterio que pidió el rediseño (Dashboard/Inicio →
// Home, Tutoría → GraduationCap, Evaluaciones → ClipboardCheck, etc.)
const ICONOS: Record<string, LucideIcon> = {
  "/dashboard": Home,
  "/modulos": BookOpen,
  "/biblioteca": Library,
  "/evaluaciones": ClipboardCheck,
  "/casos-practicos": Scale,
  "/autoevaluacion": ClipboardList,
  "/foro": MessagesSquare,
  "/ranking": Trophy,
  "/retos": Target,
  "/glosario": BookMarked,
  "/noticias": Newspaper,
  "/docente/estudiantes": Users,
  "/mi-tutoria": GraduationCap,
  "/perfil": User,
  "/admin": ShieldCheck,
  "/docente": Settings,
};

function iconoDe(href: string): LucideIcon {
  return ICONOS[href] ?? BookOpen;
}

interface MobileNavDrawerProps {
  abierto: boolean;
  onClose: () => void;
  secciones: SeccionMovil[];
  enlaceRolExtra?: EnlaceMovil; // "Admin" o "Panel docente", según el rol
  pathname: string;
  nombre: string;
  email: string;
  rolLabel: string;
  theme: string | undefined;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export function MobileNavDrawer({
  abierto,
  onClose,
  secciones,
  enlaceRolExtra,
  pathname,
  nombre,
  email,
  rolLabel,
  theme,
  onToggleTheme,
  onLogout,
}: MobileNavDrawerProps) {
  const cerrarBtnRef = useRef<HTMLButtonElement>(null);
  const [expandidas, setExpandidas] = useState<Record<string, boolean>>({});

  // Al abrir: bloquear scroll del body, enfocar el botón de cerrar, y
  // expandir automáticamente la sección que contiene la ruta activa.
  useEffect(() => {
    if (!abierto) return;

    document.body.style.overflow = "hidden";
    cerrarBtnRef.current?.focus();

    const inicial: Record<string, boolean> = {};
    secciones.forEach((s) => {
      inicial[s.titulo] = s.enlaces.some((e) => pathname?.startsWith(e.href));
    });
    if (!Object.values(inicial).some(Boolean) && secciones[0]) {
      inicial[secciones[0].titulo] = true;
    }
    setExpandidas(inicial);

    return () => {
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  // Cerrar con la tecla Escape
  useEffect(() => {
    if (!abierto) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [abierto, onClose]);

  function toggleSeccion(titulo: string) {
    setExpandidas((prev) => ({ ...prev, [titulo]: !prev[titulo] }));
  }

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm md:hidden transition-opacity duration-300 motion-reduce:transition-none ${
          abierto ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className={`fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm bg-surface shadow-card-lg md:hidden flex flex-col
          transition-transform duration-300 ease-out motion-reduce:transition-none
          ${abierto ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 h-16 bg-navy shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <GraduationCap className="w-4 h-4 text-white" />
            </span>
            <span className="font-bold text-white text-sm leading-none">Legislación Informática</span>
          </div>
          <button
            ref={cerrarBtnRef}
            onClick={onClose}
            aria-label="Cerrar menú"
            className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-colors motion-reduce:transition-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Tarjeta de usuario */}
          <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-light p-4 flex items-center gap-3 mb-5">
            <div className="h-11 w-11 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold">
              {nombre.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{nombre}</p>
              <p className="text-xs text-accent font-medium">{rolLabel}</p>
              {email && <p className="text-xs text-slate-400 truncate">{email}</p>}
            </div>
          </div>

          {/* Secciones de navegación */}
          <nav className="flex flex-col gap-2">
            {secciones.map((seccion) => {
              const expandida = expandidas[seccion.titulo] ?? false;
              return (
                <div key={seccion.titulo}>
                  <button
                    onClick={() => toggleSeccion(seccion.titulo)}
                    aria-expanded={expandida}
                    className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    {seccion.titulo}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 motion-reduce:transition-none ${
                        expandida ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
                    style={{ gridTemplateRows: expandida ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-1 pb-2">
                        {seccion.enlaces.map((link) => {
                          const activo = pathname?.startsWith(link.href) && link.href !== "/";
                          const Icono = iconoDe(link.href);
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={onClose}
                              aria-current={activo ? "page" : undefined}
                              className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors motion-reduce:transition-none ${
                                activo
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-foreground hover:bg-background-secondary"
                              }`}
                            >
                              {activo && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
                              )}
                              <Icono className="w-[18px] h-[18px] shrink-0" />
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Configuración */}
          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-1">
            <p className="px-2 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Configuración
            </p>
            <Link
              href="/perfil"
              onClick={onClose}
              aria-current={pathname?.startsWith("/perfil") ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors motion-reduce:transition-none ${
                pathname?.startsWith("/perfil")
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-background-secondary"
              }`}
            >
              <User className="w-[18px] h-[18px]" />
              Perfil
            </Link>

            {enlaceRolExtra && (
              <Link
                href={enlaceRolExtra.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground hover:bg-background-secondary transition-colors motion-reduce:transition-none"
              >
                <Settings className="w-[18px] h-[18px]" />
                {enlaceRolExtra.label}
              </Link>
            )}

            <button
              onClick={onToggleTheme}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground hover:bg-background-secondary transition-colors motion-reduce:transition-none"
            >
              {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              {theme === "dark" ? "Modo claro" : "Modo oscuro"}
            </button>
          </div>
        </div>

        {/* Cerrar sesión — fijo abajo, diferenciado */}
        <div className="shrink-0 border-t border-border p-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors motion-reduce:transition-none"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
