import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerDocumentoBibliotecaAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { LibraryDocumentForm } from "@/modules/admin/presentation/library-document-form";

export default async function EditarDocumentoBibliotecaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  let documento;
  try {
    documento = await new ObtenerDocumentoBibliotecaAdminUseCase(repo).execute(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Editar norma / documento</h1>
      <LibraryDocumentForm documento={documento} />
    </div>
  );
}
