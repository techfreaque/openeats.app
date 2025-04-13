import { db } from "next-vibe/server/db";
import { registerSeed } from "next-vibe/server/db/seed-manager";
import { debugLogger } from "next-vibe/shared/utils/logger";

import type { NewMenuItem } from "./db";
import { menuItems } from "./db";

/**
 * Helper function to create menu item seed data
 */
function createMenuItemSeed(overrides?: Partial<NewMenuItem>): NewMenuItem {
  return {
    name: `Menu Item ${Math.floor(Math.random() * 1000)}`,
    description: `Delicious menu item with amazing flavors.`,
    price: `${(Math.random() * 20 + 5).toFixed(2)}`,
    imageUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/300/200`,
    isAvailable: true,
    restaurantId: "00000000-0000-0000-0000-000000000000", // Will be replaced with actual restaurant ID
    categoryId: "00000000-0000-0000-0000-000000000000", // Will be replaced with actual category ID
    ...overrides,
  };
}

/**
 * Development seed function for menu items module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding menu items data for development environment");

  const devMenuItems = [
    createMenuItemSeed({ 
      name: "Margherita Pizza", 
      description: "Classic pizza with tomato sauce, mozzarella, and basil",
      price: "12.99"
    }),
    createMenuItemSeed({ 
      name: "Cheeseburger", 
      description: "Juicy beef patty with cheese, lettuce, and tomato",
      price: "9.99"
    }),
    createMenuItemSeed({ 
      name: "California Roll", 
      description: "Fresh sushi roll with crab, avocado, and cucumber",
      price: "14.99"
    }),
    createMenuItemSeed({ 
      name: "Chicken Tacos", 
      description: "Soft tacos with grilled chicken, salsa, and guacamole",
      price: "8.99"
    }),
  ];

  const insertedMenuItems = await db
    .insert(menuItems)
    .values(devMenuItems)
    .onConflictDoNothing()
    .returning({ id: menuItems.id });

  debugLogger(`✅ Inserted ${insertedMenuItems.length} development menu items`);
}

/**
 * Test seed function for menu items module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding menu items data for test environment");

  const testMenuItems = [
    createMenuItemSeed({ 
      name: "Test Menu Item 1",
      price: "10.00"
    }),
    createMenuItemSeed({ 
      name: "Test Menu Item 2",
      price: "15.00"
    }),
  ];

  await db.insert(menuItems).values(testMenuItems).onConflictDoNothing();

  debugLogger("✅ Inserted test menu items");
}

/**
 * Production seed function for menu items module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding menu items data for production environment");

  const essentialMenuItems = [
    createMenuItemSeed({
      name: "Featured Menu Item",
      description: "Our featured menu item",
      price: "12.99",
      isAvailable: true,
    }),
  ];

  await db.insert(menuItems).values(essentialMenuItems).onConflictDoNothing();

  debugLogger("✅ Inserted essential production menu items");
}

registerSeed("menu-items", {
  dev: devSeed,
  test: testSeed,
  prod: prodSeed,
});
