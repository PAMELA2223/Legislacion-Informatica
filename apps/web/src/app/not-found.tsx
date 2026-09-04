import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export const metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return (
    <main
      id="contenido-principal"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background-secondary text-primary">
        <FileQuestion className="h-8 w-8" strokeWidth={2} aria-hidden="true" />
      </span>
      <h1 className="text-3xl font-bold text-foreground">Página no encontrada</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        La página que buscas no existe o fue movida. Verifica el enlace o vuelve
        al inicio.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-hover"
      >
        <Home className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        Volver al inicio
      </Link>
    </main>
  );
}
