import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, EyeOff } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarReferenciasInternacionalesAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";
import { Button } from "@/components/ui/button";

export default async function AdminReferenciasInternacionalesPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  const referencias = await new ListarReferenciasInternacionalesAdminUseCase(repo).execute();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Referencias internacionales</h1>
        <Link href="/admin/referencias-internacionales/nueva">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva referencia
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {referencias.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{r.titulo}</p>
                {!r.publicado && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground bg-foreground/5 rounded-full px-2 py-0.5">
                    <EyeOff className="w-3 h-3" />
                    Despublicada
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {r.organismo} · {r.tema}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/referencias-internacionales/${r.id}`}
                className="rounded-lg p-2 text-muted-foreground hover:bg-background-secondary"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <DeleteButton
                url={`/api/admin/referencias-internacionales/${r.id}`}
                confirmMessage={`¿Eliminar la referencia "${r.titulo}"?`}
              />
            </div>
          </div>
        ))}
        {referencias.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay referencias cargadas.</p>
        )}
      </div>
    </div>
  );
}
