/*
  Warnings:

  - Added the required column `rate` to the `Finance` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Rate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rate" REAL NOT NULL
);
INSERT INTO "new_Rate" ("id", "rate") SELECT "id", "rate" FROM "Rate";
DROP TABLE "Rate";
ALTER TABLE "new_Rate" RENAME TO "Rate";
CREATE TABLE "new_Finance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" INTEGER NOT NULL,
    "createAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "desc" TEXT,
    "rate" INTEGER NOT NULL
);
INSERT INTO "new_Finance" ("createAt", "desc", "id", "type", "value") SELECT "createAt", "desc", "id", "type", "value" FROM "Finance";
DROP TABLE "Finance";
ALTER TABLE "new_Finance" RENAME TO "Finance";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
