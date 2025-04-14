/**
 * Global setup for all tests
 * This runs once before all test files
 */

import { closeDatabase } from "../../server/db";
import { seedTestDatabase } from "../../server/db/scripts/seed-test-db";
import { debugLogger, errorLogger } from "../../shared/utils/logger";
import teardown from "./global-teardown";
import { startServer } from "./test-server";

export default async function setup() {
  try {
    await startServer();
    // Check if seedTestDatabase is a function before calling it
    if (typeof seedTestDatabase === "function") {
      await seedTestDatabase();
    }

    // Return a teardown function that will be run after all tests
    return async (): Promise<void> => {
      debugLogger("Global setup teardown function called");
      await teardown();
      // The actual teardown logic is in global-teardown.ts
    };
  } catch (error) {
    errorLogger("Error during test setup:", error);
    // Make sure to disconnect Prisma on error
    await closeDatabase().catch(errorLogger);
    throw error;
  }
}
