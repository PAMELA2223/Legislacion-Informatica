import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/modules/auth/presentation/login-form";
import { LoginVisualPanel } from "@/modules/auth/presentation/login-visual-panel";
import { LoginFeatures } from "@/modules/auth/presentation/login-features";
import { LoginBrand } from "@/modules/auth/presentation/login-brand";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full overflow-hidden bg-login-bg">
      <LoginVisualPanel />

      <div className="flex w-full flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:w-[52%] lg:px-14 xl:px-20">
        <div className="w-full max-w-md animate-login-fade-in-right motion-reduce:animate-none">
          {/* marca visible solo en pantallas sin panel visual (tablet/mobile) */}
          <div className="mb-6 lg:hidden">
            <LoginBrand compact />
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-login-border/60 bg-login-surface/80 p-6 shadow-login-card backdrop-blur-sm sm:p-8">
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-login-magenta/10" />

            <div className="relative flex flex-col items-center text-center">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-login-indigo/40 text-login-pink ring-1 ring-login-border">
                <ShieldCheck className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
              </span>
              <h1 className="text-2xl font-bold text-login-text">Bienvenido</h1>
              <p className="mt-1 text-sm text-login-text-secondary">
                Ingresa a tu cuenta para continuar
              </p>
            </div>

            <div className="relative my-6 h-px bg-login-border/50" />

            <div className="relative flex justify-center">
              <Suspense fallback={null}>
                <LoginForm />
              </Suspense>
            </div>

            <div className="relative mt-7">
              <LoginFeatures />
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-login-text-secondary/70">
            © {new Date().getFullYear()} Legislación Informática. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </main>
  );
}
