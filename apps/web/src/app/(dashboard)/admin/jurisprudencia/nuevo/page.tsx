import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { JurisprudenceForm } from "@/modules/admin/presentation/jurisprudence-form";

export default async function NuevoCasoJurisprudenciaPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Nuevo caso de jurisprudencia</h1>
      <JurisprudenceForm />
    </div>
  );
}
