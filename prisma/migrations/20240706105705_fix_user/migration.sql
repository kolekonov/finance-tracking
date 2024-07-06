/*
  Warnings:

  - You are about to drop the column `value` on the `Message` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tgMessageId" INTEGER NOT NULL
);
INSERT INTO "new_Message" ("id", "tgMessageId") SELECT "id", "tgMessageId" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE UNIQUE INDEX "Message_tgMessageId_key" ON "Message"("tgMessageId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
