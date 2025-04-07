/*
  Warnings:

  - You are about to alter the column `day` on the `opening_times` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `priceLevel` to the `partners` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_opening_times" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "published" BOOLEAN NOT NULL,
    "day" INTEGER NOT NULL,
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
CREATE TABLE "new_partners" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL,
    "description" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "streetNumber" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "priceLevel" INTEGER NOT NULL,
    "delivery" BOOLEAN NOT NULL,
    "pickup" BOOLEAN NOT NULL,
    "dineIn" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "countryId" TEXT NOT NULL,
    "mainCategoryId" TEXT NOT NULL,
    CONSTRAINT "partners_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_partners" ("city", "countryId", "createdAt", "delivery", "description", "dineIn", "email", "id", "image", "latitude", "longitude", "mainCategoryId", "name", "phone", "pickup", "published", "rating", "street", "streetNumber", "updatedAt", "zip") SELECT "city", "countryId", "createdAt", "delivery", "description", "dineIn", "email", "id", "image", "latitude", "longitude", "mainCategoryId", "name", "phone", "pickup", "published", "rating", "street", "streetNumber", "updatedAt", "zip" FROM "partners";
DROP TABLE "partners";
ALTER TABLE "new_partners" RENAME TO "partners";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
