import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, ShieldCheck, ShieldAlert, EyeOff } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarJurisprudenciaAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";
import { Button } from "@/components/ui/button";

export default async function AdminJurisprudenciaPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  const casos = await new ListarJurisprudenciaAdminUseCase(repo).execute();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Jurisprudencia informática</h1>
        <Link href="/admin/jurisprudencia/nuevo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo caso
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {casos.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-foreground">{c.nombreCaso}</p>
                {c.verificado ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verificado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Sin verificar
                  </span>
                )}
                {!c.publicado && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground bg-foreground/5 rounded-full px-2 py-0.5">
                    <EyeOff className="w-3 h-3" />
                    Despublicado
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {c.pais} · {c.anio} · {c.tema}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/jurisprudencia/${c.id}`}
                className="rounded-lg p-2 text-muted-foreground hover:bg-background-secondary"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <DeleteButton
                url={`/api/admin/jurisprudencia/${c.id}`}
                confirmMessage={`¿Eliminar el caso "${c.nombreCaso}"?`}
              />
            </div>
          </div>
        ))}
        {casos.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay casos cargados.</p>
        )}
      </div>
    </div>
  );
}
