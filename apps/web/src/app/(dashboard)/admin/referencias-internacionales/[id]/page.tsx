import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerReferenciaInternacionalAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { InternationalReferenceForm } from "@/modules/admin/presentation/international-reference-form";

export default async function EditarReferenciaInternacionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  let referencia;
  try {
    referencia = await new ObtenerReferenciaInternacionalAdminUseCase(repo).execute(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Editar referencia internacional</h1>
      <InternationalReferenceForm referencia={referencia} />
    </div>
  );
}
