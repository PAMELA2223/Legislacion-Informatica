import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ExternalLink } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerCursoConLeccionesUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";
import { Button } from "@/components/ui/button";

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
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  const curso = await new ObtenerCursoConLeccionesUseCase(repo).execute(id);

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">Módulo {curso.numero}</p>
      <h1 className="text-2xl font-bold text-foreground mb-1">{curso.titulo}</h1>
      <p className="text-sm text-muted-foreground mb-8">{curso.descripcion}</p>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-foreground">Lecciones</h2>
        <Link href={`/admin/cursos/${curso.id}/lecciones/nueva`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Agregar lección
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
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
              {l.urlRecurso ? (
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
          <p className="text-sm text-muted-foreground">Este módulo todavía no tiene lecciones.</p>
        )}
      </div>
    </div>
  );
}
