/**
 * Auth seeds
 * Provides seed data for auth-related tables
 */

import { debugLogger } from "next-vibe/shared/utils/logger";

import type { NewUser } from "./db";
import { UserRoleValue } from "./db";
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

      // Try to find the user by email first
      try {
        const existingUser = await userRepository.findByEmail(user.email);

        if (existingUser) {
          debugLogger(`User with email ${user.email} already exists, skipping`);
          // Create a safe user object without circular references
          createdUsers.push({
            id:
              typeof existingUser.id === "string"
                ? existingUser.id
                : String(existingUser.id),
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            name: `${existingUser.firstName || ""} ${existingUser.lastName || ""}`.trim(),
          });
          continue;
        }
      } catch (findError) {
        // If there's an error finding the user, log it and try to create the user anyway
        const errorMessage =
          findError instanceof Error ? findError.message : String(findError);
        debugLogger(`Error finding user ${user.email}: ${errorMessage}`);
      }

      // Create new user
      try {
        const newUser = await userRepository.createWithHashedPassword(user);
        // Create a safe user object without circular references
        createdUsers.push({
          id: typeof newUser.id === "string" ? newUser.id : String(newUser.id),
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          name: `${newUser.firstName || ""} ${newUser.lastName || ""}`.trim(),
        });
        debugLogger(`Created new user: ${newUser.email}`);
      } catch (createError) {
        // Handle database errors
        const errorMessage =
          createError instanceof Error
            ? createError.message
            : String(createError);
        const dbError = createError as { code?: string };
        if (dbError.code === "42P01") {
          debugLogger(`Table does not exist yet for user ${user.email}`);
        } else {
          debugLogger(`Error creating user ${user.email}: ${errorMessage}`);
        }
      }
    } catch (error) {
      // Handle any other errors
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      debugLogger(`Error processing user ${user.email}: ${errorMessage}`);
    }
  }

  // Create roles for users
  try {
    // Add ADMIN role to first user
    if (createdUsers.length > 0 && createdUsers[0]?.id) {
      try {
        // Check if role already exists
        const existingRole = await userRolesRepository.findByUserIdAndRole(
          createdUsers[0].id,
          UserRoleValue.ADMIN,
        );

        if (!existingRole) {
          await userRolesRepository.create({
            userId: createdUsers[0].id, // Admin user
            role: UserRoleValue.ADMIN,
          });
          debugLogger(`Added ADMIN role to user: ${createdUsers[0].email}`);
        } else {
          debugLogger(
            `User ${createdUsers[0].email} already has ADMIN role, skipping`,
          );
        }
      } catch (error) {
        const dbError = error as { code?: string };
        if (dbError.code === "42P01") {
          debugLogger(
            "⚠️ User roles table does not exist yet, skipping role creation",
          );
        } else {
          debugLogger(
            `Error creating ADMIN role for user ${createdUsers[0].email}:`,
            error,
          );
        }
      }
    }

    // Add CUSTOMER role to second user
    if (createdUsers.length > 1 && createdUsers[1]?.id) {
      try {
        // Check if role already exists
        const existingRole = await userRolesRepository.findByUserIdAndRole(
          createdUsers[1].id,
          UserRoleValue.CUSTOMER,
        );

        if (!existingRole) {
          await userRolesRepository.create({
            userId: createdUsers[1].id, // Demo user
            role: UserRoleValue.CUSTOMER,
          });
          debugLogger(`Added CUSTOMER role to user: ${createdUsers[1].email}`);
        } else {
          debugLogger(
            `User ${createdUsers[1].email} already has CUSTOMER role, skipping`,
          );
        }
      } catch (error) {
        const dbError = error as { code?: string };
        if (dbError.code === "42P01") {
          debugLogger(
            "⚠️ User roles table does not exist yet, skipping role creation",
          );
        } else {
          debugLogger(
            `Error creating CUSTOMER role for user ${createdUsers[1].email}:`,
            error,
          );
        }
      }
    }

    // Add CUSTOMER role to remaining users
    for (let i = 2; i < createdUsers.length; i++) {
      const createdUser = createdUsers[i];
      if (createdUser) {
        try {
          const userId = createdUser.id;
          const userEmail = createdUser.email;
          // Check if role already exists
          const existingRole = await userRolesRepository.findByUserIdAndRole(
            userId,
            UserRoleValue.CUSTOMER,
          );

          if (!existingRole) {
            await userRolesRepository.create({
              userId, // Regular users
              role: UserRoleValue.CUSTOMER,
            });
            debugLogger(`Added CUSTOMER role to user: ${userEmail}`);
          } else {
            debugLogger(
              `User ${userEmail} already has CUSTOMER role, skipping`,
            );
          }
        } catch (error) {
          const dbError = error as { code?: string };
          if (dbError.code === "42P01") {
            debugLogger(
              "⚠️ User roles table does not exist yet, skipping role creation",
            );
          } else {
            const userEmail = createdUsers[i].email;
            debugLogger(
              `Error creating CUSTOMER role for user ${userEmail}:`,
              error,
            );
          }
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

      // Try to find the user by email first
      try {
        const existingUser = await userRepository.findByEmail(user.email);

        if (existingUser) {
          debugLogger(
            `Test user with email ${user.email} already exists, skipping`,
          );
          // Create a safe user object without circular references
          createdUsers.push({
            id:
              typeof existingUser.id === "string"
                ? existingUser.id
                : String(existingUser.id),
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            name: `${existingUser.firstName || ""} ${existingUser.lastName || ""}`.trim(),
          });
          continue;
        }
      } catch (findError) {
        // If there's an error finding the user, log it and try to create the user anyway
        const errorMessage =
          findError instanceof Error ? findError.message : String(findError);
        debugLogger(`Error finding test user ${user.email}: ${errorMessage}`);
      }

      // Create new user
      try {
        const newUser = await userRepository.createWithHashedPassword(user);
        // Create a safe user object without circular references
        createdUsers.push({
          id: typeof newUser.id === "string" ? newUser.id : String(newUser.id),
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          name: `${newUser.firstName || ""} ${newUser.lastName || ""}`.trim(),
        });
        debugLogger(`Created new test user: ${newUser.email}`);
      } catch (createError) {
        // Handle database errors
        const errorMessage =
          createError instanceof Error
            ? createError.message
            : String(createError);
        const dbError = createError as { code?: string };
        if (dbError.code === "42P01") {
          debugLogger(`Table does not exist yet for test user ${user.email}`);
        } else {
          debugLogger(
            `Error creating test user ${user.email}: ${errorMessage}`,
          );
        }
      }
    } catch (error) {
      // Handle any other errors
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      debugLogger(`Error processing test user ${user.email}: ${errorMessage}`);
    }
  }

  // Create roles for test users
  try {
    // Add ADMIN role to first user
    if (createdUsers.length > 0 && createdUsers[0]?.id) {
      try {
        // Check if role already exists
        const existingRole = await userRolesRepository.findByUserIdAndRole(
          createdUsers[0].id,
          UserRoleValue.ADMIN,
        );

        if (!existingRole) {
          await userRolesRepository.create({
            userId: createdUsers[0].id,
            role: UserRoleValue.ADMIN,
          });
          debugLogger(
            `Added ADMIN role to test user: ${createdUsers[0].email}`,
          );
        } else {
          debugLogger(
            `Test user ${createdUsers[0].email} already has ADMIN role, skipping`,
          );
        }
      } catch (error) {
        const dbError = error as { code?: string };
        if (dbError.code === "42P01") {
          debugLogger(
            "⚠️ User roles table does not exist yet, skipping role creation",
          );
        } else {
          debugLogger(
            `Error creating ADMIN role for test user ${createdUsers[0].email}:`,
            error,
          );
        }
      }
    }

    // Add CUSTOMER role to second user
    if (createdUsers.length > 1 && createdUsers[1]?.id) {
      try {
        // Check if role already exists
        const existingRole = await userRolesRepository.findByUserIdAndRole(
          createdUsers[1].id,
          UserRoleValue.CUSTOMER,
        );

        if (!existingRole) {
          await userRolesRepository.create({
            userId: createdUsers[1].id,
            role: UserRoleValue.CUSTOMER,
          });
          debugLogger(
            `Added CUSTOMER role to test user: ${createdUsers[1].email}`,
          );
        } else {
          debugLogger(
            `Test user ${createdUsers[1].email} already has CUSTOMER role, skipping`,
          );
        }
      } catch (error) {
        const dbError = error as { code?: string };
        if (dbError.code === "42P01") {
          debugLogger(
            "⚠️ User roles table does not exist yet, skipping role creation",
          );
        } else {
          debugLogger(
            `Error creating CUSTOMER role for test user ${createdUsers[1].email}:`,
            error,
          );
        }
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

    let adminId: string | undefined;

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

    if (adminId) {
      try {
        // Create admin role for admin user if it doesn't exist
        const existingRole = await userRolesRepository.findByUserIdAndRole(
          adminId,
          UserRoleValue.ADMIN,
        );

        if (!existingRole) {
          await userRolesRepository.create({
            userId: adminId,
            role: UserRoleValue.ADMIN,
          });
          debugLogger(`Added ADMIN role to user: ${adminUser.email}`);
        } else {
          debugLogger(
            `User ${adminUser.email} already has ADMIN role, skipping`,
          );
        }
      } catch (error) {
        const dbError = error as { code?: string };
        if (dbError.code === "42P01") {
          debugLogger(
            "⚠️ User roles table does not exist yet, skipping role creation",
          );
        } else {
          debugLogger(
            `Error creating ADMIN role for user ${adminUser.email}:`,
            error,
          );
        }
      }
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
