import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerInfografiaAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { MediaResourceForm } from "@/modules/admin/presentation/media-resource-form";

export default async function EditarInfografiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  let infografia;
  try {
    infografia = await new ObtenerInfografiaAdminUseCase(repo).execute(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Editar infografía</h1>
      <MediaResourceForm
        recurso={infografia}
        apiBasePath="/api/admin/infografias"
        redirectPath="/admin/infografias"
        urlLabel="URL de la infografía (imagen, PDF o página oficial)"
        urlPlaceholder="https://..."
        fuenteLabel="Institución / organización de origen"
        crearLabel="Crear infografía"
      />
    </div>
  );
}
