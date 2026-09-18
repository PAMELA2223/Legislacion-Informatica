import { redirect } from "next/navigation";
import { PlayCircle, ExternalLink } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaVideoRepository } from "@/modules/videos/infrastructure/prisma-video.repository";
import { ListarVideosPublicadosUseCase } from "@/modules/videos/application/video.use-cases";

export default async function VideosPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaVideoRepository(prisma);
  const videos = await new ListarVideosPublicadosUseCase(repo).execute();

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Videos</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Recursos audiovisuales de fuentes institucionales y educativas sobre derecho informático, ciberseguridad y protección de datos.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((v) => (
          <a
            key={v.id}
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-2 hover:-translate-y-0.5 duration-200 hover:shadow-card-md transition-transform"
          >
            <div className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-primary shrink-0" />
              <span className="text-xs font-semibold text-secondary bg-secondary/10 rounded-full px-2.5 py-1">
                {v.categoria}
              </span>
            </div>
            <h3 className="font-semibold text-foreground">{v.titulo}</h3>
            <p className="text-sm text-muted-foreground">{v.descripcion}</p>
            <span className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <ExternalLink className="w-3.5 h-3.5" />
              {v.fuente}
            </span>
          </a>
        ))}
        {videos.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">Todavía no hay videos publicados.</p>
        )}
      </div>
    </main>
  );
}
