/*
  Warnings:

  - Made the column `type` on table `Finance` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Finance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" INTEGER NOT NULL,
    "createAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "desc" TEXT
);
INSERT INTO "new_Finance" ("createAt", "desc", "id", "type", "value") SELECT "createAt", "desc", "id", "type", "value" FROM "Finance";
DROP TABLE "Finance";
ALTER TABLE "new_Finance" RENAME TO "Finance";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
