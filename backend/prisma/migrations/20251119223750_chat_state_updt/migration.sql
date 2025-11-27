/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `ChatState` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChatState_userId_key" ON "ChatState"("userId");
