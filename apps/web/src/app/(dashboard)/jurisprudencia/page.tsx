import { redirect } from "next/navigation";
import { ExternalLink, ShieldCheck, ShieldAlert } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaJurisprudenceRepository } from "@/modules/jurisprudence/infrastructure/prisma-jurisprudence.repository";
import { ListarJurisprudenciaPublicadaUseCase } from "@/modules/jurisprudence/application/jurisprudence.use-cases";
import { JurisprudenceRules } from "@/modules/jurisprudence/domain/jurisprudence.entity";

export default async function JurisprudenciaPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaJurisprudenceRepository(prisma);
  const casos = await new ListarJurisprudenciaPublicadaUseCase(repo).execute();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Jurisprudencia informática</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Casos y resoluciones relevantes para el derecho informático, con su fuente oficial cuando está disponible.
      </p>

      <div className="flex flex-col gap-4">
        {casos.map((caso) => {
          const confiable = JurisprudenceRules.esFuenteConfiable(caso);
          return (
            <article key={caso.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="font-semibold text-foreground">{caso.nombreCaso}</h2>
                {confiable ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Fuente verificada
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 shrink-0">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Requiere revisión administrativa
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {caso.pais} · {caso.anio} · {caso.tema}
              </p>

              <dl className="flex flex-col gap-3 text-sm">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground mb-0.5">Resumen</dt>
                  <dd className="text-foreground">{caso.resumen}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground mb-0.5">Problema jurídico</dt>
                  <dd className="text-foreground">{caso.problemaJuridico}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground mb-0.5">Decisión</dt>
                  <dd className="text-foreground">{caso.decision}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground mb-0.5">
                    Importancia para el derecho informático
                  </dt>
                  <dd className="text-foreground">{caso.importancia}</dd>
                </div>
              </dl>

              {confiable ? (
                <a
                  href={caso.enlaceOficial!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-4"
                >
                  <ExternalLink className="w-4 h-4" />
                  Fuente: {caso.fuenteOficial}
                </a>
              ) : (
                <p className="text-xs text-muted-foreground mt-4">Fuente citada: {caso.fuenteOficial}</p>
              )}
            </article>
          );
        })}
        {casos.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay casos publicados.</p>
        )}
      </div>
    </main>
  );
}
