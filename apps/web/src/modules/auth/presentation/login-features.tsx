import { ShieldCheck, FileText, GraduationCap } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Seguridad",
    description: "Protegemos tu información.",
  },
  {
    icon: FileText,
    title: "Normativa actualizada",
    description: "Accede a contenido legal y académico.",
  },
  {
    icon: GraduationCap,
    title: "Acceso educativo",
    description: "Contenido para estudiantes y profesionales.",
  },
];

/**
 * Franja informativa institucional al pie del panel de login.
 * Puramente presentacional, sin lógica de autenticación.
 */
export function LoginFeatures() {
  return (
    <div className="grid grid-cols-1 gap-3 border-t border-login-border/50 pt-5 sm:grid-cols-3">
      {FEATURES.map(({ icon: Icon, title, description }) => (
        <div
          key={title}
          className="group flex items-start gap-2.5 rounded-xl p-2 transition-colors duration-200 hover:bg-login-bg-secondary/60"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-login-indigo/40 text-login-pink ring-1 ring-login-border transition-transform duration-200 group-hover:scale-105">
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <p className="text-xs font-semibold text-login-text">{title}</p>
            <p className="text-xs text-login-text-secondary">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
