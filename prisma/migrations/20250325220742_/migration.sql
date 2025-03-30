/*
  Warnings:

  - Added the required column `paymentMethod` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "paymentMethod" TEXT NOT NULL,
    "tax" REAL NOT NULL,
    "total" REAL NOT NULL,
    "deliveryFee" REAL NOT NULL,
    "driverTip" REAL,
    "restaurantTip" REAL,
    "projectTip" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    CONSTRAINT "orders_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "partners" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("createdAt", "customerId", "deliveryFee", "driverTip", "id", "message", "projectTip", "restaurantId", "restaurantTip", "status", "tax", "total", "updatedAt") SELECT "createdAt", "customerId", "deliveryFee", "driverTip", "id", "message", "projectTip", "restaurantId", "restaurantTip", "status", "tax", "total", "updatedAt" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
