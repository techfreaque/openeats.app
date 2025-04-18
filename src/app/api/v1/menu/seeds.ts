import { sql } from "drizzle-orm";
import { db } from "next-vibe/server/db";
import { debugLogger } from "next-vibe/shared/utils/logger";
import { v4 as uuidv4 } from "uuid";

import { categories } from "../category/db";
import { partners } from "../restaurant/db";
import { menuItems } from "./db";

/**
 * Development seed function for menu items module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding menu items data for development environment");
  
  // First, get some restaurant IDs and category IDs to associate menu items with
  const restaurantIds = await db.select({ id: partners.id }).from(partners).limit(3);
  const categoryIds = await db.select({ id: categories.id, name: categories.name }).from(categories).limit(5);
  
  // If no restaurants or categories exist yet, log a warning and return
  if (restaurantIds.length === 0 || categoryIds.length === 0) {
    debugLogger("⚠️ No restaurants or categories found to associate menu items with, skipping menu item seeds");
    return;
  }
  
  // Find pizza category ID if it exists
  const pizzaCategoryId = categoryIds.find(cat => cat.name === "Pizza")?.id || categoryIds[0]?.id;
  // Find burger category ID if it exists
  const burgerCategoryId = categoryIds.find(cat => cat.name === "Burgers")?.id || categoryIds[0]?.id;
  // Find sushi category ID if it exists
  const sushiCategoryId = categoryIds.find(cat => cat.name === "Sushi")?.id || categoryIds[0]?.id;
  
  // Create sample menu items for development
  const devMenuItems = [
    // Pizza restaurant menu items
    {
      id: uuidv4(),
      name: "Margherita Pizza",
      description: "Classic pizza with tomato sauce, mozzarella, and basil",
      price: "12.99",
      currency: "EUR",
      imageUrl: "https://example.com/images/margherita.jpg",
      isAvailable: true,
      published: true,
      taxPercent: "7",
      partnerId: restaurantIds[0]?.id,
      categoryId: pizzaCategoryId,
    },
    {
      id: uuidv4(),
      name: "Pepperoni Pizza",
      description: "Pizza with tomato sauce, mozzarella, and pepperoni",
      price: "14.99",
      currency: "EUR",
      imageUrl: "https://example.com/images/pepperoni.jpg",
      isAvailable: true,
      published: true,
      taxPercent: "7",
      partnerId: restaurantIds[0]?.id,
      categoryId: pizzaCategoryId,
    },
    // Burger restaurant menu items
    {
      id: uuidv4(),
      name: "Classic Cheeseburger",
      description: "Beef patty with cheddar cheese, lettuce, tomato, and special sauce",
      price: "9.99",
      currency: "EUR",
      imageUrl: "https://example.com/images/cheeseburger.jpg",
      isAvailable: true,
      published: true,
      taxPercent: "7",
      partnerId: restaurantIds.length > 1 ? restaurantIds[1]?.id : restaurantIds[0]?.id,
      categoryId: burgerCategoryId,
    },
    {
      id: uuidv4(),
      name: "Bacon Burger",
      description: "Beef patty with bacon, cheddar cheese, lettuce, tomato, and BBQ sauce",
      price: "11.99",
      currency: "EUR",
      imageUrl: "https://example.com/images/bacon-burger.jpg",
      isAvailable: true,
      published: true,
      taxPercent: "7",
      partnerId: restaurantIds.length > 1 ? restaurantIds[1]?.id : restaurantIds[0]?.id,
      categoryId: burgerCategoryId,
    },
    // Sushi restaurant menu items
    {
      id: uuidv4(),
      name: "California Roll",
      description: "Sushi roll with crab, avocado, and cucumber",
      price: "8.99",
      currency: "EUR",
      imageUrl: "https://example.com/images/california-roll.jpg",
      isAvailable: true,
      published: true,
      taxPercent: "7",
      partnerId: restaurantIds.length > 2 ? restaurantIds[2]?.id : restaurantIds[0]?.id,
      categoryId: sushiCategoryId,
    },
    {
      id: uuidv4(),
      name: "Salmon Nigiri",
      description: "Fresh salmon over pressed vinegared rice",
      price: "6.99",
      currency: "EUR",
      imageUrl: "https://example.com/images/salmon-nigiri.jpg",
      isAvailable: true,
      published: true,
      taxPercent: "7",
      partnerId: restaurantIds.length > 2 ? restaurantIds[2]?.id : restaurantIds[0]?.id,
      categoryId: sushiCategoryId,
    },
  ].filter(item => item.partnerId !== undefined && item.categoryId !== undefined) as any[];

  // Check if the menu_items table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    const insertedMenuItems = await db
      .insert(menuItems)
      .values(devMenuItems)
      .onConflictDoUpdate({
        target: [menuItems.name, menuItems.partnerId],
        set: {
          description: sql`excluded.description`,
          price: sql`excluded.price`,
          currency: sql`excluded.currency`,
          imageUrl: sql`excluded.image_url`,
          isAvailable: sql`excluded.is_available`,
          published: sql`excluded.published`,
          taxPercent: sql`excluded.tax_percent`,
          categoryId: sql`excluded.category_id`,
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: menuItems.id });

    debugLogger(`✅ Inserted ${insertedMenuItems.length} development menu items`);
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if ((error as any)?.code === '42P01') { // relation does not exist
      debugLogger("⚠️ Menu items table does not exist yet, skipping menu item seeds");
    } else {
      // Re-throw other errors
      throw error;
    }
  }
}

/**
 * Test seed function for menu items module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding menu items data for test environment");
  
  // First, get some restaurant IDs and category IDs to associate menu items with
  const restaurantIds = await db.select({ id: partners.id }).from(partners).limit(2);
  const categoryIds = await db.select({ id: categories.id }).from(categories).limit(2);
  
  // If no restaurants or categories exist yet, log a warning and return
  if (restaurantIds.length === 0 || categoryIds.length === 0) {
    debugLogger("⚠️ No restaurants or categories found to associate menu items with, skipping menu item seeds");
    return;
  }
  
  // Create sample menu items for testing
  const testMenuItems = [
    {
      id: uuidv4(),
      name: "Test Item 1",
      description: "Test menu item description 1",
      price: "9.99",
      currency: "EUR",
      isAvailable: true,
      published: true,
      taxPercent: "7",
      partnerId: restaurantIds[0]?.id,
      categoryId: categoryIds[0]?.id,
    },
    {
      id: uuidv4(),
      name: "Test Item 2",
      description: "Test menu item description 2",
      price: "14.99",
      currency: "EUR",
      isAvailable: true,
      published: true,
      taxPercent: "7",
      partnerId: restaurantIds.length > 1 ? restaurantIds[1]?.id : restaurantIds[0]?.id,
      categoryId: categoryIds.length > 1 ? categoryIds[1]?.id : categoryIds[0]?.id,
    },
  ].filter(item => item.partnerId !== undefined && item.categoryId !== undefined) as any[];

  // Check if the menu_items table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    await db
      .insert(menuItems)
      .values(testMenuItems)
      .onConflictDoUpdate({
        target: [menuItems.name, menuItems.partnerId],
        set: {
          description: sql`excluded.description`,
          price: sql`excluded.price`,
          currency: sql`excluded.currency`,
          isAvailable: sql`excluded.is_available`,
          published: sql`excluded.published`,
          taxPercent: sql`excluded.tax_percent`,
          categoryId: sql`excluded.category_id`,
          updatedAt: sql`now()`,
        },
      });

    debugLogger("✅ Inserted test menu items");
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if ((error as any)?.code === '42P01') { // relation does not exist
      debugLogger("⚠️ Menu items table does not exist yet, skipping menu item seeds");
    } else {
      // Re-throw other errors
      throw error;
    }
  }
}

/**
 * Production seed function for menu items module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding menu items data for production environment");
  
  // In production, we typically don't seed menu items
  // as they should be created by restaurant owners themselves
  // This is just a placeholder for any essential menu items that might be needed
  
  // Add a dummy await to satisfy TypeScript
  await Promise.resolve();
  
  debugLogger("✅ No production menu items needed, skipping");
}

// Export the seed functions directly
export const dev = devSeed;
export const test = testSeed;
export const prod = prodSeed;

// Also export as default for compatibility
const seeds = {
  dev,
  test,
  prod,
};

export default seeds;
