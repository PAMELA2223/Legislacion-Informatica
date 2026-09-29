import { redirect } from "next/navigation";

// La categoría "Infografías" se eliminó del menú: las infografías se integran
// como recursos dentro de cada módulo (lecciones de tipo Infografía) y las
// más relevantes pueden mostrarse en "Lo más destacado".
export default function InfografiasPage() {
  redirect("/destacados");
}
