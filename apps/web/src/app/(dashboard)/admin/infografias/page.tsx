import Link from "next/link";
import { Plus, Pencil, ImageOff, Sparkles, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PrismaAdminRepository } from "@/modules/admin/infrastructure/prisma-admin.repository";
import { ListarInfografiasDeModulosUseCase } from "@/modules/admin/application/admin.use-cases";
import { DeleteButton } from "@/modules/admin/presentation/delete-button";
import { ActionButton } from "@/modules/admin/presentation/action-button";
import { AssociateInfographic } from "@/modules/admin/presentation/associate-infographic";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

// Infografías asociadas a los módulos. Cada infografía se muestra al
// estudiante DENTRO de su módulo (es un paso más del contenido).
export default async function AdminInfografiasPage() {
  const { modulos, sinModulo, incluidasPendientes } = await new ListarInfografiasDeModulosUseCase(
    new PrismaAdminRepository(prisma)
  ).execute();
  const opcionesModulos = modulos.map(({ id, numero, titulo }) => ({ id, numero, titulo }));

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground">Infografías de los módulos</h1>
        <Link href="/admin/infografias/agregar">
          <Button>
            <Plus className="w-4 h-4 mr-2" aria-hidden /> Agregar infografía
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Cada infografía se muestra al estudiante dentro de su módulo, junto al resto del contenido, y puede ampliarse
        para leer el texto con comodidad.
      </p>

      {incluidasPendientes > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="flex items-start gap-2 text-sm text-foreground">
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-primary" aria-hidden />
            La plataforma incluye {incluidasPendientes} infografía(s) diseñadas para sus módulos que aún no están vinculadas.
          </p>
          <ActionButton
            url="/api/admin/infografias/vincular-incluidas"
            successMessage="Se vincularon {n} infografía(s) a sus módulos."
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-2 text-sm font-medium shrink-0"
          >
            Vincular ahora
          </ActionButton>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {modulos.map((m) => (
          <section key={m.id} className="rounded-2xl border border-border bg-surface p-4" aria-label={`Módulo ${m.numero}`}>
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <p className="text-sm font-semibold text-foreground">
                Módulo {m.numero} · {m.titulo}
                {!m.activo && <span className="ml-2 text-xs font-normal text-muted-foreground">(inactivo)</span>}
              </p>
              <Link href={`/admin/infografias/agregar?modulo=${m.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                <Plus className="w-4 h-4" aria-hidden /> Agregar
              </Link>
            </div>
            {m.infografias.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin infografía.</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {m.infografias.map((inf) => (
                  <li key={inf.id} className="rounded-xl border border-border overflow-hidden flex flex-col">
                    <div className="aspect-[4/3] bg-background-secondary flex items-center justify-center">
                      {inf.urlImagen ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={inf.urlImagen} alt="" loading="lazy" className="h-full w-full object-contain" />
                      ) : (
                        <span className="flex flex-col items-center gap-1 text-xs text-amber-600 text-center px-2">
                          <AlertTriangle className="w-5 h-5" aria-hidden /> Sin imagen: el estudiante ve &quot;pendiente de cargar&quot;
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex items-start justify-between gap-2">
                      <p className="text-sm text-foreground line-clamp-2">{inf.titulo}</p>
                      <div className="flex items-center shrink-0">
                        <Link href={`/admin/infografias/modulos/${inf.id}`} aria-label="Editar" title="Editar" className="rounded-lg p-2 text-muted-foreground hover:bg-background-secondary">
                          <Pencil className="w-4 h-4" aria-hidden />
                        </Link>
                        <DeleteButton
                          url={`/api/admin/infografias/modulos/${inf.id}`}
                          titulo="¿Está seguro de que desea eliminar esta infografía?"
                          confirmMessage={`"${inf.titulo}" dejará de mostrarse en el módulo ${m.numero}.`}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
        {modulos.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay módulos.</p>}
      </div>

      {sinModulo.length > 0 && (
        <section className="mt-10" aria-labelledby="sin-modulo">
          <h2 id="sin-modulo" className="font-semibold text-foreground mb-1">Infografías sin módulo</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Provienen de la antigua sección &quot;Infografías&quot;. Asócialas a un módulo para que los estudiantes las vean
            dentro de él (el registro original se conserva).
          </p>
          <ul className="flex flex-col gap-2">
            {sinModulo.map((a) => (
              <li key={a.id} className="rounded-xl border border-border bg-surface p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    <ImageOff className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden /> {a.titulo}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{a.fuente} · {a.url}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <AssociateInfographic id={a.id} modulos={opcionesModulos} />
                  <Link href={`/admin/infografias/${a.id}`} className="text-sm text-primary hover:underline">Editar</Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
