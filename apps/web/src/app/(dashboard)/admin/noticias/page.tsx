import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarNoticiasAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";
import { Button } from "@/components/ui/button";

export default async function AdminNoticiasPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  const noticias = await new ListarNoticiasAdminUseCase(repo).execute();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Noticias</h1>
        <Link href="/admin/noticias/nueva">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva noticia
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {noticias.map((n) => (
          <div key={n.id} className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{n.titulo}</p>
              <p className="text-xs text-muted-foreground">{n.fuente}</p>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/noticias/${n.id}`}
                className="rounded-lg p-2 text-muted-foreground hover:bg-background-secondary"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <DeleteButton url={`/api/admin/noticias/${n.id}`} confirmMessage={`¿Eliminar la noticia "${n.titulo}"?`} />
            </div>
          </div>
        ))}
        {noticias.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay noticias.</p>
        )}
      </div>
    </div>
  );
}
