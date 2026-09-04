import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rutas que requieren sesión iniciada
const RUTAS_PROTEGIDAS = [
  "/dashboard",
  "/perfil",
  "/admin",
  "/docente",
  "/modulos",
  "/biblioteca",
  "/buscar",
  "/evaluaciones",
  "/casos-practicos",
  "/autoevaluacion",
  "/ranking",
  "/retos",
  "/foro",
  "/glosario",
  "/noticias",
  "/mi-tutoria",
];
// Rutas que requieren, además, rol de administrador — verificado en las
// páginas (ver admin/layout.tsx), no aquí. Se deja esta lista solo como
// referencia de qué rutas existen con control de acceso adicional.

// NOTA IMPORTANTE: el middleware corre en el Edge Runtime y solo tiene
// acceso al JWT de sesión (Supabase Auth), no a Prisma. Por eso aquí SOLO
// se verifica que haya sesión iniciada. La verificación fina de ROL
// (admin/docente) se hace en cada página/layout consultando Prisma
// directamente, que es la fuente de verdad real del rol de un usuario
// (ver lib/get-authenticated-user.ts para el detalle de este diseño).

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const requiereSesion = RUTAS_PROTEGIDAS.some((r) => pathname.startsWith(r));

  if (requiereSesion && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/perfil/:path*",
    "/admin/:path*",
    "/docente/:path*",
    "/modulos/:path*",
    "/biblioteca/:path*",
    "/buscar/:path*",
    "/evaluaciones/:path*",
    "/casos-practicos/:path*",
    "/autoevaluacion/:path*",
    "/ranking/:path*",
    "/retos/:path*",
    "/foro/:path*",
    "/glosario/:path*",
    "/noticias/:path*",
    "/mi-tutoria/:path*",
  ],
};
