/* eslint-disable no-console */
/**
 * Global teardown for all tests
 * This runs once after all tests complete
 */

import { db } from "@/app/api/db";

import { stopServer } from "./test-server";

export default async function teardown(): Promise<void> {
  try {
    console.log("Global teardown starting...");
    await db.$disconnect();
    await stopServer();
    console.log("Test server stopped successfully");
  } catch (error) {
    console.error("Error during test teardown:", error);
    // Attempt to force disconnect even if there's an error
    await db.$disconnect().catch(console.error);
    process.exit(1);
  }
}
