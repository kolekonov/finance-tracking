/*
  Warnings:

  - A unique constraint covering the columns `[tgMessageId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Message_tgMessageId_key" ON "Message"("tgMessageId");
