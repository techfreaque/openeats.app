/**
 * Global teardown for all tests
 * This runs once after all tests complete
 */

import { debugLogger, errorLogger } from "next-vibe/shared";

import { closeDatabase } from "next-vibe/server/db";

import { stopServer } from "./test-server";

export default async function teardown(): Promise<void> {
  try {
    debugLogger("Global teardown starting...");
    await closeDatabase();
    await stopServer();
    debugLogger("Test server stopped successfully");
  } catch (error) {
    errorLogger("Error during test teardown:", error);
    // Attempt to force disconnect even if there's an error
    await closeDatabase().catch(errorLogger);
    process.exit(1);
  }
}
