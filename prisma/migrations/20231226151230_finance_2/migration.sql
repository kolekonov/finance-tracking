-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Finance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" INTEGER NOT NULL,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT
);
INSERT INTO "new_Finance" ("createAt", "id", "type", "value") SELECT "createAt", "id", "type", "value" FROM "Finance";
DROP TABLE "Finance";
ALTER TABLE "new_Finance" RENAME TO "Finance";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
