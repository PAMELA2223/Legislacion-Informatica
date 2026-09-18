import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerCasoJurisprudenciaAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { JurisprudenceForm } from "@/modules/admin/presentation/jurisprudence-form";

export default async function EditarCasoJurisprudenciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  let caso;
  try {
    caso = await new ObtenerCasoJurisprudenciaAdminUseCase(repo).execute(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Editar caso de jurisprudencia</h1>
      <JurisprudenceForm caso={caso} />
    </div>
  );
}
