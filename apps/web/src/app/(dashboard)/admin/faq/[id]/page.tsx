import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerPreguntaFaqAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { FaqForm } from "@/modules/admin/presentation/faq-form";

export default async function EditarPreguntaFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  let pregunta;
  try {
    pregunta = await new ObtenerPreguntaFaqAdminUseCase(repo).execute(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Editar pregunta frecuente</h1>
      <FaqForm item={pregunta} />
    </div>
  );
}
