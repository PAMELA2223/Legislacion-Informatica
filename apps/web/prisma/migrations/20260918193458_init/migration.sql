-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMINISTRADOR', 'ESTUDIANTE', 'INVITADO');

-- CreateEnum
CREATE TYPE "CategoriaForo" AS ENUM ('GENERAL', 'PROTECCION_DATOS', 'DELITOS_INFORMATICOS', 'COMERCIO_ELECTRONICO', 'ETICA_DIGITAL', 'DUDAS_MODULOS');

-- CreateEnum
CREATE TYPE "NivelDificultad" AS ENUM ('BASICO', 'INTERMEDIO', 'AVANZADO');

-- CreateEnum
CREATE TYPE "CategoriaCaso" AS ENUM ('PROTECCION_DATOS', 'DELITOS_INFORMATICOS', 'COMERCIO_ELECTRONICO', 'EVIDENCIA_DIGITAL');

-- CreateEnum
CREATE TYPE "EjeCompetencia" AS ENUM ('SEGURIDAD_DIGITAL', 'PROTECCION_DATOS', 'ASPECTOS_LEGALES', 'ETICA', 'CIUDADANIA_DIGITAL', 'USO_RESPONSABLE_INFORMACION');

-- CreateEnum
CREATE TYPE "TipoDiagnostico" AS ENUM ('INICIAL', 'FINAL');

-- CreateEnum
CREATE TYPE "TipoPregunta" AS ENUM ('VF', 'OPCION_MULTIPLE', 'RELACIONAR', 'COMPLETAR', 'CASO');

-- CreateEnum
CREATE TYPE "CategoriaDocumento" AS ENUM ('CONSTITUCION', 'LOPDP', 'COIP', 'COMERCIO_ELECTRONICO', 'REGLAMENTO', 'NORMATIVA');

-- CreateEnum
CREATE TYPE "EstadoNorma" AS ENUM ('VIGENTE', 'REFORMADA', 'DEROGADA');

-- CreateEnum
CREATE TYPE "TipoLeccion" AS ENUM ('VIDEO', 'PDF', 'INFOGRAFIA', 'TEXTO', 'PODCAST', 'LINEA_TIEMPO', 'MAPA_CONCEPTUAL', 'PRESENTACION');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'ESTUDIANTE',
    "avatar_url" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "detalle" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "criterio" TEXT NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges_earned" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_earned_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_threads" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" "CategoriaForo" NOT NULL DEFAULT 'GENERAL',
    "autor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_posts" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "autor_id" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_reactions" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "forum_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "glossary_terms" (
    "id" TEXT NOT NULL,
    "termino" TEXT NOT NULL,
    "definicion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "glossary_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_items" (
    "id" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "respuesta" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jurisprudence_cases" (
    "id" TEXT NOT NULL,
    "nombre_caso" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "tema" TEXT NOT NULL,
    "resumen" TEXT NOT NULL,
    "problema_juridico" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "importancia" TEXT NOT NULL,
    "fuente_oficial" TEXT NOT NULL,
    "enlace_oficial" TEXT,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jurisprudence_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_resources" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fuente" TEXT NOT NULL,
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infographics" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fuente" TEXT NOT NULL,
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "infographics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "international_references" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "organismo" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "resumen" TEXT NOT NULL,
    "url_oficial" TEXT NOT NULL,
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "international_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "resumen" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "fuente" TEXT NOT NULL,
    "fecha_publicacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_studies" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" "CategoriaCaso" NOT NULL,
    "escenario" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "normativa_aplicable" TEXT NOT NULL,
    "derechos_vulnerados" TEXT NOT NULL,
    "sanciones" TEXT NOT NULL,
    "actuacion_correcta" TEXT NOT NULL,
    "retroalimentacion_juridica" TEXT NOT NULL,
    "nivel_dificultad" "NivelDificultad" NOT NULL,
    "competencia_desarrollada" TEXT NOT NULL,
    "opciones" JSONB NOT NULL,
    "indice_correcto" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "case_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "case_study_id" TEXT NOT NULL,
    "correcta" BOOLEAN NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "self_assessment_questions" (
    "id" TEXT NOT NULL,
    "eje" "EjeCompetencia" NOT NULL,
    "enunciado" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "self_assessment_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "self_assessment_responses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "tipo" "TipoDiagnostico" NOT NULL,
    "valor" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "self_assessment_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "course_id" TEXT,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'modulo',
    "tiempo_limite" INTEGER NOT NULL DEFAULT 0,
    "orden" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "evaluation_id" TEXT NOT NULL,
    "tipo" "TipoPregunta" NOT NULL,
    "enunciado" TEXT NOT NULL,
    "opciones" JSONB,
    "respuesta_correcta" JSONB NOT NULL,
    "retroalimentacion" TEXT NOT NULL,
    "puntaje" INTEGER NOT NULL DEFAULT 1,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "evaluation_id" TEXT NOT NULL,
    "puntaje" INTEGER NOT NULL,
    "aprobado" BOOLEAN NOT NULL DEFAULT false,
    "respuestas" JSONB NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_documents" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" "CategoriaDocumento" NOT NULL,
    "archivo_url" TEXT,
    "tags" TEXT[],
    "contenido" TEXT NOT NULL,
    "descargas" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "numero_identificacion" TEXT,
    "pais" TEXT,
    "institucion_emisora" TEXT,
    "fecha_emision" TIMESTAMP(3),
    "fecha_reforma" TIMESTAMP(3),
    "estado" "EstadoNorma" NOT NULL DEFAULT 'VIGENTE',
    "fuente_oficial" TEXT,
    "enlace_oficial" TEXT,

    CONSTRAINT "library_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_articles" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "library_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "resumen" TEXT NOT NULL,
    "bibliografia" TEXT NOT NULL,
    "propositoAcademico" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "tipo" "TipoLeccion" NOT NULL,
    "titulo" TEXT NOT NULL,
    "url_recurso" TEXT,
    "contenido" TEXT,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "progreso" INTEGER NOT NULL DEFAULT 0,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "badges_earned_user_id_badge_id_key" ON "badges_earned"("user_id", "badge_id");

-- CreateIndex
CREATE UNIQUE INDEX "forum_reactions_post_id_user_id_key" ON "forum_reactions"("post_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "self_assessment_responses_user_id_question_id_tipo_key" ON "self_assessment_responses"("user_id", "question_id", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_document_id_key" ON "favorites"("user_id", "document_id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "courses_numero_key" ON "courses"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_user_id_course_id_key" ON "enrollments"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_user_id_lesson_id_key" ON "lesson_progress"("user_id", "lesson_id");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badges_earned" ADD CONSTRAINT "badges_earned_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badges_earned" ADD CONSTRAINT "badges_earned_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "forum_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_attempts" ADD CONSTRAINT "case_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_attempts" ADD CONSTRAINT "case_attempts_case_study_id_fkey" FOREIGN KEY ("case_study_id") REFERENCES "case_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "self_assessment_responses" ADD CONSTRAINT "self_assessment_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "self_assessment_responses" ADD CONSTRAINT "self_assessment_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "self_assessment_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_articles" ADD CONSTRAINT "library_articles_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "library_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "library_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
