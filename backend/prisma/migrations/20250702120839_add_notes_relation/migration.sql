-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_treinoId_fkey";

-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "treinoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_treinoId_fkey" FOREIGN KEY ("treinoId") REFERENCES "Treino"("id") ON DELETE SET NULL ON UPDATE CASCADE;
