import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarGlosarioAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";
import { Button } from "@/components/ui/button";

export default async function AdminGlosarioPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  const terminos = await new ListarGlosarioAdminUseCase(repo).execute();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Glosario jurídico</h1>
        <Link href="/admin/glosario/nuevo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo término
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {terminos.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{t.termino}</p>
              <p className="text-xs text-muted-foreground">{t.categoria}</p>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/glosario/${t.id}`}
                className="rounded-lg p-2 text-muted-foreground hover:bg-background-secondary"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <DeleteButton url={`/api/admin/glosario/${t.id}`} confirmMessage={`¿Eliminar el término "${t.termino}"?`} />
            </div>
          </div>
        ))}
        {terminos.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay términos.</p>
        )}
      </div>
    </div>
  );
}
