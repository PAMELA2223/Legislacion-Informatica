// Límites de intentos para los endpoints de autenticación propios
// (/api/auth/registro y /api/auth/confirmar-cuenta).
//
// Se separan DOS conceptos que antes estaban mezclados en un único contador
// por IP:
//
//  1. Intentos de UNA PERSONA (clave = IP + correo): frena que alguien repita
//     una y otra vez el intento sobre la misma cuenta (fuerza bruta). El
//     bloqueo afecta solo a esa cuenta desde esa red; los compañeros siguen
//     entrando con normalidad.
//
//  2. Protección de la RED (clave = IP): techo anti-abuso para frenar la
//     creación masiva automatizada desde un mismo origen. En un laboratorio o
//     en la red de la universidad todos los estudiantes salen por la misma IP
//     pública, así que este techo se dimensiona para un aula completa y NO
//     actúa como contador de "personas que pueden entrar".
//
// Los registros viven en la memoria del proceso (en Vercel cada instancia
// lleva su propia cuenta): es una protección básica, no un límite global.

type Ventana = { maximo: number; ventanaMs: number };

const registros = new Map<string, number[]>();

function recientes(clave: string, ventanaMs: number, ahora: number): number[] {
  const lista = (registros.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);
  if (lista.length) registros.set(clave, lista);
  else registros.delete(clave);
  return lista;
}

/** Límite genérico por clave (ventana deslizante). Registra el intento si no supera el límite. */
export function superaLimite(clave: string, maximo: number, ventanaMs: number): boolean {
  const ahora = Date.now();
  const lista = recientes(clave, ventanaMs, ahora);
  if (lista.length >= maximo) return true;
  registros.set(clave, [...lista, ahora]);
  return false;
}

export const LIMITES_AUTH = {
  /** Intentos repetidos de una misma persona/cuenta. */
  porPersona: { maximo: 10, ventanaMs: 15 * 60 * 1000 } as Ventana,
  /** Techo anti-abuso por red (dimensionado para un aula completa que comparte IP). */
  porRed: { maximo: 300, ventanaMs: 60 * 60 * 1000 } as Ventana,
};

/**
 * ¿Debe rechazarse este intento? Comprueba primero los intentos de la propia
 * persona y después el techo de la red. Solo registra el intento si se permite,
 * para que un intento rechazado no consuma cupo de nadie.
 */
export function superaLimiteAuth(accion: string, ip: string, correo: unknown): boolean {
  const ahora = Date.now();
  const persona = typeof correo === "string" && correo.trim() ? correo.trim().toLowerCase() : "sin-correo";
  const clavePersona = `${accion}:persona:${ip}:${persona}`;
  const claveRed = `${accion}:red:${ip}`;
  const { porPersona, porRed } = LIMITES_AUTH;

  const intentosPersona = recientes(clavePersona, porPersona.ventanaMs, ahora);
  if (intentosPersona.length >= porPersona.maximo) return true;
  const intentosRed = recientes(claveRed, porRed.ventanaMs, ahora);
  if (intentosRed.length >= porRed.maximo) return true;

  registros.set(clavePersona, [...intentosPersona, ahora]);
  registros.set(claveRed, [...intentosRed, ahora]);
  return false;
}

/** Solo para pruebas. */
export function reiniciarLimites(): void {
  registros.clear();
}

export function ipDeLaPeticion(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "desconocida";
}
