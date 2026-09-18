import { redirect } from "next/navigation";
import { ImageIcon, ExternalLink } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaInfographicRepository } from "@/modules/infographics/infrastructure/prisma-infographic.repository";
import { ListarInfografiasPublicadasUseCase } from "@/modules/infographics/application/infographic.use-cases";

export default async function InfografiasPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaInfographicRepository(prisma);
  const infografias = await new ListarInfografiasPublicadasUseCase(repo).execute();

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Infografías</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Recursos visuales de fuentes reales sobre protección de datos, ciberseguridad, derechos digitales y firma electrónica.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {infografias.map((i) => (
          <a
            key={i.id}
            href={i.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-2 hover:-translate-y-0.5 duration-200 hover:shadow-card-md transition-transform"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary shrink-0" />
              <span className="text-xs font-semibold text-secondary bg-secondary/10 rounded-full px-2.5 py-1">
                {i.categoria}
              </span>
            </div>
            <h3 className="font-semibold text-foreground">{i.titulo}</h3>
            <p className="text-sm text-muted-foreground">{i.descripcion}</p>
            <span className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <ExternalLink className="w-3.5 h-3.5" />
              {i.fuente}
            </span>
          </a>
        ))}
        {infografias.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">Todavía no hay infografías publicadas.</p>
        )}
      </div>
    </main>
  );
}
