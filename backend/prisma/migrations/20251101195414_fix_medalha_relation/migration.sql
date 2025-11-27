/*
  Warnings:

  - Added the required column `gamificacaoId` to the `Medalha` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Medalha" ADD COLUMN     "gamificacaoId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Gamificacao" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "pontos" INTEGER NOT NULL DEFAULT 0,
    "xpGanho" INTEGER NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "descricao" TEXT,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gamificacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Medalha" ADD CONSTRAINT "Medalha_gamificacaoId_fkey" FOREIGN KEY ("gamificacaoId") REFERENCES "Gamificacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gamificacao" ADD CONSTRAINT "Gamificacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
