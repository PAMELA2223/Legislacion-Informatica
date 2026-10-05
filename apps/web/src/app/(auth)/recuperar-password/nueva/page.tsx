import { NewPasswordForm } from "@/modules/auth/presentation/new-password-form";

// Destino del enlace que llega por correo al solicitar la recuperación de
// contraseña. Antes esta página no existía y el enlace terminaba en un error 404.
export default function NuevaPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-foreground mb-1">Crea una nueva contraseña</h1>
        <p className="text-sm text-muted-foreground mb-6">Escribe tu nueva contraseña para volver a ingresar a la plataforma.</p>
        <NewPasswordForm />
      </div>
    </main>
  );
}
