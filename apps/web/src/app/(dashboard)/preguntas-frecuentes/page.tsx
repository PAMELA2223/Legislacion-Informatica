import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaFaqRepository } from "@/modules/faq/infrastructure/prisma-faq.repository";
import { ListarFaqPublicadasUseCase, agruparPorCategoria } from "@/modules/faq/application/faq.use-cases";
import { FaqAccordion } from "@/modules/faq/presentation/faq-accordion";

export default async function PreguntasFrecuentesPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaFaqRepository(prisma);
  const preguntas = await new ListarFaqPublicadasUseCase(repo).execute();
  const grupos = agruparPorCategoria(preguntas);

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Preguntas frecuentes</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Respuestas rápidas sobre derecho informático, protección de datos,
        ciberseguridad, firma electrónica y más.
      </p>

      {preguntas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay preguntas publicadas.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {Array.from(grupos.entries()).map(([categoria, items]) => (
            <section key={categoria}>
              <h2 className="font-semibold text-foreground mb-3">{categoria}</h2>
              <FaqAccordion items={items} />
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
