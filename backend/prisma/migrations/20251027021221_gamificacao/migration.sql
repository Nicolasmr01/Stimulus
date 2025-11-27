-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nivel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "pontos" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Medalha" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "dataConquista" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Medalha_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Medalha" ADD CONSTRAINT "Medalha_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
