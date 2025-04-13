/**
 * Global setup for all tests
 * This runs once before all test files
 */

import { debugLogger, errorLogger } from "next-vibe/shared";

import { db } from "@/app/api/db";
import seedTestDatabase from "@/app/api/db/scripts/seed-dev-db";

import teardown from "./global-teardown";
import { startServer } from "./test-server";

export default async function setup() {
  try {
    await startServer();
    await seedTestDatabase();

    // Return a teardown function that will be run after all tests
    return async (): Promise<void> => {
      debugLogger("Global setup teardown function called");
      await teardown();
      // The actual teardown logic is in global-teardown.ts
    };
  } catch (error) {
    errorLogger("Error during test setup:", error);
    // Make sure to disconnect Prisma on error
    await db.$disconnect().catch(errorLogger);
    throw error;
  }
}
