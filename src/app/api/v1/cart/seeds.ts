/**
 * Cart API seed data
 * This file provides seed data for testing and development
 */

import { nanoid } from "nanoid";
import { db } from "next-vibe/server/db";
import { registerSeed } from "next-vibe/server/db/seed-manager";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { cartItems, type NewCartItem } from "./db";

/**
 * Helper function to create cart item seed data
 * @param overrides - Optional overrides for the cart item
 * @returns A new cart item object
 */
function createCartItemSeed(overrides?: Partial<NewCartItem>): NewCartItem {
  const baseData: NewCartItem = {
    id: nanoid(),
    userId: "00000000-0000-0000-0000-000000000001", // Will be replaced with actual user ID
    menuItemId: "00000000-0000-0000-0000-000000000001", // Will be replaced with actual menu item ID
    partnerId: "00000000-0000-0000-0000-000000000001", // Will be replaced with actual partner ID
    quantity: 1,
    notes: "No special instructions",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  return baseData;
}

/**
 * Development seed function for cart module
 * @returns Promise that resolves when seeding is complete
 */
async function seedCartItemsDev(): Promise<void> {
  debugLogger("🌱 Seeding cart data for development environment");

  const devCartItems = [
    createCartItemSeed({
      userId: "dev-user-1",
      menuItemId: "dev-menu-item-1",
      partnerId: "dev-restaurant-1",
      quantity: 2,
      notes: "Extra sauce please",
    }),
    createCartItemSeed({
      userId: "dev-user-1",
      menuItemId: "dev-menu-item-2",
      partnerId: "dev-restaurant-1",
      quantity: 1,
      notes: "No onions",
    }),
    createCartItemSeed({
      userId: "dev-user-2",
      menuItemId: "dev-menu-item-3",
      partnerId: "dev-restaurant-2",
      quantity: 3,
      notes: "Well done",
    }),
  ];

  // Insert development cart items
  await db.insert(cartItems).values(devCartItems);

  debugLogger(`✅ Created ${devCartItems.length} development cart items`);
}

/**
 * Test seed function for cart module
 * @returns Promise that resolves when seeding is complete
 */
async function seedCartItemsTest(): Promise<void> {
  debugLogger("🌱 Seeding cart data for test environment");

  const testCartItems = [
    createCartItemSeed({
      userId: "test-user-1",
      menuItemId: "test-menu-item-1",
      partnerId: "test-restaurant-1",
      quantity: 1,
      notes: "Test Cart Item 1",
    }),
    createCartItemSeed({
      userId: "test-user-1",
      menuItemId: "test-menu-item-2",
      partnerId: "test-restaurant-1",
      quantity: 2,
      notes: "Test Cart Item 2",
    }),
  ];

  // Insert test cart items
  await db.insert(cartItems).values(testCartItems);

  debugLogger("✅ Created test cart items");
}

/**
 * Production seed function for cart module
 * @returns Promise that resolves when seeding is complete
 */
async function seedCartItemsProd(): Promise<void> {
  debugLogger("🌱 Seeding cart data for production environment");

  // No production seeds for cart items
  // This is just a placeholder
  debugLogger("✅ No production cart items needed");
}

// Register seeds with the seed manager
registerSeed("cart-items", {
  dev: seedCartItemsDev,
  test: seedCartItemsTest,
  prod: seedCartItemsProd,
});
