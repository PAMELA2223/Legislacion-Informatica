import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaGamificationRepository } from "@/modules/gamification/infrastructure/prisma-gamification.repository";
import { ObtenerRankingUseCase } from "@/modules/gamification/application/gamification.use-cases";
import { RankingList } from "@/modules/gamification/presentation/ranking-list";

export default async function RankingPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaGamificationRepository(prisma);
  const ranking = await new ObtenerRankingUseCase(repo).execute(user.id, 10);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Ranking</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Los 10 estudiantes con más XP en la plataforma.
      </p>
      <RankingList ranking={ranking} />
    </main>
  );
}
