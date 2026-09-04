import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { NewThreadForm } from "@/modules/forum/presentation/new-thread-form";

export default async function NuevoHiloPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-8">Nuevo hilo</h1>
      <NewThreadForm />
    </main>
  );
}
