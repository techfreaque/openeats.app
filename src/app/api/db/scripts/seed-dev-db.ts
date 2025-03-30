import "dotenv/config";

import {
  debugLogger,
  errorLogger,
} from "next-query-portal/shared/utils/logger";

import { db } from "@/app/api/db";

import { createAdminUser } from "./utils";

/**
 * Seed script for test database
 * This creates sample data for testing purposes
 */
export default async function seedTestDatabase(): Promise<void> {
  debugLogger("🌱 Seeding test database...");

  await createAdminUser();

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
