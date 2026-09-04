import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaGlossaryRepository } from "@/modules/glossary/infrastructure/prisma-glossary.repository";
import { ListarTerminosUseCase } from "@/modules/glossary/application/glossary.use-cases";

export default async function GlosarioPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaGlossaryRepository(prisma);
  const terminos = await new ListarTerminosUseCase(repo).execute(q);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Glosario jurídico</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Términos legales y técnicos usados en la plataforma.
      </p>

      <form className="mb-8">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar un término..."
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </form>

      <div className="flex flex-col gap-3">
        {terminos.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-surface p-4">
            <p className="font-medium text-foreground">{t.termino}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.definicion}</p>
          </div>
        ))}
        {terminos.length === 0 && (
          <p className="text-sm text-muted-foreground">No se encontraron términos.</p>
        )}
      </div>
    </main>
  );
}
