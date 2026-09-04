import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { GlossaryForm } from "@/modules/admin/presentation/glossary-form";

export default async function NuevoTerminoPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Nuevo término</h1>
      <GlossaryForm />
    </div>
  );
}
