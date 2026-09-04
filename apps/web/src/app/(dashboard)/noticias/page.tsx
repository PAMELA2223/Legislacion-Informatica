import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaNewsRepository } from "@/modules/news/infrastructure/prisma-news.repository";
import { ListarNoticiasUseCase } from "@/modules/news/application/news.use-cases";
import { NewsCard } from "@/modules/news/presentation/news-card";

export default async function NoticiasPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaNewsRepository(prisma);
  const noticias = await new ListarNoticiasUseCase(repo).execute();

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Noticias</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Actualidad sobre legislación informática y tecnología en Ecuador.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {noticias.map((n) => (
          <NewsCard key={n.id} noticia={n} />
        ))}
        {noticias.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">
            Todavía no hay noticias publicadas.
          </p>
        )}
      </div>
    </main>
  );
}
