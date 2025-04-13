import "dotenv/config";

import { closeDatabase } from "next-vibe/server/db";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

/**
 * Seed script for test database
 * This creates sample data for testing purposes
 */
export default async function seedTestDatabase(): Promise<void> {
  debugLogger("🌱 Seeding test database...");

  debugLogger("✅ Test database seeded successfully!");
}

seedTestDatabase()
  .catch((e) => {
    errorLogger("Error seeding database:", e);
    process.exit(1);
  })
  .finally(() => {
    void closeDatabase();
  })
  .catch((e) => {
    errorLogger("Error shutting down database:", e);
    process.exit(1);
  });
