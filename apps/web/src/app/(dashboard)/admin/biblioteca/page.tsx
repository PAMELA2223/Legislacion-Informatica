import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Download } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarBibliotecaAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";
import { Button } from "@/components/ui/button";
import { EstadoNormaBadge } from "@/modules/library/presentation/estado-norma-badge";
import type { EstadoNorma } from "@/modules/library/domain/library.entity";

export default async function AdminBibliotecaPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  const documentos = await new ListarBibliotecaAdminUseCase(repo).execute();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Biblioteca jurídica y normas</h1>
        <Link href="/admin/biblioteca/nuevo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo documento
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {documentos.map((d) => (
          <div key={d.id} className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{d.titulo}</p>
                <EstadoNormaBadge estado={d.estado as EstadoNorma} />
              </div>
              <p className="text-xs text-muted-foreground">{d.categoria}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
                <Download className="w-3.5 h-3.5" />
                {d.descargas}
              </span>
              <Link
                href={`/admin/biblioteca/${d.id}`}
                className="rounded-lg p-2 text-muted-foreground hover:bg-background-secondary"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <DeleteButton
                url={`/api/admin/biblioteca/${d.id}`}
                confirmMessage={`¿Eliminar el documento "${d.titulo}"? Se eliminarán también sus artículos y favoritos asociados.`}
              />
            </div>
          </div>
        ))}
        {documentos.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay documentos.</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        Nota: la edición de artículos individuales de un documento se
        gestiona por ahora desde Prisma Studio (VER-BASE-DATOS.bat); este
        panel cubre el catálogo y la ficha de fuente oficial de cada norma.
      </p>
    </div>
  );
}
