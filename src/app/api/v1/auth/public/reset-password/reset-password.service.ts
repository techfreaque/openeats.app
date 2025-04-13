/**
 * Password reset service
 * Provides business logic for password reset operations
 */

import { hash } from "bcrypt";
import { randomBytes } from "crypto";

import type { DbId } from "next-vibe/server/db/types";

import { userRepository } from "../../me/users.repository";
import { passwordResetRepository } from "./reset-password.repository";

/**
 * Password reset service interface
 */
export interface PasswordResetService {
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
 * Password reset service implementation
 */
export class PasswordResetServiceImpl implements PasswordResetService {
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

    // Generate a random token
    const token = randomBytes(32).toString("hex");

    // Set the expiration date (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create the password reset
    await passwordResetRepository.createPasswordReset(
      user.id,
      token,
      expiresAt,
    );

    return token;
  }

  /**
   * Reset a user's password
   * @param token - The password reset token
   * @param newPassword - The new password
   * @returns True if the password was reset successfully, false otherwise
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Find the password reset by token
    const passwordReset = await passwordResetRepository.findValidByToken(token);
    if (!passwordReset) {
      return false;
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update the user's password
    const user = await userRepository.update(passwordReset.userId, {
      password: hashedPassword,
      updatedAt: new Date(),
    });

    if (!user) {
      return false;
    }

    // Invalidate the password reset
    await passwordResetRepository.invalidatePasswordReset(token);

    return true;
  }

  /**
   * Validate a password reset token
   * @param token - The password reset token
   * @returns The user ID if the token is valid, undefined otherwise
   */
  async validatePasswordResetToken(token: string): Promise<DbId | undefined> {
    const passwordReset = await passwordResetRepository.findValidByToken(token);
    return passwordReset?.userId;
  }
}

/**
 * Password reset service singleton instance
 */
export const passwordResetService = new PasswordResetServiceImpl();
