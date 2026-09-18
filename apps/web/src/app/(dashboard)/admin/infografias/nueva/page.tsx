import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { MediaResourceForm } from "@/modules/admin/presentation/media-resource-form";

export default async function NuevaInfografiaPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Nueva infografía</h1>
      <MediaResourceForm
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
