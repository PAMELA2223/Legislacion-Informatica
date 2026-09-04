import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaNewsRepository } from "@/modules/news/infrastructure/prisma-news.repository";
import { ObtenerNoticiaUseCase } from "@/modules/news/application/news.use-cases";

export default async function NoticiaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaNewsRepository(prisma);
  const useCase = new ObtenerNoticiaUseCase(repo);

  let noticia;
  try {
    noticia = await useCase.execute(id);
  } catch {
    notFound();
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-xs text-muted-foreground mb-3">
        {noticia.fuente} ·{" "}
        {new Date(noticia.fechaPublicacion).toLocaleDateString("es-EC", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-6">{noticia.titulo}</h1>
      <p className="text-foreground leading-relaxed whitespace-pre-line">{noticia.contenido}</p>
    </main>
  );
}
