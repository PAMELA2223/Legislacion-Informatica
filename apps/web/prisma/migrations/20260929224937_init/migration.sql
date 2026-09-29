-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "evaluations" ADD COLUMN     "descripcion" TEXT;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "proceso_finalizado_en" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "featured_contents" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "imagen_url" TEXT,
    "fuente" TEXT,
    "course_id" TEXT,
    "origen" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "featured_contents_origen_key" ON "featured_contents"("origen");

-- AddForeignKey
ALTER TABLE "featured_contents" ADD CONSTRAINT "featured_contents_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
