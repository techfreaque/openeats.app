/* eslint-disable no-console */
/**
 * Global teardown for all tests
 * This runs once after all tests complete
 */
import { PrismaClient } from "@prisma/client";

import { stopServer } from "./test-server";

const prisma = new PrismaClient();

export default async function teardown(): Promise<void> {
  try {
    console.log("Global teardown starting...");
    await prisma.$disconnect();
    await stopServer();
    console.log("Test server stopped successfully");
  } catch (error) {
    console.error("Error during test teardown:", error);
    // Attempt to force disconnect even if there's an error
    await prisma.$disconnect().catch(console.error);
    process.exit(1);
  }
}
