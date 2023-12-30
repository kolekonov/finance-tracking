/*
  Warnings:

  - You are about to alter the column `rate` on the `Rate` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

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
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
