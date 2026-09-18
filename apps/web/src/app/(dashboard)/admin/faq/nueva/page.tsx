import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { FaqForm } from "@/modules/admin/presentation/faq-form";

export default async function NuevaPreguntaFaqPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Nueva pregunta frecuente</h1>
      <FaqForm />
    </div>
  );
}
