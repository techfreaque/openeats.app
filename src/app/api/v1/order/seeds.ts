import { registerSeed } from "next-vibe/server/db/seed-manager";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { type NewOrder } from "./db";

/**
 * Helper function to create order seed data
 */
function createOrderSeed(overrides?: Partial<NewOrder>): NewOrder {
  const baseData: NewOrder = {
    message: "Please deliver to the front door",
    status: "NEW",
    paymentMethod: "CARD",
    tax: "2.50",
    currency: "EUR",
    total: "25.99",
    deliveryFee: "3.99",
    driverTip: "2.00",
    restaurantTip: "3.00",
    projectTip: "1.00",
    customerId: "00000000-0000-0000-0000-000000000001", // Will be replaced with actual user ID
    restaurantId: "00000000-0000-0000-0000-000000000001", // Will be replaced with actual restaurant ID
    ...overrides,
  };

  return baseData;
}

/**
 * Development seed function for order module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding order data for development environment");

  const devOrders = [
    createOrderSeed({
      message: "Please deliver to the front door",
      total: "25.99",
    }),
    createOrderSeed({
      message: "Ring the doorbell when you arrive",
      total: "32.50",
      paymentMethod: "ONLINE",
    }),
    createOrderSeed({
      message: "Leave at the reception desk",
      total: "18.75",
      status: "DELIVERED",
    }),
    createOrderSeed({
      message: "Call when you're outside",
      total: "42.30",
      status: "PREPARING",
    }),
  ];

  debugLogger(`✅ Created ${devOrders.length} development orders`);
}

/**
 * Test seed function for order module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding order data for test environment");

  const testOrders = [
    createOrderSeed({
      message: "Test Order 1",
      total: "10.00",
      status: "NEW",
    }),
    createOrderSeed({
      message: "Test Order 2",
      total: "20.00",
      status: "DELIVERED",
    }),
  ];

  debugLogger("✅ Created test orders");
}

/**
 * Production seed function for order module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding order data for production environment");

  const essentialOrders = [
    createOrderSeed({
      message: "Sample Order",
      total: "25.00",
      status: "DELIVERED",
    }),
  ];

  debugLogger("✅ Created essential production orders");
}

registerSeed("order", {
  dev: devSeed,
  test: testSeed,
  prod: prodSeed,
});
