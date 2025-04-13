import { db } from "next-vibe/server/db";
import { registerSeed } from "next-vibe/server/db/seed-manager";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { cartItems } from "./db";

/**
 * Helper function to create cart item seed data
 */
function createCartItemSeed(overrides?: Partial<any>): any {
  const baseData = {
    userId: "00000000-0000-0000-0000-000000000001", // Will be replaced with actual user ID
    menuItemId: "00000000-0000-0000-0000-000000000001", // Will be replaced with actual menu item ID
    partnerId: "00000000-0000-0000-0000-000000000001", // Will be replaced with actual partner ID
    quantity: 1,
    notes: "No special instructions",
    ...overrides,
  };
  
  return baseData;
}

/**
 * Development seed function for cart module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding cart data for development environment");

  const devCartItems = [
    createCartItemSeed({ 
      quantity: 2,
      notes: "Extra sauce please",
    }),
    createCartItemSeed({ 
      quantity: 1,
      notes: "No onions",
    }),
    createCartItemSeed({ 
      quantity: 3,
      notes: "Well done",
    }),
  ];

  debugLogger(`✅ Created ${devCartItems.length} development cart items`);
}

/**
 * Test seed function for cart module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding cart data for test environment");

  const testCartItems = [
    createCartItemSeed({ 
      quantity: 1,
      notes: "Test Cart Item 1",
    }),
    createCartItemSeed({ 
      quantity: 2,
      notes: "Test Cart Item 2",
    }),
  ];

  debugLogger("✅ Created test cart items");
}

/**
 * Production seed function for cart module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding cart data for production environment");

  const essentialCartItems = [
    createCartItemSeed({
      quantity: 1,
      notes: "Sample Cart Item",
    }),
  ];

  debugLogger("✅ Created essential production cart items");
}

registerSeed("cart", {
  dev: devSeed,
  test: testSeed,
  prod: prodSeed,
});
