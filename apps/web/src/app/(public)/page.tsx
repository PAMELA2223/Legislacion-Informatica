import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Library,
  Scale,
  Trophy,
  ShieldCheck,
  LogIn,
  Lock,
  Users,
  Sparkles,
  Target,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TechLegalGraphic } from "@/modules/landing/presentation/tech-legal-graphic";
import { SectionBadge } from "@/modules/landing/presentation/section-badge";

const CARACTERISTICAS = [
  { icon: GraduationCap, title: "8 módulos educativos", desc: "Itinerario progresivo del concepto a la aplicación práctica de la legislación informática." },
  { icon: Library, title: "Biblioteca jurídica", desc: "Constitución, LOPDP, COIP y Ley de Comercio Electrónico, con buscador y consulta por artículo." },
  { icon: Scale, title: "Casos prácticos reales", desc: "Escenarios con normativa aplicable, sanciones y retroalimentación jurídica." },
  { icon: Trophy, title: "Gamificación", desc: "XP, niveles, insignias y ranking para sostener la motivación del estudiante." },
  { icon: Users, title: "Tutoría docente-estudiante", desc: "Seguimiento académico individual con tareas, objetivos y reuniones." },
  { icon: Target, title: "Autoevaluación de competencias", desc: "Diagnóstico inicial y final sobre 6 ejes de competencia digital." },
];

const TECNOLOGIAS = [
  { nombre: "Next.js", desc: "Framework de React para la construcción de la aplicación web." },
  { nombre: "TypeScript", desc: "Tipado estático para mejorar la mantenibilidad y seguridad del código." },
  { nombre: "Prisma", desc: "ORM utilizado para la interacción tipada con la base de datos." },
  { nombre: "PostgreSQL / Supabase", desc: "Base de datos relacional y autenticación gestionada." },
  { nombre: "Tailwind CSS", desc: "Sistema de diseño utilitario para una interfaz consistente." },
  { nombre: "React", desc: "Biblioteca base para la construcción de interfaces de usuario." },
];

const SEGURIDAD = [
  { icon: LogIn, title: "Autenticación", desc: "Gestionada mediante Supabase Auth, con sesión verificada en servidor." },
  { icon: Users, title: "Roles diferenciados", desc: "Administrador, Docente, Estudiante e Invitado, cada uno con su propia experiencia." },
  { icon: Lock, title: "Protección de rutas", desc: "Cada página exige el rol correspondiente en el servidor, no solo en la interfaz." },
  { icon: ShieldCheck, title: "Protección de acciones", desc: "Cada operación sensible (roles, tutorías, contenidos) se verifica en el backend." },
];

export default function LandingPage() {
  return (
    <main id="contenido-principal" className="min-h-screen bg-background overflow-x-hidden">
      {/* ============ NAVBAR PÚBLICO SIMPLE ============ */}
      <header className="sticky top-0 z-40 bg-navy">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Scale className="w-[18px] h-[18px] text-white" />
            </span>
            <span className="font-bold text-white text-sm">Legislación Informática</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/registro">
              <Button>Comenzar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative bg-navy">
        <div className="absolute inset-0 bg-grid bg-grid-pattern opacity-[0.4] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 text-gold px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Plataforma académica · Proyecto de tesis
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
              Legislación Informática,{" "}
              <span className="bg-gradient-to-r from-primary-hover to-accent bg-clip-text text-transparent">
                aplicada y medible
              </span>
            </h1>
            <p className="text-slate-300 text-lg max-w-xl mb-8">
              Una plataforma educativa desarrollada para fortalecer las
              competencias digitales y jurídicas en Ecuador: módulos,
              biblioteca legal, casos reales, evaluaciones y tutoría
              docente-estudiante, todo en un mismo lugar.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/registro">
                <Button className="shadow-glow-primary">
                  Explorar plataforma
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="#proyecto">
                <Button variant="outline" className="!border-white/20 !text-white hover:!bg-white/10">
                  Conocer el proyecto
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="!text-slate-300 hover:!text-white hover:!bg-white/10">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative aspect-square max-w-md mx-auto w-full animate-fade-in-up [animation-delay:150ms]">
            <TechLegalGraphic />
          </div>
        </div>
      </section>

      {/* ============ PRESENTACIÓN + PROPÓSITO ============ */}
      <section id="proyecto" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <SectionBadge>Presentación</SectionBadge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-4 mb-3">
              ¿Qué es esta plataforma?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Un sistema web educativo que organiza la legislación
              informática ecuatoriana en un itinerario de aprendizaje
              estructurado, con evaluación continua y seguimiento
              individualizado — pensado para acercar el marco legal digital
              a estudiantes y docentes de forma práctica.
            </p>
          </div>
          <div>
            <SectionBadge>Propósito</SectionBadge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-4 mb-3">
              ¿Qué problema resuelve?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              La legislación informática suele enseñarse de forma teórica y
              dispersa. Esta plataforma centraliza el contenido normativo,
              lo conecta con casos reales y mide, con datos verificables, la
              evolución de las competencias digitales del estudiante a lo
              largo del proceso.
            </p>
          </div>
        </div>
      </section>

      {/* ============ CARACTERÍSTICAS ============ */}
      <section className="bg-background-secondary py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <SectionBadge>Características</SectionBadge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-4">
              Todo lo que necesita un itinerario formativo completo
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CARACTERISTICAS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl bg-surface border border-border p-6 hover:-translate-y-1 hover:shadow-card-md transition-all duration-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TECNOLOGÍA ============ */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <SectionBadge>Tecnología</SectionBadge>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-4">
            Tecnologías utilizadas
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-3">
            Una arquitectura moderna, tipada y escalable, construida
            enteramente con herramientas de código abierto.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {TECNOLOGIAS.map((t) => (
            <div
              key={t.nombre}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <p className="font-semibold text-foreground text-sm mb-1">{t.nombre}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ SEGURIDAD Y CONTROL DE ACCESO ============ */}
      <section className="bg-navy py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-pattern opacity-[0.15]" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 text-accent px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              Seguridad y control de acceso
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-4">
              Un sistema de roles pensado desde la arquitectura
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto mt-3">
              Cada rol accede únicamente a lo que le corresponde — y esa
              regla se aplica en el servidor, no solo ocultando botones.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SEGURIDAD.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <div className="h-11 w-11 rounded-xl bg-accent/15 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-semibold text-white mb-1.5">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SOBRE EL PROYECTO ============ */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="rounded-3xl border border-border bg-surface p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/10" />
          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <SectionBadge>Sobre el proyecto</SectionBadge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-4 mb-4">
                Un proyecto académico con arquitectura real detrás
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Esta plataforma forma parte de un proyecto de tesis
                universitaria orientado a fortalecer las competencias
                digitales y el conocimiento de la legislación informática en
                Ecuador. Está dirigida a estudiantes que cursan la materia,
                docentes que guían su proceso, y administradores que
                gestionan el contenido institucional.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Más allá de la interfaz, el proyecto aporta una arquitectura
                modular (Clean Architecture), control de acceso basado en
                roles verificado en servidor, y un modelo de datos pensado
                para medir el progreso académico real del estudiante — la
                evidencia cuantitativa que sostiene la investigación.
              </p>
            </div>
            <div className="flex flex-col gap-4 justify-center">
              <div className="flex items-center gap-3 rounded-xl bg-background-secondary p-4">
                <BookOpen className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-foreground">8 módulos + biblioteca jurídica completa</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-background-secondary p-4">
                <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
                <span className="text-sm text-foreground">RBAC verificado en servidor, no solo visual</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-background-secondary p-4">
                <Users className="w-5 h-5 text-gold shrink-0" />
                <span className="text-sm text-foreground">Tutoría docente-estudiante con seguimiento real</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Empieza tu itinerario formativo
        </h2>
        <p className="text-muted-foreground mb-8">
          Regístrate gratis y comienza con el primer módulo hoy mismo.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/registro">
            <Button>
              Comenzar gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Ya tengo cuenta</Button>
          </Link>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-navy py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Plataforma de Legislación Informática — Proyecto académico, Ecuador.
          </span>
          <span className="text-xs text-slate-500">Next.js · Prisma · Supabase</span>
        </div>
      </footer>
    </main>
  );
}
