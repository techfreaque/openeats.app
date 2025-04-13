-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_drivers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "vehicle" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "radius" REAL NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "phone" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "streetNumber" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "ratingRecent" REAL NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "drivers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_drivers" ("city", "countryId", "createdAt", "id", "isActive", "latitude", "licensePlate", "longitude", "phone", "radius", "rating", "ratingCount", "street", "streetNumber", "updatedAt", "userId", "vehicle", "zip") SELECT "city", "countryId", "createdAt", "id", "isActive", "latitude", "licensePlate", "longitude", "phone", "radius", "rating", "ratingCount", "street", "streetNumber", "updatedAt", "userId", "vehicle", "zip" FROM "drivers";
DROP TABLE "drivers";
ALTER TABLE "new_drivers" RENAME TO "drivers";
CREATE UNIQUE INDEX "drivers_userId_key" ON "drivers"("userId");
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
    "ratingRecent" REAL NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "priceLevel" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "delivery" BOOLEAN NOT NULL,
    "pickup" BOOLEAN NOT NULL,
    "dineIn" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "countryId" TEXT NOT NULL,
    "mainCategoryId" TEXT NOT NULL,
    CONSTRAINT "partners_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_partners" ("city", "countryId", "createdAt", "delivery", "description", "dineIn", "email", "id", "image", "latitude", "longitude", "mainCategoryId", "name", "orderCount", "phone", "pickup", "priceLevel", "published", "rating", "ratingCount", "street", "streetNumber", "updatedAt", "verified", "zip") SELECT "city", "countryId", "createdAt", "delivery", "description", "dineIn", "email", "id", "image", "latitude", "longitude", "mainCategoryId", "name", "orderCount", "phone", "pickup", "priceLevel", "published", "rating", "ratingCount", "street", "streetNumber", "updatedAt", "verified", "zip" FROM "partners";
DROP TABLE "partners";
ALTER TABLE "new_partners" RENAME TO "partners";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
