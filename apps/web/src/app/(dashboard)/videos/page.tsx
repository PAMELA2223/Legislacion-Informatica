import { redirect } from "next/navigation";

// "Videos" fue reemplazada por "Lo más destacado". Se conserva la ruta para
// que los enlaces antiguos no queden rotos.
export default function VideosPage() {
  redirect("/destacados");
}
