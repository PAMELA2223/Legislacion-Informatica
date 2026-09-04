import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaGamificationRepository } from "@/modules/gamification/infrastructure/prisma-gamification.repository";
import { ObtenerRetosUseCase } from "@/modules/gamification/application/gamification.use-cases";
import { ChallengeCard } from "@/modules/gamification/presentation/challenge-card";

export default async function RetosPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaGamificationRepository(prisma);
  const retos = await new ObtenerRetosUseCase(repo).execute(user.id);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Retos</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Objetivos que puedes completar a tu propio ritmo para ganar XP e insignias.
      </p>
      <div className="flex flex-col gap-3">
        {retos.map((reto) => (
          <ChallengeCard key={reto.id} reto={reto} />
        ))}
      </div>
    </main>
  );
}
