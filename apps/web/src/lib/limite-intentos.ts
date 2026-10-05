// Límite simple de intentos por clave (por ejemplo, por IP). Vive en la
// memoria del proceso: en Vercel cada instancia lleva su propia cuenta, así
// que es una protección básica contra abusos, no un límite global estricto.
const registros = new Map<string, number[]>();

export function superaLimite(clave: string, maximo: number, ventanaMs: number): boolean {
  const ahora = Date.now();
  const recientes = (registros.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);
  if (recientes.length >= maximo) {
    registros.set(clave, recientes);
    return true;
  }
  recientes.push(ahora);
  registros.set(clave, recientes);
  return false;
}

export function ipDeLaPeticion(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "desconocida";
}
