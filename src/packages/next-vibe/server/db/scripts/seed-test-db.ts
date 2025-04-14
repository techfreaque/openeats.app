import "dotenv/config";

import { seedDatabase } from "../seed-manager";

/**
 * Seed script for test database
 * This creates sample data for testing purposes
 */
export async function seedTestDatabase(): Promise<void> {
  await seedDatabase("dev");
}
