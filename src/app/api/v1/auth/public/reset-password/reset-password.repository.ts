/**
 * Password reset repository implementation
 * Provides database access for password reset-related operations
 */

import { and, eq, gt } from "drizzle-orm";
import type { DbId } from "next-vibe/server/db/types";

import { db } from "@/app/api/db";
import { ApiRepositoryImpl } from "@/app/api/db/repository";

import type {
  NewPasswordReset,
  PasswordReset,
  selectPasswordResetSchema,
} from "./reset-password.db";
import { insertPasswordResetSchema, passwordResets } from "./reset-password.db";

/**
 * Password reset repository interface
 * Extends the base repository with password reset-specific operations
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
   * Invalidate a password reset
   * @param token - The password reset token
   */
  invalidatePasswordReset(token: string): Promise<boolean>;

  /**
   * Invalidate all password resets for a user
   * @param userId - The user ID
   */
  invalidateAllUserPasswordResets(userId: DbId): Promise<boolean>;

  /**
   * Check if a password reset is valid
   * @param token - The password reset token
   */
  isPasswordResetValid(token: string): Promise<boolean>;
}

/**
 * Password reset repository implementation
 */
export class PasswordResetRepositoryImpl
  extends ApiRepositoryImpl<
    typeof passwordResets,
    PasswordReset,
    NewPasswordReset,
    typeof selectPasswordResetSchema
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
   * Create a new password reset
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
    await this.invalidateAllUserPasswordResets(userId);

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
   * Invalidate all password resets for a user
   * @param userId - The user ID
   */
  async invalidateAllUserPasswordResets(userId: DbId): Promise<boolean> {
    const results = await db
      .delete(passwordResets)
      .where(eq(passwordResets.userId, userId))
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
}

/**
 * Password reset repository singleton instance
 */
export const passwordResetRepository = new PasswordResetRepositoryImpl();
