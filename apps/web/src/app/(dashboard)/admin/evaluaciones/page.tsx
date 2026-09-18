import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarEvaluacionesAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";

export default async function AdminEvaluacionesPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  const evaluaciones = await new ListarEvaluacionesAdminUseCase(repo).execute();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Evaluaciones</h1>
      <p className="text-sm text-muted-foreground mb-8">
        La creación del banco de preguntas se gestiona por ahora vía el seed o
        Prisma Studio, dada la estructura de opciones/respuestas por tipo de
        pregunta. Aquí puedes ver el uso y eliminar evaluaciones obsoletas.
      </p>

      <div className="flex flex-col gap-2">
        {evaluaciones.map((e) => (
          <div key={e.id} className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{e.titulo}</p>
              <p className="text-xs text-muted-foreground">
                {e.totalPreguntas} pregunta(s) · {e.totalIntentos} intento(s) registrados
              </p>
            </div>
            <DeleteButton
              url={`/api/admin/evaluaciones/${e.id}`}
              confirmMessage={`¿Eliminar la evaluación "${e.titulo}"? Se perderán sus preguntas e intentos.`}
            />
          </div>
        ))}
        {evaluaciones.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay evaluaciones.</p>
        )}
      </div>
    </div>
  );
}
