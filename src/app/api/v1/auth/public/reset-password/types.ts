/**
 * Password reset types
 * Defines the types for password reset operations
 */

/**
 * Password reset request schema
 * Used to request a password reset
 */
export interface PasswordResetRequestSchema {
  /**
   * The user's email
   */
  email: string;
}

/**
 * Password reset confirm schema
 * Used to confirm a password reset
 */
export interface PasswordResetConfirmSchema {
  /**
   * The password reset token
   */
  token: string;

  /**
   * The new password
   */
  password: string;
}

/**
 * Password reset token validation schema
 * Used to validate a password reset token
 */
export interface PasswordResetTokenValidationSchema {
  /**
   * The password reset token
   */
  token: string;
}
