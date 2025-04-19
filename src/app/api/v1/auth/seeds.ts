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
  const createdUsers = [];

  // Create users with hashed passwords using the repository
  // Handle potential duplicates by checking if the user already exists
  for (const user of allUsers) {
    try {
      debugLogger(`Processing user: ${user.email}`);
      // Check if user already exists
      const existingUser = await userRepository.findByEmail(user.email);

      if (existingUser) {
        debugLogger(`User with email ${user.email} already exists, skipping`);
        createdUsers.push(existingUser);
      } else {
        // Create new user
        const newUser = await userRepository.createWithHashedPassword(user);
        createdUsers.push(newUser);
        debugLogger(`Created new user: ${newUser.email}`);
      }
    } catch (error) {
      debugLogger(
        `Error processing user ${user.email}: ${(error as Error).message}`,
      );
    }
  }

  // Create roles for users
  try {
    if (createdUsers.length > 0 && createdUsers[0]?.id) {
      // Check if role already exists
      const existingRole = await userRolesRepository.findByUserIdAndRole(
        createdUsers[0].id,
        "ADMIN",
      );

      if (!existingRole) {
        await userRolesRepository.create({
          userId: createdUsers[0].id, // Admin user
          role: "ADMIN",
        });
        debugLogger(`Added ADMIN role to user: ${createdUsers[0].email}`);
      } else {
        debugLogger(
          `User ${createdUsers[0].email} already has ADMIN role, skipping`,
        );
      }
    }

    if (createdUsers.length > 1 && createdUsers[1]?.id) {
      // Check if role already exists
      const existingRole = await userRolesRepository.findByUserIdAndRole(
        createdUsers[1].id,
        "CUSTOMER",
      );

      if (!existingRole) {
        await userRolesRepository.create({
          userId: createdUsers[1].id, // Demo user
          role: "CUSTOMER",
        });
        debugLogger(`Added CUSTOMER role to user: ${createdUsers[1].email}`);
      } else {
        debugLogger(
          `User ${createdUsers[1].email} already has CUSTOMER role, skipping`,
        );
      }
    }

    for (let i = 2; i < createdUsers.length; i++) {
      if (createdUsers[i]?.id && createdUsers[i]?.email) {
        const userId = createdUsers[i].id;
        const userEmail = createdUsers[i].email;
        // Check if role already exists
        const existingRole = await userRolesRepository.findByUserIdAndRole(
          userId,
          "CUSTOMER",
        );

        if (!existingRole) {
          await userRolesRepository.create({
            userId, // Regular users
            role: "CUSTOMER",
          });
          debugLogger(`Added CUSTOMER role to user: ${userEmail}`);
        } else {
          debugLogger(`User ${userEmail} already has CUSTOMER role, skipping`);
        }
      }
    }

    debugLogger(
      `✅ Processed ${createdUsers.length} development users with roles`,
    );
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    const dbError = error as { code?: string };
    if (dbError.code === "42P01") {
      // relation does not exist
      debugLogger(
        "⚠️ User roles table does not exist yet, skipping auth role seeds",
      );
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
  // Handle potential duplicates by checking if the user already exists
  const createdUsers = [];

  for (const user of testUsers) {
    try {
      debugLogger(`Processing test user: ${user.email}`);
      // Check if user already exists
      const existingUser = await userRepository.findByEmail(user.email);

      if (existingUser) {
        debugLogger(
          `Test user with email ${user.email} already exists, skipping`,
        );
        createdUsers.push(existingUser);
      } else {
        // Create new user
        const newUser = await userRepository.createWithHashedPassword(user);
        createdUsers.push(newUser);
        debugLogger(`Created new test user: ${newUser.email}`);
      }
    } catch (error) {
      debugLogger(
        `Error processing test user ${user.email}: ${(error as Error).message}`,
      );
    }
  }

  // Create roles for test users
  try {
    if (createdUsers.length > 0 && createdUsers[0]?.id) {
      // Check if role already exists
      const existingRole = await userRolesRepository.findByUserIdAndRole(
        createdUsers[0].id,
        "ADMIN",
      );

      if (!existingRole) {
        await userRolesRepository.create({
          userId: createdUsers[0].id,
          role: "ADMIN",
        });
        debugLogger(`Added ADMIN role to test user: ${createdUsers[0].email}`);
      } else {
        debugLogger(
          `Test user ${createdUsers[0].email} already has ADMIN role, skipping`,
        );
      }
    }

    if (createdUsers.length > 1 && createdUsers[1]?.id) {
      // Check if role already exists
      const existingRole = await userRolesRepository.findByUserIdAndRole(
        createdUsers[1].id,
        "CUSTOMER",
      );

      if (!existingRole) {
        await userRolesRepository.create({
          userId: createdUsers[1].id,
          role: "CUSTOMER",
        });
        debugLogger(
          `Added CUSTOMER role to test user: ${createdUsers[1].email}`,
        );
      } else {
        debugLogger(
          `Test user ${createdUsers[1].email} already has CUSTOMER role, skipping`,
        );
      }
    }

    debugLogger(`✅ Processed ${createdUsers.length} test users with roles`);
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    const dbError = error as { code?: string };
    if (dbError.code === "42P01") {
      // relation does not exist
      debugLogger(
        "⚠️ User roles table does not exist yet, skipping auth role seeds",
      );
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
  // In production, we only create the admin user if it doesn't exist
  try {
    debugLogger(`Checking for admin user: ${adminUser.email}`);
    // Check if admin user already exists
    const existingAdmin = await userRepository.findByEmail(adminUser.email);

    let adminId: string;

    if (existingAdmin) {
      debugLogger(
        `Admin user with email ${adminUser.email} already exists, skipping user creation`,
      );
      adminId = existingAdmin.id;
    } else {
      // Create new admin user
      const newAdmin = await userRepository.createWithHashedPassword(adminUser);
      adminId = newAdmin.id;
      debugLogger(`Created admin user with email ${newAdmin.email}`);
    }

    // Create admin role for admin user if it doesn't exist
    const existingRole = await userRolesRepository.findByUserIdAndRole(
      adminId,
      "ADMIN",
    );

    if (!existingRole) {
      await userRolesRepository.create({
        userId: adminId,
        role: "ADMIN",
      });
      debugLogger(`Added ADMIN role to user: ${adminUser.email}`);
    } else {
      debugLogger(`User ${adminUser.email} already has ADMIN role, skipping`);
    }

    debugLogger("✅ Processed essential production users with roles");
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    const dbError = error as { code?: string };
    if (dbError.code === "42P01") {
      // relation does not exist
      debugLogger(
        "⚠️ User roles table does not exist yet, skipping auth role seeds",
      );
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

// Initialize seeds in development automatically
// The seed manager will handle the actual initialization
debugLogger("🌱 Auth seeds ready for initialization");

export default seeds;
