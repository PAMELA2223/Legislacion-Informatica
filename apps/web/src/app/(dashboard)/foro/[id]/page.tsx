import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaForumRepository } from "@/modules/forum/infrastructure/prisma-forum.repository";
import { ObtenerHiloUseCase } from "@/modules/forum/application/forum.use-cases";
import { PostItem } from "@/modules/forum/presentation/post-item";
import { NewPostForm } from "@/modules/forum/presentation/new-post-form";
import { ETIQUETAS_CATEGORIA_FORO } from "@/modules/forum/domain/forum.entity";

export default async function HiloDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaForumRepository(prisma);
  const useCase = new ObtenerHiloUseCase(repo);

  let hilo;
  try {
    hilo = await useCase.execute(id, user.id);
  } catch {
    notFound();
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">
        {ETIQUETAS_CATEGORIA_FORO[hilo.categoria]}
      </span>
      <h1 className="text-2xl font-bold text-foreground mt-3 mb-1">{hilo.titulo}</h1>
      <p className="text-xs text-muted-foreground mb-8">Por {hilo.autorNombre}</p>

      <div className="flex flex-col gap-3 mb-8">
        {hilo.posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
        {hilo.posts.length === 0 && (
          <p className="text-sm text-muted-foreground">Sé el primero en comentar.</p>
        )}
      </div>

      <NewPostForm threadId={hilo.id} />
    </main>
  );
}
