import { sql } from "drizzle-orm";
import { db } from "next-vibe/server/db";
import { debugLogger } from "next-vibe/shared/utils/logger";
import { v4 as uuidv4 } from "uuid";

import { users } from "../auth/db";
import { menuItems } from "../menu/db";
import { partners } from "../restaurant/db";
import { orders } from "./order.db";
import { orderItems } from "./order-item.db";

/**
 * Development seed function for orders module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding orders data for development environment");

  // First, get some user IDs and restaurant IDs to associate orders with
  const userIds = await db.select({ id: users.id }).from(users).limit(3);
  const restaurantIds = await db
    .select({ id: partners.id })
    .from(partners)
    .limit(3);

  // If no users or restaurants exist yet, log a warning and return
  if (userIds.length === 0 || restaurantIds.length === 0) {
    debugLogger(
      "⚠️ No users or restaurants found to associate orders with, skipping order seeds",
    );
    return;
  }

  // Create sample orders for development
  const devOrders = [
    {
      id: uuidv4(),
      customerId: userIds[0]?.id,
      restaurantId: restaurantIds[0]?.id,
      status: "DELIVERED",
      paymentMethod: "CARD",
      message: "Please deliver to the back door",
      total: "35.99",
      deliveryFee: "3.99",
      driverTip: "5.00",
      restaurantTip: "3.00",
    },
    {
      id: uuidv4(),
      customerId: userIds[0]?.id,
      restaurantId:
        restaurantIds.length > 1 ? restaurantIds[1]?.id : restaurantIds[0]?.id,
      status: "PREPARING",
      paymentMethod: "ONLINE",
      message: null,
      total: "24.50",
      deliveryFee: "3.99",
      driverTip: "4.00",
      restaurantTip: "2.50",
    },
    {
      id: uuidv4(),
      customerId: userIds.length > 1 ? userIds[1]?.id : userIds[0]?.id,
      restaurantId:
        restaurantIds.length > 2 ? restaurantIds[2]?.id : restaurantIds[0]?.id,
      status: "NEW",
      paymentMethod: "CASH",
      message: "Extra napkins please",
      total: "42.75",
      deliveryFee: "3.99",
      driverTip: "0",
      restaurantTip: "0",
    },
  ].filter(
    (order) =>
      order.customerId !== undefined && order.restaurantId !== undefined,
  );

  // Check if the orders table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    const insertedOrders = await db
      .insert(orders)
      .values(devOrders)
      .onConflictDoUpdate({
        target: orders.id,
        set: {
          status: sql`excluded.status`,
          message: sql`excluded.message`,
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: orders.id });

    debugLogger(`✅ Inserted ${insertedOrders.length} development orders`);

    // Now add order items for each order
    if (insertedOrders.length > 0) {
      // Get menu items to associate with orders
      const menuItemsData = await db
        .select({
          id: menuItems.id,
          price: menuItems.price,
          taxPercent: menuItems.taxPercent,
          partnerId: menuItems.partnerId,
        })
        .from(menuItems)
        .limit(5);

      if (menuItemsData.length === 0) {
        debugLogger(
          "⚠️ No menu items found to associate with orders, skipping order items",
        );
        return;
      }

      // Create order items for each order
      const orderItemsData = [];

      for (const order of insertedOrders) {
        // Find menu items for this order's restaurant
        const restaurantId = devOrders.find(
          (o) => o.id === order.id,
        )?.restaurantId;
        const restaurantMenuItems = menuItemsData.filter(
          (item) => item.partnerId === restaurantId,
        );
        const menuItemsToUse =
          restaurantMenuItems.length > 0 ? restaurantMenuItems : menuItemsData;

        // Add 1-3 items to each order
        const numItems = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numItems && i < menuItemsToUse.length; i++) {
          orderItemsData.push({
            id: uuidv4(),
            orderId: order.id,
            menuItemId: menuItemsToUse[i]?.id,
            quantity: Math.floor(Math.random() * 3) + 1,
            price: menuItemsToUse[i]?.price || "10.00",
            taxPercent: menuItemsToUse[i]?.taxPercent || "7",
            currency: "EUR",
            message: i === 0 ? "No onions please" : null,
          });
        }
      }

      // Insert order items if we have any
      if (orderItemsData.length > 0) {
        try {
          const insertedOrderItems = await db
            .insert(orderItems)
            .values(orderItemsData)
            .onConflictDoUpdate({
              target: orderItems.id,
              set: {
                quantity: sql`excluded.quantity`,
                message: sql`excluded.message`,
                updatedAt: sql`now()`,
              },
            })
            .returning({ id: orderItems.id });

          debugLogger(
            `✅ Inserted ${insertedOrderItems.length} development order items`,
          );
        } catch (error) {
          // If the table doesn't exist, log a warning and continue
          if (error?.code === "42P01") {
            // relation does not exist
            debugLogger(
              "⚠️ Order items table does not exist yet, skipping order item seeds",
            );
          } else {
            // Re-throw other errors
            throw error;
          }
        }
      }
    }
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if (error?.code === "42P01") {
      // relation does not exist
      debugLogger("⚠️ Orders table does not exist yet, skipping order seeds");
    } else {
      // Re-throw other errors
      throw error;
    }
  }
}

/**
 * Test seed function for orders module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding orders data for test environment");

  // First, get some user IDs and restaurant IDs to associate orders with
  const userIds = await db.select({ id: users.id }).from(users).limit(2);
  const restaurantIds = await db
    .select({ id: partners.id })
    .from(partners)
    .limit(2);

  // If no users or restaurants exist yet, log a warning and return
  if (userIds.length === 0 || restaurantIds.length === 0) {
    debugLogger(
      "⚠️ No users or restaurants found to associate orders with, skipping order seeds",
    );
    return;
  }

  // Create sample orders for testing
  const testOrders = [
    {
      id: uuidv4(),
      customerId: userIds[0]?.id,
      restaurantId: restaurantIds[0]?.id,
      status: "DELIVERED",
      paymentMethod: "CARD",
      message: "Test order 1",
      total: "25.00",
      deliveryFee: "3.99",
      driverTip: "3.00",
      restaurantTip: "2.00",
    },
    {
      id: uuidv4(),
      customerId: userIds.length > 1 ? userIds[1]?.id : userIds[0]?.id,
      restaurantId:
        restaurantIds.length > 1 ? restaurantIds[1]?.id : restaurantIds[0]?.id,
      status: "NEW",
      paymentMethod: "CASH",
      message: "Test order 2",
      total: "18.50",
      deliveryFee: "3.99",
      driverTip: "0",
      restaurantTip: "0",
    },
  ].filter(
    (order) =>
      order.customerId !== undefined && order.restaurantId !== undefined,
  );

  // Check if the orders table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    await db
      .insert(orders)
      .values(testOrders)
      .onConflictDoUpdate({
        target: orders.id,
        set: {
          status: sql`excluded.status`,
          message: sql`excluded.message`,
          updatedAt: sql`now()`,
        },
      });

    debugLogger("✅ Inserted test orders");
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if (error?.code === "42P01") {
      // relation does not exist
      debugLogger("⚠️ Orders table does not exist yet, skipping order seeds");
    } else {
      // Re-throw other errors
      throw error;
    }
  }
}

/**
 * Production seed function for orders module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding orders data for production environment");

  // In production, we don't seed orders
  // as they should be created by users themselves

  // Add a dummy await to satisfy TypeScript
  await Promise.resolve();

  debugLogger("✅ No production orders needed, skipping");
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
