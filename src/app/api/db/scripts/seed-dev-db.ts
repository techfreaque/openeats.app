import "dotenv/config";

import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { db } from "@/app/api/db";

import {
  createAddresses,
  createAdminUser,
  createBugReports,
  createCartItems,
  createCategories,
  createCodes,
  createCustomers,
  createDeliveries,
  createDriverRatings,
  createDrivers,
  createEarnings,
  createLikes,
  createMenuItems,
  createMessages,
  createOpeningTimes,
  createOrderItems,
  createOrders,
  createPartners,
  createRestaurantRatings,
  createRestaurantSiteContent,
  createSessions,
  createSubPrompts,
  createUIs,
} from "./utils";

/**
 * Seed script for test database
 * This creates sample data for testing purposes
 */
export default async function seedTestDatabase(): Promise<void> {
  debugLogger("🌱 Seeding test database...");

  // Base data
  await createCategories();

  // Users and related data
  await createAdminUser();
  await createCustomers();
  await createPartners();
  await createDrivers();

  // Related to users
  await createAddresses();
  await createSessions();

  // Restaurant related
  await createOpeningTimes();
  await createRestaurantSiteContent();
  await createMenuItems();

  // Orders and delivery
  await createCartItems();
  await createOrders();
  await createOrderItems();
  await createDeliveries();

  // Ratings and feedback
  await createRestaurantRatings();
  await createDriverRatings();
  await createMessages();
  await createEarnings();

  // UI builder related
  await createUIs();
  await createSubPrompts();
  await createCodes();
  await createLikes();

  // Other
  await createBugReports();

  debugLogger("✅ Test database seeded successfully!");
}

seedTestDatabase()
  .catch((e) => {
    errorLogger("Error seeding database:", e);
    process.exit(1);
  })
  .finally(() => {
    void db.$disconnect();
  })
  .catch((e) => {
    errorLogger("Error shutting down database:", e);
    process.exit(1);
  });
