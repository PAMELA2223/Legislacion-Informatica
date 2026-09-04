import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaGamificationRepository } from "@/modules/gamification/infrastructure/prisma-gamification.repository";
import { ObtenerInsigniasUseCase } from "@/modules/gamification/application/gamification.use-cases";
import { BadgeCard } from "@/modules/gamification/presentation/badge-card";

const ETIQUETAS_ROL: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
  INVITADO: "Invitado",
};

export default async function PerfilPage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) redirect("/login");

  // Fuente de verdad: la tabla de Prisma, no el metadata de Supabase Auth,
  // porque el XP/nivel se actualiza ahí (ver Fase 7 - gamificación básica).
  const user = await prisma.user.findUniqueOrThrow({ where: { id: authUser.id } });

  const gamRepo = new PrismaGamificationRepository(prisma);
  const insignias = await new ObtenerInsigniasUseCase(gamRepo).execute(authUser.id);

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-foreground mb-6">Mi perfil</h1>
      <div className="rounded-2xl border border-border bg-surface p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
            {user.nombre?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-semibold text-foreground">{user.nombre}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Rol</p>
            <p className="font-medium text-foreground">
              {ETIQUETAS_ROL[user.rol] ?? user.rol}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Nivel</p>
            <p className="font-medium text-foreground">{user.nivel}</p>
          </div>
          <div>
            <p className="text-muted-foreground">XP</p>
            <p className="font-medium text-foreground">{user.xp}</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-foreground mt-10 mb-4">Mis insignias</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {insignias.map((insignia) => (
          <BadgeCard key={insignia.id} insignia={insignia} />
        ))}
      </div>
    </main>
  );
}
