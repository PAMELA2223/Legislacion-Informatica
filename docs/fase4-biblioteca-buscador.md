# FASE 4 — BIBLIOTECA DIGITAL Y BUSCADOR INTELIGENTE
## Estado: ✅ Completa

## 1. Qué se construyó

| Requisito de la Fase 4 | Archivo(s) |
|---|---|
| Documentos oficiales (Constitución, LOPDP, COIP, Ley de Comercio Electrónico) | `prisma/seed.ts` (`DOCUMENTOS_BIBLIOTECA`) |
| Reglamentos y normativa relacionada | `CategoriaDocumento` incluye `REGLAMENTO` y `NORMATIVA` (listos para cargar contenido) |
| Buscador | `modules/search/*`, PostgreSQL Full-Text Search |
| Filtros | `app/(dashboard)/biblioteca/page.tsx` (filtro por categoría) |
| Favoritos | `Favorite` (Prisma), `api/biblioteca/[id]/favorito/route.ts` |
| Descargas | `api/biblioteca/[id]/descargar/route.ts`, contador `descargas` |
| PDF Viewer | `iframe` embebido en `app/(dashboard)/biblioteca/[id]/page.tsx` |
| Consulta por artículos | `LibraryArticle` (Prisma) + acordeón `<details>` en la vista de detalle |
| Buscador inteligente (10 criterios) | `modules/search/infrastructure/prisma-search.repository.ts` |

## 2. Arquitectura aplicada (Clean Architecture)

```
modules/library/
├── domain/            → LibraryDocument, LibraryArticle, LibraryRules
├── application/        → ListarDocumentosUseCase, ObtenerDocumentoUseCase,
│                          BuscarEnBibliotecaUseCase, AlternarFavoritoUseCase,
│                          RegistrarDescargaUseCase
├── infrastructure/     → PrismaLibraryRepository (Postgres FTS)
└── presentation/       → DocumentCard, DocumentActions

modules/search/
├── domain/             → ResultadoBusqueda, TipoResultadoBusqueda (extensible)
├── application/         → BuscarGlobalUseCase
├── infrastructure/      → PrismaSearchRepository
└── presentation/        → GlobalSearchBar
```

## 3. Buscador inteligente — cobertura actual y extensión futura

El contrato `ISearchRepository.buscarGlobal()` ya soporta, con los módulos
construidos hasta la Fase 4:

| Criterio (Fase 1, Sección 9) | Estado |
|---|---|
| Ley / Documento | ✅ Implementado (`library_documents`) |
| Artículo | ✅ Implementado (`library_articles`) |
| Palabra clave / Tema | ✅ Implementado (vía `to_tsvector`) |
| Módulo | ✅ Implementado (`courses`) |
| Delito | 🔜 Se agrega en Fase 6 (Casos Prácticos) |
| Caso práctico | 🔜 Se agrega en Fase 6 |
| Glosario | 🔜 Se agrega en Fase 8 (Gamificación y Foro) |
| Noticias | 🔜 Se agrega en Fase 8 |

El tipo `TipoResultadoBusqueda` ya incluye `CASO_PRACTICO`, `GLOSARIO` y
`NOTICIA` para que la interfaz de resultados no necesite cambios cuando esas
fases se construyan — solo se agregan las consultas correspondientes al
repositorio.

## 4. Implementación técnica del buscador (100% gratuita)

Se usa **PostgreSQL Full-Text Search** nativo (`to_tsvector` / `plainto_tsquery`
en español), sin ningún servicio de pago (Algolia, Elastic Cloud, etc.), tal
como se definió en el stack de la Fase 1. Para producción se recomienda crear
el índice GIN documentado en el código:

```sql
CREATE INDEX library_documents_fts_idx ON library_documents
USING GIN (to_tsvector('spanish', titulo || ' ' || contenido));

CREATE INDEX library_articles_fts_idx ON library_articles
USING GIN (to_tsvector('spanish', numero || ' ' || titulo || ' ' || texto));

CREATE INDEX courses_fts_idx ON courses
USING GIN (to_tsvector('spanish', titulo || ' ' || descripcion));
```

## 5. Datos de contenido (seed)

Se agregaron al seed los 4 documentos oficiales exigidos, cada uno con 2
artículos de ejemplo indexados individualmente ("consulta por artículos").
El PDF real de cada norma queda pendiente de carga editorial en Supabase
Storage (campo `archivoUrl`); mientras tanto la interfaz muestra "documento
PDF pendiente de cargar".

Para cargar el contenido: `npm run prisma:seed` (dentro de `apps/web`).

## 6. Verificación de errores / QA realizado

- ✅ Favoritos y descargas protegidos por sesión (401 si no autenticado)
- ✅ `notFound()` si el documento no existe
- ✅ Filtro por categoría vía query param, sin JavaScript adicional (server component)
- ✅ Búsqueda con longitud mínima de 2 caracteres para evitar consultas vacías costosas
- ⏳ Pendiente: índices GIN en producción (documentados, no aplicados aún vía migración)
- ⏳ Pendiente: carga real de PDFs (contenido editorial)

## 7. Checklist de cierre

- [x] Constitución, LOPDP, COIP y Ley de Comercio Electrónico cargadas
- [x] Categorías de Reglamento y Normativa relacionada disponibles
- [x] Buscador con Postgres Full-Text Search
- [x] Filtros por categoría
- [x] Favoritos (toggle persistente por usuario)
- [x] Descargas (contador persistente)
- [x] Visor de PDF embebido
- [x] Consulta por artículos
- [x] Buscador inteligente transversal (documento, artículo, módulo — extensible)
- [x] Rutas protegidas por middleware
- [x] Documentación técnica actualizada

**Pendiente tu aprobación para iniciar la Fase 5 (Evaluaciones).**
