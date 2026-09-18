import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, EyeOff } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarVideosAdminUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";
import { Button } from "@/components/ui/button";

export default async function AdminVideosPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  const videos = await new ListarVideosAdminUseCase(repo).execute();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Videos</h1>
        <Link href="/admin/videos/nuevo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo video
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {videos.map((v) => (
          <div key={v.id} className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{v.titulo}</p>
                {!v.publicado && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground bg-foreground/5 rounded-full px-2 py-0.5">
                    <EyeOff className="w-3 h-3" />
                    Despublicado
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {v.categoria} · {v.fuente}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/videos/${v.id}`}
                className="rounded-lg p-2 text-muted-foreground hover:bg-background-secondary"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <DeleteButton url={`/api/admin/videos/${v.id}`} confirmMessage={`¿Eliminar el video "${v.titulo}"?`} />
            </div>
          </div>
        ))}
        {videos.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay videos.</p>}
      </div>
    </div>
  );
}
