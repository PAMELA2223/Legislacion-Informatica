import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";
import { getAuthContext, rutaHomeDeRol } from "@/lib/authorization";
import { Button } from "@/components/ui/button";

export default async function AccesoDenegadoPage() {
  const ctx = await getAuthContext();

  // Si ni siquiera hay sesión válida (o es INVITADO), no tiene sentido
  // mostrar "tu panel" — se envía directo a iniciar sesión.
  if (!ctx) redirect("/login");

  const home = rutaHomeDeRol(ctx.rol);

  return (
    <main className="max-w-md mx-auto px-6 py-24 text-center">
      <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-xl font-bold text-foreground mb-2">Acceso denegado</h1>
      <p className="text-sm text-muted-foreground mb-8">
        No tienes permiso para ver esta sección con tu rol actual. Si crees
        que esto es un error, contacta a un administrador de la plataforma.
      </p>
      <Link href={home}>
        <Button>Volver a mi panel</Button>
      </Link>
    </main>
  );
}
