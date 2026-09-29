import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, ExternalLink, Pencil, AlertTriangle, ClipboardList, Eye, EyeOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerCursoConLeccionesUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";
import { ActionButton } from "@/modules/admin/presentation/action-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const ETIQUETAS_TIPO: Record<string, string> = {
  VIDEO: "Video",
  PDF: "PDF",
  INFOGRAFIA: "Infografía",
  PODCAST: "Podcast",
  TEXTO: "Texto",
  LINEA_TIEMPO: "Línea de tiempo",
  MAPA_CONCEPTUAL: "Mapa conceptual",
  PRESENTACION: "Presentación",
};

export default async function AdminCursoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let curso;
  try {
    curso = await new ObtenerCursoConLeccionesUseCase(new PrismaAdminRepository(prisma)).execute(id);
  } catch {
    notFound();
  }

  const datosCurso = {
    titulo: curso.titulo,
    descripcion: curso.descripcion,
    resumen: curso.resumen,
    bibliografia: curso.bibliografia,
    propositoAcademico: curso.propositoAcademico,
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">
        <Link href="/admin/cursos" className="hover:underline">Módulos</Link> · Módulo {curso.numero}
      </p>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
        <h1 className="text-2xl font-bold text-foreground">{curso.titulo}</h1>
        <div className="flex items-center gap-2">
          <ActionButton
            url={`/api/admin/cursos/${curso.id}`}
            method="PUT"
            body={{ ...datosCurso, activo: !curso.activo }}
            className="inline-flex items-center gap-2 rounded-xl border border-border-strong px-3 py-2 text-sm text-foreground hover:bg-background-secondary"
          >
            {curso.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {curso.activo ? "Desactivar" : "Activar"}
          </ActionButton>
          <Link href={`/admin/cursos/${curso.id}/editar`}>
            <Button variant="outline">
              <Pencil className="w-4 h-4 mr-2" /> Editar información
            </Button>
          </Link>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{curso.descripcion}</p>
      <p className="text-xs mb-8">
        <span className={curso.activo ? "text-success" : "text-muted-foreground"}>
          {curso.activo ? "Activo — visible para los estudiantes" : "Inactivo — oculto para los estudiantes"}
        </span>
        {curso.activo && (
          <Link href={`/modulos/${curso.slug}`} className="ml-3 inline-flex items-center gap-1 text-primary hover:underline">
            Ver como estudiante <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </p>

      {/* ---------- Contenido y recursos ---------- */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-foreground">Contenido y recursos (lecciones)</h2>
        <Link href={`/admin/cursos/${curso.id}/lecciones/nueva`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Agregar lección
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2 mb-10">
        {curso.lecciones.map((l) => (
          <div
            key={l.id}
            className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1 mr-2">
                {ETIQUETAS_TIPO[l.tipo] ?? l.tipo}
              </span>
              <span className="text-sm text-foreground">{l.titulo}</span>
              {l.tipo === "TEXTO" ? null : l.urlRecurso ? (
                <a
                  href={l.urlRecurso}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Ver recurso <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="ml-2 text-xs text-red-400">Sin recurso cargado</span>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/admin/cursos/${curso.id}/lecciones/${l.id}`}
                className="text-sm text-primary hover:underline"
              >
                Editar
              </Link>
              <DeleteButton
                url={`/api/admin/lecciones/${l.id}`}
                confirmMessage={`¿Eliminar la lección "${l.titulo}"?`}
              />
            </div>
          </div>
        ))}
        {curso.lecciones.length === 0 && (
          <p className="flex items-center gap-2 text-sm text-amber-600">
            <AlertTriangle className="w-4 h-4" /> Este módulo todavía no tiene lecciones; no podrá activarse hasta tener contenido.
          </p>
        )}
      </div>

      {/* ---------- Evaluación del módulo ---------- */}
      <h2 className="font-semibold text-foreground mb-3">Evaluación del módulo</h2>
      <div className="rounded-2xl border border-border bg-surface p-5">
        {curso.evaluacion ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <ClipboardList className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{curso.evaluacion.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {curso.evaluacion.preguntasActivas} pregunta(s) activa(s) de {curso.evaluacion.totalPreguntas} ·{" "}
                  {curso.evaluacion.totalIntentos} intento(s) de estudiantes
                </p>
                {curso.evaluacion.preguntasActivas === 0 && (
                  <p className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Sin preguntas activas: los estudiantes no tendrán que rendirla.
                  </p>
                )}
              </div>
            </div>
            <Link href={`/admin/evaluaciones/${curso.evaluacion.id}`}>
              <Button>Gestionar preguntas</Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-muted-foreground">
              Este módulo aún no tiene evaluación. Créala para comprobar la comprensión del contenido.
            </p>
            <ActionButton
              url={`/api/admin/cursos/${curso.id}/evaluacion`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-2.5 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Crear evaluación
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}
