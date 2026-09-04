import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarLogsUseCase } from "@/modules/admin/application/admin.use-cases";

const ETIQUETAS_ACCION: Record<string, string> = {
  CREAR: "bg-success/10 text-success",
  EDITAR: "bg-accent/10 text-accent",
  ELIMINAR: "bg-red-50 text-red-600",
  CAMBIAR_ROL: "bg-primary/10 text-primary",
};

export default async function AdminLogsPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  const logs = await new ListarLogsUseCase(repo).execute(50);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Logs de auditoría</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Últimas 50 acciones administrativas registradas en la plataforma.
      </p>

      <div className="flex flex-col gap-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between"
          >
            <div>
              <span
                className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                  ETIQUETAS_ACCION[log.accion] ?? "bg-background-secondary text-muted-foreground"
                }`}
              >
                {log.accion}
              </span>
              <p className="text-sm text-foreground mt-1.5">
                <strong>{log.usuarioNombre}</strong> · {log.entidad}
                {log.detalle && <span className="text-muted-foreground"> — {log.detalle}</span>}
              </p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0 ml-4">
              {new Date(log.fecha).toLocaleString("es-EC")}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay acciones registradas.</p>
        )}
      </div>
    </div>
  );
}
