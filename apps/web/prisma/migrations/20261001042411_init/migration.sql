-- CreateTable
CREATE TABLE "chatbot_config" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fuentes" TEXT[] DEFAULT ARRAY['CONOCIMIENTO', 'LECCIONES', 'GLOSARIO', 'FAQ', 'BIBLIOTECA', 'CASOS']::TEXT[],
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_consultas" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modo" TEXT NOT NULL,
    "intencion" TEXT NOT NULL,
    "tema" TEXT,
    "con_informacion" BOOLEAN NOT NULL DEFAULT true,
    "contexto" TEXT,

    CONSTRAINT "chatbot_consultas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chatbot_consultas_fecha_idx" ON "chatbot_consultas"("fecha");

-- AddForeignKey
ALTER TABLE "chatbot_consultas" ADD CONSTRAINT "chatbot_consultas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
