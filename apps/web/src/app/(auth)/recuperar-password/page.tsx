import { ResetPasswordForm } from "@/modules/auth/presentation/reset-password-form";

export default function RecuperarPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Recupera tu contraseña
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Te enviaremos un enlace a tu correo para restablecerla.
        </p>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
