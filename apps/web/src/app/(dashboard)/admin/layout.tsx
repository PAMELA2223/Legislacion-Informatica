import { requireRole } from "@/lib/authorization";

// Protege TODO /admin/* (incluye páginas anidadas que no tienen su propio
// chequeo, como /admin/tutorias) — el layout de Next.js envuelve a todos
// sus hijos, así que un solo chequeo aquí basta para toda la subárea.
//
// El sidebar de navegación de /admin ya no vive aquí: el layout raíz
// (dashboard)/layout.tsx ahora renderiza un único AppSidebar para los 3
// roles autenticados (con el contenido de administración cuando el rol es
// ADMINISTRADOR) — se evita así tener dos sidebars superpuestos.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["ADMINISTRADOR"]);

  return <div className="max-w-6xl mx-auto px-6 py-12">{children}</div>;
}
