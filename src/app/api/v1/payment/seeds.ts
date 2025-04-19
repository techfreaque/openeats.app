import { debugLogger } from "next-vibe/shared/utils/logger";

// Note: There's no specific payment table in the database
// Payment information is stored in the orders table

/**
 * Development seed function for payment module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding payment data for development environment");

  // Since there's no dedicated payment table, we're just setting up
  // payment-related configurations or default values if needed

  // For example, we could set up default payment provider configurations
  // or initialize payment-related settings

  // Add a dummy await to satisfy TypeScript
  await Promise.resolve();

  debugLogger("✅ Payment configuration completed for development");
}

/**
 * Test seed function for payment module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding payment data for test environment");

  // For testing, we might want to set up mock payment provider configurations
  // or initialize test payment settings

  // Add a dummy await to satisfy TypeScript
  await Promise.resolve();

  debugLogger("✅ Payment configuration completed for test environment");
}

/**
 * Production seed function for payment module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding payment data for production environment");

  // In production, we would set up real payment provider configurations
  // but we don't want to expose sensitive payment credentials in seeds

  // Add a dummy await to satisfy TypeScript
  await Promise.resolve();

  debugLogger("✅ Payment configuration completed for production environment");
}

// Export the seed functions directly
export const dev = devSeed;
export const test = testSeed;
export const prod = prodSeed;

// Also export as default for compatibility
const seeds = {
  dev,
  test,
  prod,
};

export default seeds;
