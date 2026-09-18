import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { InternationalReferenceForm } from "@/modules/admin/presentation/international-reference-form";

export default async function NuevaReferenciaInternacionalPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Nueva referencia internacional</h1>
      <InternationalReferenceForm />
    </div>
  );
}
