import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { NewsForm } from "@/modules/admin/presentation/news-form";

export default async function NuevaNoticiaPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Nueva noticia</h1>
      <NewsForm />
    </div>
  );
}
