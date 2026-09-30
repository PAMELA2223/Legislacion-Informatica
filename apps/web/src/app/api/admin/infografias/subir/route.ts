import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/require-admin";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { TIPOS_IMAGEN_PERMITIDOS, TAMANO_MAXIMO_IMAGEN, validarArchivoImagen } from "@/modules/admin/domain/infographic";

// Sube la imagen de una infografía a Supabase Storage (bucket público
// "infografias") y devuelve su URL pública. El tipo de archivo se verifica
// por su contenido real (firma de bytes): solo PNG, JPG o WebP.
const BUCKET = "infografias";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const form = await request.formData().catch(() => null);
  const archivo = form?.get("archivo");
  if (!(archivo instanceof File)) return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });

  const bytes = new Uint8Array(await archivo.arrayBuffer());
  let tipo;
  try {
    tipo = validarArchivoImagen(archivo.size, bytes.subarray(0, 16));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Archivo no válido." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "La subida de imágenes no está configurada (falta SUPABASE_SERVICE_ROLE_KEY en el servidor). " +
          "Mientras tanto puedes pegar el enlace de una imagen ya publicada.",
      },
      { status: 503 }
    );
  }

  // Crear el bucket la primera vez (público: las imágenes se muestran a los estudiantes).
  const { data: bucket } = await supabase.storage.getBucket(BUCKET);
  if (!bucket) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: TAMANO_MAXIMO_IMAGEN,
      allowedMimeTypes: Object.keys(TIPOS_IMAGEN_PERMITIDOS),
    });
    if (error && !/already exists/i.test(error.message)) {
      console.error("[infografias] No se pudo crear el bucket:", error.message);
      return NextResponse.json({ error: "No se pudo preparar el almacenamiento de imágenes." }, { status: 500 });
    }
  }

  const ruta = `${new Date().getFullYear()}/${randomUUID()}.${TIPOS_IMAGEN_PERMITIDOS[tipo]}`;
  const { error } = await supabase.storage.from(BUCKET).upload(ruta, bytes, {
    contentType: tipo,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    console.error("[infografias] Error al subir:", error.message);
    return NextResponse.json({ error: "No se pudo subir la imagen. Inténtalo de nuevo." }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
  return NextResponse.json({ url: data.publicUrl });
}
