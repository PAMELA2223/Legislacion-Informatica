import { redirect } from "next/navigation";
import { ExternalLink, Globe2 } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaInternationalReferenceRepository } from "@/modules/international-references/infrastructure/prisma-international-reference.repository";
import { ListarReferenciasInternacionalesPublicadasUseCase } from "@/modules/international-references/application/international-reference.use-cases";

export default async function ReferenciasInternacionalesPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaInternationalReferenceRepository(prisma);
  const referencias = await new ListarReferenciasInternacionalesPublicadasUseCase(repo).execute();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Normativa y referencias internacionales</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Instrumentos internacionales relacionados con protección de datos, ciberseguridad, comercio electrónico, firmas electrónicas y evidencia digital.
      </p>

      <div className="flex flex-col gap-4">
        {referencias.map((r) => (
          <article key={r.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2 mb-1">
              <Globe2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-semibold text-secondary bg-secondary/10 rounded-full px-2.5 py-1">
                {r.categoria}
              </span>
            </div>
            <h2 className="font-semibold text-foreground">{r.titulo}</h2>
            <p className="text-xs text-muted-foreground mb-2">
              {r.organismo} · {r.tema}
            </p>
            <p className="text-sm text-foreground mb-3">{r.resumen}</p>
            <a
              href={r.urlOficial}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Fuente oficial: {r.organismo}
            </a>
          </article>
        ))}
        {referencias.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay referencias publicadas.</p>
        )}
      </div>
    </main>
  );
}
