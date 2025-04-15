import { db } from "next-vibe/server/db";
import { registerSeed } from "next-vibe/server/db/seed-manager";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { type NewUser, users } from "./db";

/**
 * Helper function to create user seed data
 */
function createUserSeed(overrides?: Partial<NewUser>): NewUser {
  return {
    email: `user${Math.floor(Math.random() * 1000)}@example.com`,
    password: "$2b$10$dRFLSkYedQ05sqMs3b2pcOyTXHqMX2f4z4BCyAihIW/EM5YUmwigy", // hashed "password123"
    firstName: `User${Math.floor(Math.random() * 1000)}`,
    lastName: `LastName${Math.floor(Math.random() * 1000)}`,
    imageUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/200/200`,
    ...overrides,
  };
}

/**
 * Development seed function for user module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding user data for development environment");

  const adminUser = createUserSeed({
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
  });

  const demoUser = createUserSeed({
    email: "demo@example.com",
    firstName: "Demo",
    lastName: "User",
  });

  const regularUsers = [
    createUserSeed({
      email: "user1@example.com",
      firstName: "Regular",
      lastName: "User1",
    }),
    createUserSeed({
      email: "user2@example.com",
      firstName: "Regular",
      lastName: "User2",
    }),
  ];

  const allUsers = [adminUser, demoUser, ...regularUsers];

  const insertedUsers = await db
    .insert(users)
    .values(allUsers)
    .onConflictDoNothing()
    .returning({ id: users.id });

  debugLogger(`✅ Inserted ${insertedUsers.length} development users`);
}

/**
 * Test seed function for user module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding user data for test environment");

  const testUsers = [
    createUserSeed({
      email: "test1@example.com",
      firstName: "Test",
      lastName: "User1",
    }),
    createUserSeed({
      email: "test2@example.com",
      firstName: "Test",
      lastName: "User2",
    }),
  ];

  await db.insert(users).values(testUsers).onConflictDoNothing();

  debugLogger("✅ Inserted test users");
}

/**
 * Production seed function for user module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding user data for production environment");

  const adminUser = createUserSeed({
    email: "admin@openeats.app",
    firstName: "Admin",
    lastName: "User",
  });

  await db.insert(users).values([adminUser]).onConflictDoNothing();

  debugLogger("✅ Inserted essential production users");
}

registerSeed("users", {
  dev: devSeed,
  test: testSeed,
  prod: prodSeed,
});
