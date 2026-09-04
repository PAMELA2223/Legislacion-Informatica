import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerTerminoGlosarioAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { GlossaryForm } from "@/modules/admin/presentation/glossary-form";

export default async function EditarTerminoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  let termino;
  try {
    termino = await new ObtenerTerminoGlosarioAdminUseCase(repo).execute(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Editar término</h1>
      <GlossaryForm termino={termino} />
    </div>
  );
}
