/*
  Warnings:

  - You are about to alter the column `close` on the `opening_times` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `open` on the `opening_times` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_opening_times" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "published" BOOLEAN NOT NULL,
    "day" TEXT NOT NULL,
    "open" INTEGER NOT NULL,
    "close" INTEGER NOT NULL,
    "validFrom" DATETIME,
    "validTo" DATETIME,
    "restaurantId" TEXT NOT NULL,
    CONSTRAINT "opening_times_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "partners" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_opening_times" ("close", "day", "id", "open", "published", "restaurantId", "validFrom", "validTo") SELECT "close", "day", "id", "open", "published", "restaurantId", "validFrom", "validTo" FROM "opening_times";
DROP TABLE "opening_times";
ALTER TABLE "new_opening_times" RENAME TO "opening_times";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
