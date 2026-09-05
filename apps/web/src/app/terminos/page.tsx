import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export const metadata = {
  title: "Términos y Condiciones — Legislación Informática",
};

export default function TerminosPage() {
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
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Scale className="w-5 h-5 text-primary" />
          </span>
          <h1 className="text-2xl font-bold text-foreground">Términos y Condiciones</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-10">
          Última actualización: {new Date().toLocaleDateString("es-EC", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="rounded-2xl border border-border bg-surface p-6 mb-8">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Nota importante:</strong> esta
            plataforma fue desarrollada con fines académicos, como parte de un
            proyecto de tesis universitaria sobre legislación informática. Este
            documento es una versión simplificada para fines educativos y{" "}
            <strong className="text-foreground">no constituye un contrato legal vinculante</strong>.
          </p>
        </div>

        <div className="flex flex-col gap-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">1. Sobre esta plataforma</h2>
            <p>
              Legislación Informática es una plataforma educativa creada para
              fortalecer el conocimiento sobre normativa digital en Ecuador,
              mediante módulos de aprendizaje, biblioteca jurídica, evaluaciones,
              casos prácticos y tutoría entre docentes y estudiantes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">2. Uso de la cuenta</h2>
            <p>
              Al registrarte, aceptas usar la plataforma de forma responsable,
              con información real, y únicamente con fines educativos. Eres
              responsable de mantener segura tu contraseña.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">3. Contenido educativo</h2>
            <p>
              Los módulos, casos prácticos y documentos de la biblioteca
              jurídica tienen fines exclusivamente formativos. No sustituyen
              el asesoramiento legal profesional para casos reales.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">4. Datos y progreso académico</h2>
            <p>
              Tu progreso (módulos completados, evaluaciones, XP, insignias)
              se almacena para poder mostrarte tu avance y, en el caso de
              estudiantes, para que tu docente tutor pueda dar seguimiento
              académico. Ver la{" "}
              <Link href="/privacidad" className="text-primary hover:underline">
                Política de Privacidad
              </Link>{" "}
              para más detalle.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">5. Cambios</h2>
            <p>
              Al ser un proyecto académico en desarrollo, este documento puede
              actualizarse conforme evoluciona la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">6. Contacto</h2>
            <p>
              Si tienes preguntas sobre estos términos, puedes contactar al
              equipo responsable del proyecto a través de la institución
              académica correspondiente.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
