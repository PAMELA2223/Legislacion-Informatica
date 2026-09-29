import Link from "next/link";
import { Plus, ArrowUp, ArrowDown, Pencil, AlertTriangle, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarCursosAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";
import { ActionButton } from "@/modules/admin/presentation/action-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const BTN_ICONO = "rounded-lg p-1.5 text-muted-foreground hover:bg-background-secondary";

export default async function AdminCursosPage() {
  const cursos = await new ListarCursosAdminUseCase(new PrismaAdminRepository(prisma)).execute();

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground">Módulos educativos</h1>
        <Link href="/admin/cursos/nuevo">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Nuevo módulo
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Los estudiantes recorren los módulos <strong>activos</strong> en este orden. Entra a un módulo para
        editar su contenido (lecciones, videos, infografías) y su evaluación.
      </p>

      <div className="rounded-2xl border border-border bg-surface overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="bg-background-secondary text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Orden</th>
              <th className="px-4 py-3 font-medium">Módulo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Lecciones</th>
              <th className="px-4 py-3 font-medium">Evaluación</th>
              <th className="px-4 py-3 font-medium">Inscritos</th>
              <th className="px-4 py-3 font-medium sr-only">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? "bg-surface" : "bg-background-secondary/40"}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="w-6 text-muted-foreground">{i + 1}</span>
                    {i > 0 && (
                      <ActionButton url={`/api/admin/cursos/${c.id}/orden`} body={{ direccion: "arriba" }} ariaLabel="Subir" className={BTN_ICONO}>
                        <ArrowUp className="w-3.5 h-3.5" />
                      </ActionButton>
                    )}
                    {i < cursos.length - 1 && (
                      <ActionButton url={`/api/admin/cursos/${c.id}/orden`} body={{ direccion: "abajo" }} ariaLabel="Bajar" className={BTN_ICONO}>
                        <ArrowDown className="w-3.5 h-3.5" />
                      </ActionButton>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  <Link href={`/admin/cursos/${c.id}`} className="hover:text-primary transition-colors">
                    {c.numero}. {c.titulo}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                      c.activo ? "bg-success/10 text-success" : "bg-foreground/5 text-muted-foreground"
                    }`}
                  >
                    {c.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.totalLecciones === 0 ? (
                    <span className="flex items-center gap-1 text-amber-600"><AlertTriangle className="w-3.5 h-3.5" /> Sin contenido</span>
                  ) : (
                    c.totalLecciones
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {!c.evaluacion ? (
                    <span className="flex items-center gap-1 text-amber-600"><AlertTriangle className="w-3.5 h-3.5" /> Sin evaluación</span>
                  ) : c.evaluacion.preguntasActivas === 0 ? (
                    <span className="flex items-center gap-1 text-amber-600"><AlertTriangle className="w-3.5 h-3.5" /> Sin preguntas</span>
                  ) : (
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> {c.evaluacion.preguntasActivas} preguntas</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.totalInscritos}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/cursos/${c.id}/editar`} aria-label="Editar" className={BTN_ICONO}>
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteButton
                      url={`/api/admin/cursos/${c.id}`}
                      confirmMessage={`¿Eliminar el módulo "${c.titulo}" con sus lecciones y su evaluación? Si hay estudiantes con progreso no se permitirá (desactívalo en su lugar).`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cursos.length === 0 && <p className="p-4 text-sm text-muted-foreground">Todavía no hay módulos.</p>}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Un módulo sin evaluación (o con evaluación sin preguntas activas) se completa solo revisando su contenido.
      </p>
    </div>
  );
}
