/**
 * Password reset route handler
 * Handles password reset requests and confirmations
 */

import "server-only";

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { passwordResetService } from "./reset-password.service";
import type {
  PasswordResetConfirmSchema,
  PasswordResetRequestSchema,
} from "./types";

/**
 * Request a password reset
 * @param data - The request data containing the user's email
 * @returns A success response or an error response
 */
export const requestPasswordReset: ApiHandlerFunction<
  PasswordResetRequestSchema,
  UndefinedType,
  UndefinedType
> = async ({ data }) => {
  try {
    debugLogger("Password reset requested", { email: data.email });

    // Create a password reset token
    const token = await passwordResetService.createPasswordResetToken(
      data.email,
    );

    // If the token is undefined, the user doesn't exist
    // We don't want to reveal this information, so we return a success response anyway
    return {
      success: true,
      message:
        "If your email is registered, you will receive a password reset link",
    };
  } catch (error) {
    debugLogger("Error requesting password reset", error);
    return {
      success: false,
      message: "Failed to request password reset",
      errorCode: 500,
    };
  }
};

/**
 * Confirm a password reset
 * @param data - The request data containing the token and new password
 * @returns A success response or an error response
 */
export const confirmPasswordReset: ApiHandlerFunction<
  PasswordResetConfirmSchema,
  UndefinedType,
  UndefinedType
> = async ({ data }) => {
  try {
    debugLogger("Password reset confirmation", { token: data.token });

    // Reset the password
    const success = await passwordResetService.resetPassword(
      data.token,
      data.password,
    );

    if (!success) {
      return {
        success: false,
        message: "Invalid or expired password reset token",
        errorCode: 400,
      };
    }

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    debugLogger("Error confirming password reset", error);
    return {
      success: false,
      message: "Failed to reset password",
      errorCode: 500,
    };
  }
};

/**
 * Validate a password reset token
 * @param data - The request data containing the token
 * @returns A success response or an error response
 */
export const validatePasswordResetToken: ApiHandlerFunction<
  { token: string },
  UndefinedType,
  UndefinedType
> = async ({ data }) => {
  try {
    debugLogger("Password reset token validation", { token: data.token });

    // Validate the token
    const userId = await passwordResetService.validatePasswordResetToken(
      data.token,
    );

    if (!userId) {
      return {
        success: false,
        message: "Invalid or expired password reset token",
        errorCode: 400,
      };
    }

    return {
      success: true,
      message: "Password reset token is valid",
    };
  } catch (error) {
    debugLogger("Error validating password reset token", error);
    return {
      success: false,
      message: "Failed to validate password reset token",
      errorCode: 500,
    };
  }
};
