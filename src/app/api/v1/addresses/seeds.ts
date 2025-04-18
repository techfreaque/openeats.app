import { sql } from "drizzle-orm";
import { db } from "next-vibe/server/db";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { users } from "../auth/me/users.db";
import { addresses } from "./db";

/**
 * Development seed function for addresses module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding addresses data for development environment");

  // First, get some user IDs to associate addresses with
  const userIds = await db.select({ id: users.id }).from(users).limit(3);

  // If no users exist yet, log a warning and return
  if (userIds.length === 0) {
    debugLogger(
      "⚠️ No users found to associate addresses with, skipping address seeds",
    );
    return;
  }

  // Create sample addresses for development
  const devAddresses = [
    {
      userId: userIds[0]?.id,
      name: "Home Address",
      street: "Main Street",
      streetNumber: "123",
      zip: "10001",
      city: "New York",
      country: "DE" as const,
      latitude: "40.7128",
      longitude: "-74.0060",
      isDefault: true,
    },
    {
      userId: userIds[0]?.id,
      name: "Work Address",
      street: "Business Avenue",
      streetNumber: "456",
      zip: "10002",
      city: "New York",
      country: "DE" as const,
      latitude: "40.7112",
      longitude: "-74.0055",
      isDefault: false,
    },
    {
      userId: userIds.length > 1 ? userIds[1]?.id : userIds[0]?.id,
      name: "Apartment",
      street: "Park Boulevard",
      streetNumber: "789",
      zip: "10003",
      city: "New York",
      country: "DE" as const,
      latitude: "40.7135",
      longitude: "-74.0046",
      isDefault: true,
    },
  ].filter((addr) => addr.userId !== undefined) as any[];

  // Check if the addresses table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    const insertedAddresses = await db
      .insert(addresses)
      .values(devAddresses)
      .onConflictDoUpdate({
        target: [addresses.userId, addresses.name],
        set: {
          street: sql`excluded.street`,
          streetNumber: sql`excluded.street_number`,
          zip: sql`excluded.zip`,
          city: sql`excluded.city`,
          country: sql`excluded.country`,
          latitude: sql`excluded.latitude`,
          longitude: sql`excluded.longitude`,
          isDefault: sql`excluded.is_default`,
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: addresses.id });

    debugLogger(
      `✅ Inserted ${insertedAddresses.length} development addresses`,
    );
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if ((error as any)?.code === "42P01") {
      // relation does not exist
      debugLogger(
        "⚠️ Addresses table does not exist yet, skipping address seeds",
      );
    } else {
      // Re-throw other errors
      throw error;
    }
  }
}

/**
 * Test seed function for addresses module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding addresses data for test environment");

  // First, get some user IDs to associate addresses with
  const userIds = await db.select({ id: users.id }).from(users).limit(2);

  // If no users exist yet, log a warning and return
  if (userIds.length === 0) {
    debugLogger(
      "⚠️ No users found to associate addresses with, skipping address seeds",
    );
    return;
  }

  // Create sample addresses for testing
  const testAddresses = [
    {
      userId: userIds[0]?.id,
      name: "Test Address 1",
      street: "Test Street",
      streetNumber: "1",
      zip: "12345",
      city: "Test City",
      country: "DE" as const,
      latitude: "50.0000",
      longitude: "10.0000",
      isDefault: true,
    },
    {
      userId: userIds.length > 1 ? userIds[1]?.id : userIds[0]?.id,
      name: "Test Address 2",
      street: "Another Test Street",
      streetNumber: "2",
      zip: "54321",
      city: "Another Test City",
      country: "DE" as const,
      latitude: "51.0000",
      longitude: "11.0000",
      isDefault: true,
    },
  ].filter((addr) => addr.userId !== undefined) as any[];

  // Check if the addresses table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    await db
      .insert(addresses)
      .values(testAddresses)
      .onConflictDoUpdate({
        target: [addresses.userId, addresses.name],
        set: {
          street: sql`excluded.street`,
          streetNumber: sql`excluded.street_number`,
          zip: sql`excluded.zip`,
          city: sql`excluded.city`,
          country: sql`excluded.country`,
          latitude: sql`excluded.latitude`,
          longitude: sql`excluded.longitude`,
          isDefault: sql`excluded.is_default`,
          updatedAt: sql`now()`,
        },
      });

    debugLogger("✅ Inserted test addresses");
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if ((error as any)?.code === "42P01") {
      // relation does not exist
      debugLogger(
        "⚠️ Addresses table does not exist yet, skipping address seeds",
      );
    } else {
      // Re-throw other errors
      throw error;
    }
  }
}

/**
 * Production seed function for addresses module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding addresses data for production environment");

  // In production, we typically don't seed user addresses
  // as they should be created by users themselves
  // This is just a placeholder for any essential addresses that might be needed

  // Add a dummy await to satisfy TypeScript
  await Promise.resolve();

  debugLogger("✅ No production addresses needed, skipping");
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
