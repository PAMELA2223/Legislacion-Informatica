import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarUsuariosUseCase } from "@/modules/admin/application/admin.use-cases";
import { RoleSelect } from "@/modules/admin/presentation/role-select";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";

export default async function AdminUsuariosPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const repo = new PrismaAdminRepository(prisma);
  const usuarios = await new ListarUsuariosUseCase(repo).execute();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Usuarios y roles</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {usuarios.length} usuario(s) registrado(s) en la plataforma.
      </p>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-background-secondary text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">XP / Nivel</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, i) => (
              <tr
                key={u.id}
                className={i % 2 === 0 ? "bg-surface" : "bg-background-secondary/40"}
              >
                <td className="px-4 py-3 font-medium text-foreground">{u.nombre}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <RoleSelect userId={u.id} rolActual={u.rol} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {u.xp} XP · Nivel {u.nivel}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.id !== user.id && (
                    <DeleteButton
                      url={`/api/admin/usuarios/${u.id}`}
                      confirmMessage={`¿Eliminar a ${u.nombre}? Esta acción no se puede deshacer.`}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
