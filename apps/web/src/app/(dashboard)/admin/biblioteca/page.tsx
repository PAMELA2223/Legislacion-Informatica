import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarBibliotecaAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";
import { Button } from "@/components/ui/button";

export default async function AdminBibliotecaPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  const documentos = await new ListarBibliotecaAdminUseCase(repo).execute();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Biblioteca jurídica</h1>
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
              <p className="font-medium text-foreground">{d.titulo}</p>
              <p className="text-xs text-muted-foreground">{d.categoria}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Download className="w-3.5 h-3.5" />
                {d.descargas}
              </span>
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
        Nota: la edición de artículos individuales de un documento y la carga
        de archivos PDF se gestionan por ahora desde Prisma Studio
        (VER-BASE-DATOS.bat); este panel cubre la gestión básica del catálogo.
      </p>
    </div>
  );
}
