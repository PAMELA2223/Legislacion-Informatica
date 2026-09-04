import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarHilosForoAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";

export default async function AdminForoPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  const hilos = await new ListarHilosForoAdminUseCase(repo).execute();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Moderación del foro</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Elimina hilos que infrinjan las normas de la comunidad.
      </p>

      <div className="flex flex-col gap-2">
        {hilos.map((h) => (
          <div key={h.id} className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between">
            <div>
              <Link href={`/foro/${h.id}`} className="font-medium text-foreground hover:text-primary">
                {h.titulo}
              </Link>
              <p className="text-xs text-muted-foreground">
                Por {h.autorNombre} · {new Date(h.createdAt).toLocaleDateString("es-EC")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="w-3.5 h-3.5" />
                {h.totalPosts}
              </span>
              <DeleteButton
                url={`/api/admin/foro/hilos/${h.id}`}
                confirmMessage={`¿Eliminar el hilo "${h.titulo}" y todos sus comentarios?`}
              />
            </div>
          </div>
        ))}
        {hilos.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay hilos en el foro.</p>
        )}
      </div>
    </div>
  );
}
