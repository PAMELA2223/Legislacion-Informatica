import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center" role="status" aria-live="polite">
      <Loader2 className="h-6 w-6 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
