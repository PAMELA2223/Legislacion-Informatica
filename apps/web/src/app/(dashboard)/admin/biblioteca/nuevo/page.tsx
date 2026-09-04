import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { LibraryDocumentForm } from "@/modules/admin/presentation/library-document-form";

export default async function NuevoDocumentoPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Nuevo documento</h1>
      <LibraryDocumentForm />
    </div>
  );
}
