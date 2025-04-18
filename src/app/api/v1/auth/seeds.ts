/**
 * Auth seeds
 * Provides seed data for auth-related tables
 */

import { debugLogger } from "next-vibe/shared/utils/logger";

import type { NewUser } from "./db";
import { userRepository, userRolesRepository } from "./repository";

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
 * Development seed function for auth module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding auth data for development environment");

  // Create admin user
  const adminUser = createUserSeed({
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
  });

  // Create demo user
  const demoUser = createUserSeed({
    email: "demo@example.com",
    firstName: "Demo",
    lastName: "User",
  });

  // Create regular users
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

  // Create roles for users
  try {
    if (createdUsers.length > 0 && createdUsers[0]?.id) {
      await userRolesRepository.create({
        userId: createdUsers[0].id, // Admin user
        role: "ADMIN",
      });
    }

    if (createdUsers.length > 1 && createdUsers[1]?.id) {
      await userRolesRepository.create({
        userId: createdUsers[1].id, // Demo user
        role: "CUSTOMER",
      });
    }

    for (let i = 2; i < createdUsers.length; i++) {
      if (createdUsers[i]?.id) {
        await userRolesRepository.create({
          userId: createdUsers[i].id, // Regular users
          role: "CUSTOMER",
        });
      }
    }

    debugLogger(`✅ Inserted ${createdUsers.length} development users with roles`);
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if ((error as any)?.code === '42P01') { // relation does not exist
      debugLogger("⚠️ User roles table does not exist yet, skipping auth role seeds");
    } else {
      // Re-throw other errors
      throw error;
    }
  }


}

/**
 * Test seed function for auth module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding auth data for test environment");

  // Create test users
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
  const createdUsers = await Promise.all(
    testUsers.map((user) => userRepository.createWithHashedPassword(user)),
  );

  // Create roles for test users
  try {
    if (createdUsers.length > 0 && createdUsers[0]?.id) {
      await userRolesRepository.create({
        userId: createdUsers[0].id,
        role: "ADMIN",
      });
    }

    if (createdUsers.length > 1 && createdUsers[1]?.id) {
      await userRolesRepository.create({
        userId: createdUsers[1].id,
        role: "CUSTOMER",
      });
    }

    debugLogger("✅ Inserted test users with roles");
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if ((error as any)?.code === '42P01') { // relation does not exist
      debugLogger("⚠️ User roles table does not exist yet, skipping auth role seeds");
    } else {
      // Re-throw other errors
      throw error;
    }
  }
}

/**
 * Production seed function for auth module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding auth data for production environment");

  // Create admin user
  const adminUser = createUserSeed({
    email: "admin@openeats.app",
    firstName: "Admin",
    lastName: "User",
  });

  // Create admin user with hashed password using the repository
  const createdAdmin = await userRepository.createWithHashedPassword(adminUser);

  // Create admin role for admin user
  try {
    await userRolesRepository.create({
      userId: createdAdmin.id,
      role: "ADMIN",
    });

    debugLogger("✅ Inserted essential production users with roles");
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if ((error as any)?.code === '42P01') { // relation does not exist
      debugLogger("⚠️ User roles table does not exist yet, skipping auth role seeds");
    } else {
      // Re-throw other errors
      throw error;
    }
  }
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
