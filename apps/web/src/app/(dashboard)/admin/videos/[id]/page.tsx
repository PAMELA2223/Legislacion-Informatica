import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ObtenerVideoAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { MediaResourceForm } from "@/modules/admin/presentation/media-resource-form";

export default async function EditarVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  let video;
  try {
    video = await new ObtenerVideoAdminUseCase(repo).execute(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Editar video</h1>
      <MediaResourceForm
        recurso={video}
        apiBasePath="/api/admin/videos"
        redirectPath="/admin/videos"
        urlLabel="URL del video (YouTube institucional/educativo, etc.)"
        urlPlaceholder="https://www.youtube.com/watch?v=..."
        fuenteLabel="Canal / institución de origen"
        crearLabel="Crear video"
      />
    </div>
  );
}
