# Assets del proyecto

## Ya incluidos (placeholders generados)

Estos archivos ya están en `apps/web/public/` con un diseño simple basado
en la identidad visual (escudo + balanza de la justicia, paleta navy +
magenta/violeta). Funcionan perfectamente, pero son un **placeholder**:
reemplázalos cuando tengas el logo/ilustración definitivos del proyecto.

| Archivo | Tamaño | Usado en |
|---|---|---|
| `favicon.ico` | 16/32/48/64 px | Pestaña del navegador (`layout.tsx`) |
| `icon-192.png` | 192×192 | `manifest.ts` (PWA / Android) |
| `icon-512.png` | 512×512 | `manifest.ts` (PWA / Android, ícono grande) |

## Pendientes (opcionales)

| Archivo | Ubicación | Usado en |
|---|---|---|
| `og-image.png` (1200×630 recomendado) | `apps/web/public/og-image.png` | Opcional: agregar a `metadata.openGraph.images` en `layout.tsx` para que los enlaces compartidos en redes sociales muestren una imagen de vista previa |
| `login-illustration.png` (opcional) | `apps/web/public/images/login-illustration.png` | Solo si se decide reemplazar la ilustración SVG de `login-illustration.tsx` por una imagen ilustrada a mano |

Ninguno de estos dos es obligatorio para que `npm run build` funcione: si
faltan, el navegador simplemente no mostrará imagen de vista previa al
compartir, sin romper la aplicación.
