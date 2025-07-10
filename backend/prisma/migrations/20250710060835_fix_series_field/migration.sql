/*
  Warnings:

  - You are about to drop the column `series` on the `TreinoExercicio` table. All the data in the column will be lost.
  - You are about to drop the column `tipoSerie` on the `TreinoExercicio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TreinoExercicio" DROP COLUMN "series",
DROP COLUMN "tipoSerie";

-- CreateTable
CREATE TABLE "Serie" (
    "id" SERIAL NOT NULL,
    "treinoExercicioId" INTEGER NOT NULL,
    "tipoSerie" TEXT NOT NULL,
    "carga" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,

    CONSTRAINT "Serie_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Serie" ADD CONSTRAINT "Serie_treinoExercicioId_fkey" FOREIGN KEY ("treinoExercicioId") REFERENCES "TreinoExercicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
