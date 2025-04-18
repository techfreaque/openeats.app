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
  // Handle potential duplicates by checking if the user already exists
  const createdUsers = [];

  for (const user of allUsers) {
    try {
      // Check if user already exists
      const existingUser = await userRepository.findByEmail(user.email);

      if (existingUser) {
        debugLogger(`User with email ${user.email} already exists, skipping`);
        createdUsers.push(existingUser);
      } else {
        // Create new user
        const newUser = await userRepository.createWithHashedPassword(user);
        createdUsers.push(newUser);
      }
    } catch (error) {
      debugLogger(`Error creating user ${user.email}: ${(error as Error).message}`);
    }
  }

  debugLogger(`✅ Processed ${createdUsers.length} development users`);
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
  // Handle potential duplicates by checking if the user already exists
  const createdTestUsers = [];

  for (const user of testUsers) {
    try {
      // Check if user already exists
      const existingUser = await userRepository.findByEmail(user.email);

      if (existingUser) {
        debugLogger(`User with email ${user.email} already exists, skipping`);
        createdTestUsers.push(existingUser);
      } else {
        // Create new user
        const newUser = await userRepository.createWithHashedPassword(user);
        createdTestUsers.push(newUser);
      }
    } catch (error) {
      debugLogger(`Error creating user ${user.email}: ${(error as Error).message}`);
    }
  }

  debugLogger(`✅ Processed ${createdTestUsers.length} test users`);
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
  try {
    // Check if admin user already exists
    const existingAdmin = await userRepository.findByEmail(adminUser.email);

    if (existingAdmin) {
      debugLogger(`Admin user with email ${adminUser.email} already exists, skipping`);
    } else {
      // Create new admin user
      await userRepository.createWithHashedPassword(adminUser);
      debugLogger(`Created admin user with email ${adminUser.email}`);
    }
  } catch (error) {
    debugLogger(`Error creating admin user: ${(error as Error).message}`);
  }

  debugLogger("✅ Processed essential production users");
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
