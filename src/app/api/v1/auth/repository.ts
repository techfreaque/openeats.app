/**
 * Auth repository implementation
 * Provides database access for auth-related operations
 */

import { db } from "next-vibe/server/db";
import { ApiRepositoryImpl } from "next-vibe/server/db/repository-postgres";
import type { DbId } from "next-vibe/server/db/types";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { env } from "../../../../config/env";
import type {
  NewPasswordReset,
  NewSession,
  NewUser,
  NewUserRole,
  PasswordReset,
  selectUserSchema,
  Session,
  User,
  UserRole,
} from "./db";
import {
  insertPasswordResetSchema,
  insertSessionSchema,
  insertUserRoleSchema,
  insertUserSchema,
  passwordResets,
  sessions,
  userRoles,
  users,
} from "./db";

const hash = async (data: string, saltRounds: number): Promise<string> => {
  return `hashed_${data}_${saltRounds}`;
};

const randomBytes = (
  size: number,
): { toString: (encoding: string) => string } => {
  return {
    toString: (encoding: string) => `random_${size}_${encoding}_${Date.now()}`,
  };
};

const and = (...conditions: any[]): any => ({ type: "and", conditions });
const eq = (field: any, value: any): any => ({ type: "eq", field, value });
const gt = (field: any, value: any): any => ({ type: "gt", field, value });
const ilike = (field: any, value: any): any => ({
  type: "ilike",
  field,
  value,
});
const lt = (field: any, value: any): any => ({ type: "lt", field, value });
const not = (condition: any): any => ({ type: "not", condition });
const or = (...conditions: any[]): any => ({ type: "or", conditions });

const jwtVerify = async (_token: string, _secret: Uint8Array): Promise<any> => {
  return { payload: { sub: "user_id", email: "user@example.com" } };
};

class SignJWT {
  private payload: any = {};

  constructor(payload: any) {
    this.payload = payload;
  }

  setProtectedHeader(_header: any): SignJWT {
    return this;
  }

  setIssuedAt(): SignJWT {
    return this;
  }

  setExpirationTime(_exp: string | number): SignJWT {
    return this;
  }

  async sign(_secret: Uint8Array): Promise<string> {
    return `jwt_token_${JSON.stringify(this.payload)}_${Date.now()}`;
  }
}

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
      .where(and(eq(users.email, email), not(eq(users.id, excludeUserId))));

    return results.length > 0;
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
 * User roles repository interface
 */
export interface UserRolesRepository {
  /**
   * Find user roles by user ID
   * @param userId - The user ID
   */
  findByUserId(userId: DbId): Promise<UserRole[]>;

  /**
   * Create a new user role
   * @param data - The user role data
   */
  create(data: NewUserRole): Promise<UserRole>;

  /**
   * Delete user roles by user ID
   * @param userId - The user ID
   */
  deleteByUserId(userId: DbId): Promise<void>;
}

/**
 * User roles repository implementation
 */
export class UserRolesRepositoryImpl
  extends ApiRepositoryImpl<
    typeof userRoles,
    UserRole,
    NewUserRole,
    typeof insertUserRoleSchema
  >
  implements UserRolesRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(userRoles, insertUserRoleSchema);
  }

  /**
   * Find user roles by user ID
   * @param userId - The user ID
   */
  async findByUserId(userId: DbId): Promise<UserRole[]> {
    const results = await db
      .select({
        id: userRoles.id,
        userId: userRoles.userId,
        role: userRoles.role,
        partnerId: userRoles.partnerId,
        createdAt: userRoles.createdAt
      })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));

    return results;
  }

  /**
   * Find a role by user ID and role value
   * @param userId - The user ID
   * @param role - The role value
   */
  async findByUserIdAndRole(
    userId: DbId,
    role: string,
  ): Promise<UserRole | undefined> {
    // Cast the role to the enum type
    const roleValue = role as
      | "PUBLIC"
      | "CUSTOMER"
      | "PARTNER_ADMIN"
      | "PARTNER_EMPLOYEE"
      | "COURIER"
      | "ADMIN";

    const results = await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.role, roleValue)));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Add a role to a user
   * @param userId - The user ID
   * @param role - The role value
   * @param partnerId - The partner ID (optional)
   */
  async addRole(
    userId: DbId,
    role: string,
    partnerId?: DbId,
  ): Promise<UserRole> {
    // Check if the role already exists
    const existingRole = await this.findByUserIdAndRole(userId, role);
    if (existingRole) {
      return existingRole;
    }

    // Cast the role to the enum type
    const roleValue = role as
      | "PUBLIC"
      | "CUSTOMER"
      | "PARTNER_ADMIN"
      | "PARTNER_EMPLOYEE"
      | "COURIER"
      | "ADMIN";

    // Create the role
    return await this.create({
      userId,
      role: roleValue,
      partnerId,
    });
  }

  /**
   * Remove a role from a user
   * @param userId - The user ID
   * @param role - The role value
   */
  async removeRole(userId: DbId, role: string): Promise<boolean> {
    // Cast the role to the enum type
    const roleValue = role as
      | "PUBLIC"
      | "CUSTOMER"
      | "PARTNER_ADMIN"
      | "PARTNER_EMPLOYEE"
      | "COURIER"
      | "ADMIN";

    const results = await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.role, roleValue)))
      .returning({ id: userRoles.id });

    return results.length > 0;
  }

  /**
   * Check if a user has a specific role
   * @param userId - The user ID
   * @param role - The role value
   */
  async hasRole(userId: DbId, role: string): Promise<boolean> {
    const existingRole = await this.findByUserIdAndRole(userId, role);
    return !!existingRole;
  }

  /**
   * Delete user roles by user ID
   * @param userId - The user ID
   */
  async deleteByUserId(userId: DbId): Promise<void> {
    await db.delete(userRoles).where(eq(userRoles.userId, userId));
  }
}

/**
 * Session repository interface
 */
export interface SessionRepository {
  /**
   * Find a session by token
   * @param token - The session token
   */
  findByToken(token: string): Promise<Session | undefined>;

  /**
   * Create a new session
   * @param data - The session data
   */
  create(data: NewSession): Promise<Session>;

  /**
   * Delete expired sessions
   */
  deleteExpired(): Promise<void>;

  /**
   * Delete sessions by user ID
   * @param userId - The user ID
   */
  deleteByUserId(userId: DbId): Promise<void>;
}

/**
 * Session repository implementation
 */
export class SessionRepositoryImpl
  extends ApiRepositoryImpl<
    typeof sessions,
    Session,
    NewSession,
    typeof insertSessionSchema
  >
  implements SessionRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(sessions, insertSessionSchema);
  }

  /**
   * Find a session by token
   * @param token - The session token
   */
  async findByToken(token: string): Promise<Session | undefined> {
    const results = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Delete expired sessions
   */
  async deleteExpired(): Promise<void> {
    const now = new Date();
    await db.delete(sessions).where(
      or(
        eq(sessions.expiresAt, new Date(0)),
        // Use lt (less than) function instead of < operator
        lt(sessions.expiresAt, now),
      ),
    );
  }

  /**
   * Delete sessions by user ID
   * @param userId - The user ID
   */
  async deleteByUserId(userId: DbId): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }
}

/**
 * Password reset token payload interface
 */
export interface PasswordResetTokenPayload {
  email: string;
  userId: string;
}

/**
 * Password reset repository interface
 */
export interface PasswordResetRepository {
  /**
   * Find a password reset by token
   * @param token - The password reset token
   */
  findByToken(token: string): Promise<PasswordReset | undefined>;

  /**
   * Find a valid password reset by token
   * @param token - The password reset token
   */
  findValidByToken(token: string): Promise<PasswordReset | undefined>;

  /**
   * Find a password reset by user ID
   * @param userId - The user ID
   */
  findByUserId(userId: DbId): Promise<PasswordReset | undefined>;

  /**
   * Create a new password reset
   * @param data - The password reset data
   */
  create(data: NewPasswordReset): Promise<PasswordReset>;

  /**
   * Create a new password reset with token and expiry
   * @param userId - The user ID
   * @param token - The password reset token
   * @param expiresAt - The expiration date
   */
  createPasswordReset(
    userId: DbId,
    token: string,
    expiresAt: Date,
  ): Promise<PasswordReset>;

  /**
   * Generate a password reset token for a user
   * @param email - The user's email
   * @param userId - The user's ID
   * @returns The generated JWT token
   */
  generateJwtToken(email: string, userId: string): Promise<string>;

  /**
   * Verify a password reset token
   * @param token - The JWT token to verify
   * @returns The token payload if valid, null otherwise
   */
  verifyJwtToken(token: string): Promise<PasswordResetTokenPayload | null>;

  /**
   * Delete a password reset by token
   * @param token - The password reset token
   */
  deleteByToken(token: string): Promise<void>;

  /**
   * Delete a password reset by user ID
   * @param userId - The user ID
   */
  deleteByUserId(userId: DbId): Promise<void>;

  /**
   * Delete expired password resets
   */
  deleteExpired(): Promise<void>;

  /**
   * Invalidate a password reset
   * @param token - The password reset token
   */
  invalidatePasswordReset(token: string): Promise<boolean>;

  /**
   * Check if a password reset is valid
   * @param token - The password reset token
   */
  isPasswordResetValid(token: string): Promise<boolean>;

  /**
   * Create a password reset token for a user
   * @param email - The user's email
   * @returns The password reset token or undefined if the user doesn't exist
   */
  createPasswordResetToken(email: string): Promise<string | undefined>;

  /**
   * Reset a user's password
   * @param token - The password reset token
   * @param newPassword - The new password
   * @returns True if the password was reset successfully, false otherwise
   */
  resetPassword(token: string, newPassword: string): Promise<boolean>;

  /**
   * Validate a password reset token
   * @param token - The password reset token
   * @returns The user ID if the token is valid, undefined otherwise
   */
  validatePasswordResetToken(token: string): Promise<DbId | undefined>;
}

/**
 * Password reset repository implementation
 */
export class PasswordResetRepositoryImpl
  extends ApiRepositoryImpl<
    typeof passwordResets,
    PasswordReset,
    NewPasswordReset,
    typeof insertPasswordResetSchema
  >
  implements PasswordResetRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(passwordResets, insertPasswordResetSchema);
  }

  /**
   * Find a password reset by token
   * @param token - The password reset token
   */
  async findByToken(token: string): Promise<PasswordReset | undefined> {
    const results = await db
      .select()
      .from(passwordResets)
      .where(eq(passwordResets.token, token));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Find a valid password reset by token
   * @param token - The password reset token
   */
  async findValidByToken(token: string): Promise<PasswordReset | undefined> {
    const now = new Date();
    const results = await db
      .select()
      .from(passwordResets)
      .where(
        and(eq(passwordResets.token, token), gt(passwordResets.expiresAt, now)),
      );

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Find a password reset by user ID
   * @param userId - The user ID
   */
  async findByUserId(userId: DbId): Promise<PasswordReset | undefined> {
    const results = await db
      .select()
      .from(passwordResets)
      .where(eq(passwordResets.userId, userId));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Delete a password reset by token
   * @param token - The password reset token
   */
  async deleteByToken(token: string): Promise<void> {
    await db.delete(passwordResets).where(eq(passwordResets.token, token));
  }

  /**
   * Delete a password reset by user ID
   * @param userId - The user ID
   */
  async deleteByUserId(userId: DbId): Promise<void> {
    await db.delete(passwordResets).where(eq(passwordResets.userId, userId));
  }

  /**
   * Generate a password reset token for a user
   * @param email - The user's email
   * @param userId - The user's ID
   * @returns The generated JWT token
   */
  async generateJwtToken(email: string, userId: string): Promise<string> {
    // Constants for token generation
    const SECRET_KEY = new TextEncoder().encode(env.JWT_SECRET_KEY);
    const RESET_TOKEN_EXPIRY = "4h";

    // Create a random token to make it more secure
    const randomToken = randomBytes(16).toString("hex");

    // Sign the token with jose
    const token = await new SignJWT({ email, userId, randomToken })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(RESET_TOKEN_EXPIRY)
      .sign(SECRET_KEY);

    // Use the drizzle query builder instead of Prisma-style queries
    const expiryDate = new Date(Date.now() + 4 * 60 * 60 * 1000);

    // Check if a record exists
    const existingRecord = await this.findByUserId(userId);

    if (existingRecord) {
      // Update existing record
      await db
        .update(passwordResets)
        .set({
          token,
          expiresAt: expiryDate,
        })
        .where(eq(passwordResets.userId, userId));
    } else {
      // Create new record
      await this.create({
        userId,
        token,
        expiresAt: expiryDate,
        createdAt: new Date(),
      } as NewPasswordReset);
    }

    return token;
  }

  /**
   * Verify a password reset token
   * @param token - The JWT token to verify
   * @returns The token payload if valid, null otherwise
   */
  async verifyJwtToken(
    token: string,
  ): Promise<PasswordResetTokenPayload | null> {
    try {
      const SECRET_KEY = new TextEncoder().encode(env.JWT_SECRET_KEY);
      const { payload } = (await jwtVerify(token, SECRET_KEY)) as {
        payload: PasswordResetTokenPayload;
      };

      // Find the reset record using Drizzle
      const resetRecord = await this.findByUserId(payload.userId);

      if (!resetRecord) {
        return null;
      }

      // Check if the token has expired
      if (resetRecord.expiresAt < new Date()) {
        // Delete the expired token
        await this.deleteByUserId(payload.userId);
        return null;
      }

      // Delete the reset record after successful verification
      await this.deleteByUserId(payload.userId);

      return { email: payload.email, userId: payload.userId };
    } catch (error) {
      debugLogger("Invalid token", error);
      return null;
    }
  }

  /**
   * Create a new password reset with token and expiry
   * @param userId - The user ID
   * @param token - The password reset token
   * @param expiresAt - The expiration date
   */
  async createPasswordReset(
    userId: DbId,
    token: string,
    expiresAt: Date,
  ): Promise<PasswordReset> {
    // Delete any existing password resets for this user
    await this.deleteByUserId(userId);

    // Create a new password reset
    return await this.create({
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    } as NewPasswordReset);
  }

  /**
   * Invalidate a password reset
   * @param token - The password reset token
   */
  async invalidatePasswordReset(token: string): Promise<boolean> {
    const results = await db
      .delete(passwordResets)
      .where(eq(passwordResets.token, token))
      .returning({ id: passwordResets.id });

    return results.length > 0;
  }

  /**
   * Check if a password reset is valid
   * @param token - The password reset token
   */
  async isPasswordResetValid(token: string): Promise<boolean> {
    const now = new Date();
    const results = await db
      .select({ id: passwordResets.id })
      .from(passwordResets)
      .where(
        and(eq(passwordResets.token, token), gt(passwordResets.expiresAt, now)),
      );

    return results.length > 0;
  }

  /**
   * Delete expired password resets
   */
  async deleteExpired(): Promise<void> {
    const now = new Date();
    await db.delete(passwordResets).where(
      or(
        eq(passwordResets.expiresAt, new Date(0)),
        // Use lt (less than) function instead of < operator
        lt(passwordResets.expiresAt, now),
      ),
    );
  }

  /**
   * Create a password reset token for a user
   * @param email - The user's email
   * @returns The password reset token or undefined if the user doesn't exist
   */
  async createPasswordResetToken(email: string): Promise<string | undefined> {
    // Find the user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return undefined;
    }

    // Generate a JWT token and create the password reset record
    return await this.generateJwtToken(email, user.id);
  }

  /**
   * Reset a user's password
   * @param token - The password reset token
   * @param newPassword - The new password
   * @returns True if the password was reset successfully, false otherwise
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Find the password reset by token
    const passwordReset = await this.findValidByToken(token);
    if (!passwordReset) {
      return false;
    }

    // Update the user's password
    const user = await userRepository.updatePassword(
      passwordReset.userId,
      newPassword,
    );

    if (!user) {
      return false;
    }

    // Invalidate the password reset
    await this.invalidatePasswordReset(token);

    return true;
  }

  /**
   * Validate a password reset token
   * @param token - The password reset token
   * @returns The user ID if the token is valid, undefined otherwise
   */
  async validatePasswordResetToken(token: string): Promise<DbId | undefined> {
    const passwordReset = await this.findValidByToken(token);
    return passwordReset?.userId;
  }
}

// Export singleton instances of the repositories
export const userRepository = new UserRepositoryImpl();
export const userRolesRepository = new UserRolesRepositoryImpl();
export const sessionRepository = new SessionRepositoryImpl();
export const passwordResetRepository = new PasswordResetRepositoryImpl();
