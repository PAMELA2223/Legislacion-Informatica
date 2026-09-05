import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad — Legislación Informática",
};

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/registro"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al registro
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <ShieldCheck className="w-5 h-5 text-accent" />
          </span>
          <h1 className="text-2xl font-bold text-foreground">Política de Privacidad</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-10">
          Última actualización: {new Date().toLocaleDateString("es-EC", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="rounded-2xl border border-border bg-surface p-6 mb-8">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Nota importante:</strong> esta
            plataforma es un proyecto académico de tesis. Este documento
            explica de forma simple qué datos se guardan y para qué, con fines
            educativos y de transparencia — no es un documento legal formal.
          </p>
        </div>

        <div className="flex flex-col gap-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">1. Qué información recopilamos</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Nombre y correo electrónico, al registrarte</li>
              <li>Tu rol en la plataforma (estudiante, docente, administrador)</li>
              <li>Tu progreso académico: módulos completados, evaluaciones, casos resueltos, XP e insignias</li>
              <li>Contenido que publicas en el foro (si participas)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">2. Para qué se usa</h2>
            <p>
              Únicamente para el funcionamiento de la plataforma: iniciar tu
              sesión, mostrarte tu progreso, permitir el seguimiento académico
              de tu docente tutor (si aplica), y generar estadísticas
              agregadas para la investigación de tesis (sin identificarte
              individualmente en esas estadísticas).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">3. Dónde se almacena</h2>
            <p>
              Tus datos se guardan de forma segura usando Supabase
              (autenticación) y una base de datos PostgreSQL, con acceso
              protegido por contraseña y roles.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">4. Con quién se comparte</h2>
            <p>
              No vendemos ni compartimos tu información con terceros con fines
              comerciales. Tu docente tutor (si tienes uno asignado) puede ver
              tu progreso académico dentro de la plataforma — nunca fuera de
              ella.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">5. Tus derechos</h2>
            <p>
              Puedes solicitar la corrección o eliminación de tu cuenta y
              datos asociados en cualquier momento, contactando al
              administrador de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">6. Cookies y sesión</h2>
            <p>
              Usamos únicamente cookies necesarias para mantener tu sesión
              iniciada. No usamos cookies de publicidad ni rastreo de
              terceros.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
