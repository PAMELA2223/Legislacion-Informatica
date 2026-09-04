import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PrismaTutoringRepository } from "@/modules/tutoring/infrastructure/prisma-tutoring.repository";
import { ListarTodasLasTutoriasUseCase } from "@/modules/tutoring/application/tutoring-assignment.use-cases";
import { AdminTutoringActions } from "@/modules/tutoring/presentation/admin-tutoring-actions";
import { ETIQUETAS_ESTADO_TUTORIA, type EstadoTutoria } from "@/modules/tutoring/domain/tutoring.entity";

const ESTADOS: EstadoTutoria[] = ["PENDIENTE", "ACTIVA", "RECHAZADA", "FINALIZADA", "CANCELADA"];

const COLOR_ESTADO: Record<EstadoTutoria, string> = {
  PENDIENTE: "text-accent bg-accent/10",
  ACTIVA: "text-success bg-success/10",
  RECHAZADA: "text-red-600 bg-red-50",
  FINALIZADA: "text-muted-foreground bg-background-secondary",
  CANCELADA: "text-muted-foreground bg-background-secondary",
};

export default async function AdminTutoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;

  const repo = new PrismaTutoringRepository(prisma);
  const tutorias = await new ListarTodasLasTutoriasUseCase(repo).execute(estado as EstadoTutoria | undefined);
  const docentes = await prisma.user.findMany({
    where: { rol: "DOCENTE" },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Gestión de tutorías</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {tutorias.length} tutoría(s) {estado ? `en estado ${ETIQUETAS_ESTADO_TUTORIA[estado as EstadoTutoria]}` : "en total"}.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/admin/tutorias"
          className={`text-xs font-medium rounded-full px-3 py-1.5 border ${
            !estado ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"
          }`}
        >
          Todas
        </Link>
        {ESTADOS.map((e) => (
          <Link
            key={e}
            href={`/admin/tutorias?estado=${e}`}
            className={`text-xs font-medium rounded-full px-3 py-1.5 border ${
              estado === e ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"
            }`}
          >
            {ETIQUETAS_ESTADO_TUTORIA[e]}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {tutorias.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-surface p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${COLOR_ESTADO[t.estado]}`}>
                  {ETIQUETAS_ESTADO_TUTORIA[t.estado]}
                </span>
              </div>
              <p className="text-sm text-foreground">
                <strong>{t.docenteNombre}</strong> (docente) → <strong>{t.estudianteNombre}</strong> (estudiante)
              </p>
              <p className="text-xs text-muted-foreground">
                {t.estudianteEmail} · Solicitada: {new Date(t.fechaSolicitud).toLocaleDateString("es-EC")}
              </p>
            </div>
            <AdminTutoringActions assignmentId={t.id} estado={t.estado} docentes={docentes} />
          </div>
        ))}
        {tutorias.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay tutorías en este estado.</p>
        )}
      </div>
    </div>
  );
}
