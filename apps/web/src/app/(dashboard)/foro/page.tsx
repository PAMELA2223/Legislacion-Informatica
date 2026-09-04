import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaForumRepository } from "@/modules/forum/infrastructure/prisma-forum.repository";
import { ListarHilosUseCase } from "@/modules/forum/application/forum.use-cases";
import { ThreadCard } from "@/modules/forum/presentation/thread-card";
import { Button } from "@/components/ui/button";

export default async function ForoPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaForumRepository(prisma);
  const hilos = await new ListarHilosUseCase(repo).execute();

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-foreground">Foro académico</h1>
        <Link href="/foro/nuevo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo hilo
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Discute, pregunta y comparte con otros estudiantes.
      </p>

      <div className="flex flex-col gap-3">
        {hilos.map((hilo) => (
          <ThreadCard key={hilo.id} hilo={hilo} />
        ))}
        {hilos.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Todavía no hay hilos. ¡Sé el primero en crear uno!
          </p>
        )}
      </div>
    </main>
  );
}
