import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerNoticiaAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { NewsForm } from "@/modules/admin/presentation/news-form";

export default async function EditarNoticiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  let noticia;
  try {
    noticia = await new ObtenerNoticiaAdminUseCase(repo).execute(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Editar noticia</h1>
      <NewsForm noticia={noticia} />
    </div>
  );
}
