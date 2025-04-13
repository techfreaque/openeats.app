/**
 * User repository implementation
 * Provides database access for user-related operations
 */

import { and, eq } from "drizzle-orm";

import { db } from "@/app/api/db";
import { BaseRepositoryImpl } from "@/app/api/db/repository";
import type { DbId } from "@/app/api/db/types";
import { userRoles } from "@/app/api/v1/auth/roles/roles.db";

import type { NewUser, selectUserSchema, User } from "./users.db";
import { insertUserSchema, users } from "./users.db";

/**
 * User repository interface
 * Extends the base repository with user-specific operations
 */
export interface UserRepository {
  /**
   * Find a user by email
   * @param email - The user's email
   */
  findByEmail(email: string): Promise<User | undefined>;

  /**
   * Find a user with their roles
   * @param userId - The user ID
   */
  findWithRoles(userId: DbId): Promise<
    | (User & {
        roles: Array<{ id: string; role: string; partnerId?: string }>;
      })
    | undefined
  >;

  /**
   * Check if a user exists
   * @param userId - The user ID
   */
  exists(userId: DbId): Promise<boolean>;

  /**
   * Check if an email is already registered
   * @param email - The email to check
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Check if an email is already registered by another user
   * @param email - The email to check
   * @param excludeUserId - The user ID to exclude from the check
   */
  emailExistsByOtherUser(email: string, excludeUserId: DbId): Promise<boolean>;
}

/**
 * User repository implementation
 */
export class UserRepositoryImpl
  extends BaseRepositoryImpl<
    typeof users,
    User,
    NewUser,
    typeof selectUserSchema
  >
  implements UserRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(users, insertUserSchema);
  }

  /**
   * Find a user by email
   * @param email - The user's email
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.email, email));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Find a user with their roles
   * @param userId - The user ID
   */
  async findWithRoles(userId: DbId): Promise<
    | (User & {
        roles: Array<{ id: string; role: string; partnerId?: string }>;
      })
    | undefined
  > {
    // Get the user
    const user = await this.findById(userId);
    if (!user) {
      return undefined;
    }

    // Get the user roles
    const roles = await db
      .select({
        id: userRoles.id,
        role: userRoles.role,
        partnerId: userRoles.partnerId,
      })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));

    // Return the user with roles
    return {
      ...user,
      roles,
    };
  }

  /**
   * Check if a user exists
   * @param userId - The user ID
   */
  async exists(userId: DbId): Promise<boolean> {
    const user = await this.findById(userId);
    return !!user;
  }

  /**
   * Check if an email is already registered
   * @param email - The email to check
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return !!user;
  }

  /**
   * Check if an email is already registered by another user
   * @param email - The email to check
   * @param excludeUserId - The user ID to exclude from the check
   */
  async emailExistsByOtherUser(
    email: string,
    excludeUserId: DbId,
  ): Promise<boolean> {
    const results = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), eq(users.id, excludeUserId).not()));

    return results.length > 0;
  }
}

/**
 * User repository singleton instance
 */
export const userRepository = new UserRepositoryImpl();
