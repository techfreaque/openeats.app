/*
  Warnings:

  - Added the required column `isAvailable` to the `menu_items` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_menu_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "taxPercent" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "image" TEXT,
    "published" BOOLEAN NOT NULL,
    "isAvailable" BOOLEAN NOT NULL,
    "availableFrom" DATETIME,
    "availableTo" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    CONSTRAINT "menu_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "menu_items_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "partners" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_menu_items" ("availableFrom", "availableTo", "categoryId", "createdAt", "currency", "description", "id", "image", "name", "price", "published", "restaurantId", "taxPercent", "updatedAt") SELECT "availableFrom", "availableTo", "categoryId", "createdAt", "currency", "description", "id", "image", "name", "price", "published", "restaurantId", "taxPercent", "updatedAt" FROM "menu_items";
DROP TABLE "menu_items";
ALTER TABLE "new_menu_items" RENAME TO "menu_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
