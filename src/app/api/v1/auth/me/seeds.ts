import { registerSeed } from "next-vibe/server/db/seed-manager";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { type NewUser } from "../db";
import { userRepository } from "../repository";

/**
 * Helper function to create user seed data
 */
function createUserSeed(overrides?: Partial<NewUser>): NewUser {
  return {
    email: `user${Math.floor(Math.random() * 1000)}@example.com`,
    password: "password123", // Plain text password - will be hashed by createWithHashedPassword
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

  // Create users with hashed passwords using the repository
  const createdUsers = await Promise.all(
    allUsers.map((user) => userRepository.createWithHashedPassword(user)),
  );

  debugLogger(`✅ Inserted ${createdUsers.length} development users`);
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

  // Create test users with hashed passwords using the repository
  await Promise.all(
    testUsers.map((user) => userRepository.createWithHashedPassword(user)),
  );

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

  // Create admin user with hashed password using the repository
  await userRepository.createWithHashedPassword(adminUser);

  debugLogger("✅ Inserted essential production users");
}

registerSeed("users", {
  dev: devSeed,
  test: testSeed,
  prod: prodSeed,
});
