import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarCasosAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";
import { ETIQUETAS_CATEGORIA_CASO } from "@/modules/case-studies/domain/case-study.entity";

export default async function AdminCasosPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  const casos = await new ListarCasosAdminUseCase(repo).execute();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Casos prácticos</h1>
      <p className="text-sm text-muted-foreground mb-8">
        La creación de nuevos casos (con sus 9 campos jurídicos) se gestiona
        por ahora vía el seed o Prisma Studio. Aquí puedes ver el uso y
        eliminar casos obsoletos.
      </p>

      <div className="flex flex-col gap-2">
        {casos.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{c.titulo}</p>
              <p className="text-xs text-muted-foreground">
                {ETIQUETAS_CATEGORIA_CASO[c.categoria as keyof typeof ETIQUETAS_CATEGORIA_CASO] ?? c.categoria} ·{" "}
                {c.totalIntentos} intento(s) registrados
              </p>
            </div>
            <DeleteButton
              url={`/api/admin/casos-practicos/${c.id}`}
              confirmMessage={`¿Eliminar el caso "${c.titulo}"?`}
            />
          </div>
        ))}
        {casos.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay casos prácticos.</p>
        )}
      </div>
    </div>
  );
}
