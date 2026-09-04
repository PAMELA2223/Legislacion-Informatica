import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarCursosAdminUseCase } from "@/modules/admin/application/admin.use-cases";

export default async function AdminCursosPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  const cursos = await new ListarCursosAdminUseCase(repo).execute();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Módulos educativos</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Vista de solo lectura. La edición del contenido pedagógico (lecciones,
        videos, PDFs) se gestiona por ahora vía el seed o Prisma Studio, dada
        la estructura anidada de cada módulo.
      </p>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-background-secondary text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Módulo</th>
              <th className="px-4 py-3 font-medium">Lecciones</th>
              <th className="px-4 py-3 font-medium">Inscritos</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? "bg-surface" : "bg-background-secondary/40"}>
                <td className="px-4 py-3 font-medium text-foreground">
                  {c.numero}. {c.titulo}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.totalLecciones}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.totalInscritos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
