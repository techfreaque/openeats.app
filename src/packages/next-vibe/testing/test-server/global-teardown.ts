/**
 * Global teardown for all tests
 * This runs once after all tests complete
 */

import { debugLogger, errorLogger } from "next-vibe/shared";

import { db } from "@/app/api/db";

import { stopServer } from "./test-server";

export default async function teardown(): Promise<void> {
  try {
    debugLogger("Global teardown starting...");
    await db.$disconnect();
    await stopServer();
    debugLogger("Test server stopped successfully");
  } catch (error) {
    errorLogger("Error during test teardown:", error);
    // Attempt to force disconnect even if there's an error
    await db.$disconnect().catch(errorLogger);
    process.exit(1);
  }
}
