/**
 * User repository implementation
 * Provides database access for user-related operations
 */

import { hash } from "bcrypt";
import { eq, ilike, or } from "drizzle-orm";
import type { DbId } from "next-vibe/server/db/types";

import { db } from "next-vibe/server/db";
import { ApiRepositoryImpl } from "next-vibe/server/db/repository-postgres";

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
   * Find users by search query
   * @param query - The search query
   * @param limit - The maximum number of results to return
   * @param offset - The number of results to skip
   */
  search(query: string, limit?: number, offset?: number): Promise<User[]>;

  /**
   * Create a new user with hashed password
   * @param data - The user data
   * @param saltRounds - The number of salt rounds for password hashing
   */
  createWithHashedPassword(data: NewUser, saltRounds?: number): Promise<User>;

  /**
   * Update a user's password
   * @param id - The user ID
   * @param password - The new password
   * @param saltRounds - The number of salt rounds for password hashing
   */
  updatePassword(
    id: DbId,
    password: string,
    saltRounds?: number,
  ): Promise<User | undefined>;

  /**
   * Update a user's profile
   * @param id - The user ID
   * @param data - The user data
   */
  updateProfile(
    id: DbId,
    data: Partial<Omit<NewUser, "password">>,
  ): Promise<User | undefined>;
}

/**
 * User repository implementation
 */
export class UserRepositoryImpl
  extends ApiRepositoryImpl<
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
   * Find users by search query
   * @param query - The search query
   * @param limit - The maximum number of results to return
   * @param offset - The number of results to skip
   */
  async search(query: string, limit = 10, offset = 0): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.firstName, `%${query}%`),
          ilike(users.lastName, `%${query}%`),
          ilike(users.email, `%${query}%`),
        ),
      )
      .limit(limit)
      .offset(offset);
  }

  /**
   * Create a new user with hashed password
   * @param data - The user data
   * @param saltRounds - The number of salt rounds for password hashing
   */
  async createWithHashedPassword(
    data: NewUser,
    saltRounds = 10,
  ): Promise<User> {
    // Hash the password
    const hashedPassword = await hash(data.password, saltRounds);

    // Create the user with the hashed password
    return await this.create({
      ...data,
      password: hashedPassword,
    });
  }

  /**
   * Update a user's password
   * @param id - The user ID
   * @param password - The new password
   * @param saltRounds - The number of salt rounds for password hashing
   */
  async updatePassword(
    id: DbId,
    password: string,
    saltRounds = 10,
  ): Promise<User | undefined> {
    // Hash the password
    const hashedPassword = await hash(password, saltRounds);

    // Update the user with the hashed password
    return await this.update(id, {
      password: hashedPassword,
      updatedAt: new Date(),
    });
  }

  /**
   * Update a user's profile
   * @param id - The user ID
   * @param data - The user data
   */
  async updateProfile(
    id: DbId,
    data: Partial<Omit<NewUser, "password">>,
  ): Promise<User | undefined> {
    return await this.update(id, {
      ...data,
      updatedAt: new Date(),
    });
  }
}

/**
 * User repository singleton instance
 */
export const userRepository = new UserRepositoryImpl();
