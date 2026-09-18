import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { MediaResourceForm } from "@/modules/admin/presentation/media-resource-form";

export default async function NuevoVideoPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Nuevo video</h1>
      <MediaResourceForm
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
