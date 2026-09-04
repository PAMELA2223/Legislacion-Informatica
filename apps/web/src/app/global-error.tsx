"use client";

/**
 * global-error.tsx captura errores en el propio RootLayout (raíz de la
 * app). Debe definir su propio <html>/<body> porque reemplaza el layout
 * raíz por completo. Es un caso extremo (poco frecuente); se mantiene
 * minimalista y sin dependencias externas a propósito.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          textAlign: "center",
          padding: "1.5rem",
          background: "#070B2A",
          color: "#F8FAFC",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Error crítico</h1>
        <p style={{ maxWidth: 420, fontSize: "0.9rem", color: "#CBD5E1" }}>
          Ocurrió un error inesperado y la aplicación no pudo cargarse.
        </p>
        <button
          onClick={reset}
          style={{
            borderRadius: "0.75rem",
            padding: "0.6rem 1.25rem",
            background: "linear-gradient(to right, #D946EF, #EC4899)",
            color: "white",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Intentar de nuevo
        </button>
      </body>
    </html>
  );
}
