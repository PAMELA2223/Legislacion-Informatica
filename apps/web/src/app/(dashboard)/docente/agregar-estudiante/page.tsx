import { requireRole } from "@/lib/authorization";
import { StudentSearch } from "@/modules/tutoring/presentation/student-search";

export default async function AgregarEstudiantePage() {
  // Más estricto que el layout padre (que permite DOCENTE o ADMINISTRADOR):
  // solicitar tutoría es una acción exclusiva del docente, no del admin.
  await requireRole(["DOCENTE"]);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Agregar estudiante</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Busca un estudiante y solicita ser su tutor. Si no tiene otro tutor activo,
        la tutoría se activa de inmediato.
      </p>
      <StudentSearch />
    </main>
  );
}
