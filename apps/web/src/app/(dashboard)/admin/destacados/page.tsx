import Link from "next/link";
import { Plus, Pencil, EyeOff, Eye, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PrismaFeaturedRepository } from "@/modules/featured/infrastructure/prisma-featured.repository";
import { ListarDestacadosAdminUseCase } from "@/modules/featured/application/featured.use-cases";
import { ETIQUETAS_TIPO_DESTACADO } from "@/modules/featured/domain/featured.entity";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";
import { ActionButton } from "@/modules/admin/presentation/action-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminDestacadosPage() {
  const items = await new ListarDestacadosAdminUseCase(new PrismaFeaturedRepository(prisma)).execute();
  const [videosAntiguos, infografiasAntiguas] = await Promise.all([prisma.videoResource.count(), prisma.infographic.count()]);
  const importados = items.filter((i) => i.origen).length;
  const pendientesImportar = Math.max(0, videosAntiguos + infografiasAntiguas - importados);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground">Lo más destacado</h1>
        <Link href="/admin/destacados/nuevo">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Nuevo destacado
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Contenidos que los estudiantes ven en la sección &quot;Lo más destacado&quot; (reemplaza a Videos e Infografías).
      </p>

      {pendientesImportar > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-foreground">
            Hay {pendientesImportar} video(s)/infografía(s) de las antiguas secciones que aún no están aquí.
          </p>
          <ActionButton
            url="/api/admin/destacados/importar"
            successMessage="Se importaron {n} recurso(s)."
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-2 text-sm font-medium"
          >
            <Download className="w-4 h-4" /> Importar
          </ActionButton>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {items.map((d) => (
          <div key={d.id} className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">
                  {ETIQUETAS_TIPO_DESTACADO[d.tipo] ?? d.tipo}
                </span>
                <p className="font-medium text-foreground">{d.titulo}</p>
                {!d.activo && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground bg-foreground/5 rounded-full px-2 py-0.5">
                    <EyeOff className="w-3 h-3" /> Inactivo
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Orden {d.orden}
                {d.cursoTitulo ? ` · ${d.cursoTitulo}` : ""}
                {d.fuente ? ` · ${d.fuente}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <ActionButton
                url={`/api/admin/destacados/${d.id}`}
                method="PUT"
                body={{ ...d, activo: !d.activo }}
                ariaLabel={d.activo ? "Desactivar" : "Activar"}
                className="rounded-lg p-2 text-muted-foreground hover:bg-background-secondary"
              >
                {d.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </ActionButton>
              <Link href={`/admin/destacados/${d.id}`} aria-label="Editar" className="rounded-lg p-2 text-muted-foreground hover:bg-background-secondary">
                <Pencil className="w-4 h-4" />
              </Link>
              <DeleteButton url={`/api/admin/destacados/${d.id}`} confirmMessage={`¿Eliminar "${d.titulo}" de destacados?`} />
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay contenidos destacados.</p>}
      </div>
    </div>
  );
}
