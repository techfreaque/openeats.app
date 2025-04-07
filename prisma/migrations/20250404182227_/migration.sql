-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_opening_times" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "published" BOOLEAN NOT NULL,
    "day" TEXT NOT NULL,
    "open" TEXT NOT NULL,
    "close" TEXT NOT NULL,
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
