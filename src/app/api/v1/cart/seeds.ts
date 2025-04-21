/**
 * Cart API seed data
 * This file provides seed data for testing and development
 */

import { sql } from "drizzle-orm";
import { db } from "next-vibe/server/db";
import { debugLogger } from "next-vibe/shared/utils/logger";
import { v4 as uuidv4 } from "uuid";

import { users } from "../auth/db";
import { menuItems } from "../menu/db";
import { cartItems } from "./db";

/**
 * Development seed function for cart module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding cart data for development environment");

  try {
    // First, check if the required tables exist
    // Try to get some user IDs, menu item IDs, and restaurant IDs to associate cart items with
    const userIds = await db.select({ id: users.id }).from(users).limit(3);
    const menuItemsData = await db
      .select({ id: menuItems.id, partnerId: menuItems.partnerId })
      .from(menuItems)
      .limit(5);

    // If no users or menu items exist yet, log a warning and return
    if (userIds.length === 0 || menuItemsData.length === 0) {
      debugLogger(
        "⚠️ No users or menu items found to associate cart items with, skipping cart seeds",
      );
      return;
    }
  } catch (error) {
    // If the table doesn't exist, log a warning and return
    if (error?.code === "42P01") { // relation does not exist
      debugLogger("⚠️ Menu items table does not exist yet, skipping cart seeds");
      return;
    } else {
      // Log other errors but continue
      debugLogger("⚠️ Error checking for required tables:", error);
      return;
    }
  }

  // Create sample cart items for development
  const devCartItems = [
    {
      id: uuidv4(),
      userId: userIds[0]?.id,
      menuItemId: menuItemsData[0]?.id,
      partnerId: menuItemsData[0]?.partnerId,
      quantity: 2,
      notes: "Extra cheese please",
    },
    {
      id: uuidv4(),
      userId: userIds[0]?.id,
      menuItemId:
        menuItemsData.length > 1 ? menuItemsData[1]?.id : menuItemsData[0]?.id,
      partnerId:
        menuItemsData.length > 1
          ? menuItemsData[1]?.partnerId
          : menuItemsData[0]?.partnerId,
      quantity: 1,
      notes: null,
    },
    {
      id: uuidv4(),
      userId: userIds.length > 1 ? userIds[1]?.id : userIds[0]?.id,
      menuItemId:
        menuItemsData.length > 2 ? menuItemsData[2]?.id : menuItemsData[0]?.id,
      partnerId:
        menuItemsData.length > 2
          ? menuItemsData[2]?.partnerId
          : menuItemsData[0]?.partnerId,
      quantity: 3,
      notes: "No onions",
    },
  ].filter(
    (item) =>
      item.userId !== undefined &&
      item.menuItemId !== undefined &&
      item.partnerId !== undefined,
  );

  // Check if the cart_items table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    const insertedCartItems = await db
      .insert(cartItems)
      .values(devCartItems)
      .onConflictDoUpdate({
        target: [cartItems.userId, cartItems.menuItemId],
        set: {
          quantity: sql`excluded.quantity`,
          notes: sql`excluded.notes`,
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: cartItems.id });

    debugLogger(
      `✅ Inserted ${insertedCartItems.length} development cart items`,
    );
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if (error?.code === "42P01") {
      // relation does not exist
      debugLogger(
        "⚠️ Cart items table does not exist yet, skipping cart seeds",
      );
    } else {
      // Re-throw other errors
      throw error;
    }
  }
}

/**
 * Test seed function for cart module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding cart data for test environment");

  // First, get some user IDs, menu item IDs, and restaurant IDs to associate cart items with
  const userIds = await db.select({ id: users.id }).from(users).limit(2);
  const menuItemsData = await db
    .select({ id: menuItems.id, partnerId: menuItems.partnerId })
    .from(menuItems)
    .limit(2);

  // If no users or menu items exist yet, log a warning and return
  if (userIds.length === 0 || menuItemsData.length === 0) {
    debugLogger(
      "⚠️ No users or menu items found to associate cart items with, skipping cart seeds",
    );
    return;
  }

  // Create sample cart items for testing
  const testCartItems = [
    {
      id: uuidv4(),
      userId: userIds[0]?.id,
      menuItemId: menuItemsData[0]?.id,
      partnerId: menuItemsData[0]?.partnerId,
      quantity: 1,
      notes: "Test note",
    },
    {
      id: uuidv4(),
      userId: userIds.length > 1 ? userIds[1]?.id : userIds[0]?.id,
      menuItemId:
        menuItemsData.length > 1 ? menuItemsData[1]?.id : menuItemsData[0]?.id,
      partnerId:
        menuItemsData.length > 1
          ? menuItemsData[1]?.partnerId
          : menuItemsData[0]?.partnerId,
      quantity: 2,
      notes: null,
    },
  ].filter(
    (item) =>
      item.userId !== undefined &&
      item.menuItemId !== undefined &&
      item.partnerId !== undefined,
  );

  // Check if the cart_items table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    await db
      .insert(cartItems)
      .values(testCartItems)
      .onConflictDoUpdate({
        target: [cartItems.userId, cartItems.menuItemId],
        set: {
          quantity: sql`excluded.quantity`,
          notes: sql`excluded.notes`,
          updatedAt: sql`now()`,
        },
      });

    debugLogger("✅ Inserted test cart items");
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if (error?.code === "42P01") {
      // relation does not exist
      debugLogger(
        "⚠️ Cart items table does not exist yet, skipping cart seeds",
      );
    } else {
      // Re-throw other errors
      throw error;
    }
  }
}

/**
 * Production seed function for cart module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding cart data for production environment");

  // In production, we don't seed cart items
  // as they should be created by users themselves

  // Add a dummy await to satisfy TypeScript
  await Promise.resolve();

  debugLogger("✅ No production cart items needed, skipping");
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
