-- CreateTable
CREATE TABLE "ChatState" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "step" TEXT NOT NULL,
    "treinoId" INTEGER,
    "exercicioTemp" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatState_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatState" ADD CONSTRAINT "ChatState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
