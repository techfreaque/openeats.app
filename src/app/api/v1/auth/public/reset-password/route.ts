import "server-only";

import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";
import { ErrorResponseTypes } from "next-vibe/shared";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { passwordResetRepository, userRepository } from "../../repository";
import {
  resetPasswordConfirm,
  resetPasswordRequest,
  resetPasswordValidate,
} from "./definition";
import { renderResetPasswordMail } from "./email";
import { renderResetPasswordConfirmMail } from "./email-confirm";
import type {
  ResetPasswordConfirmType,
  ResetPasswordRequestType,
  ResetPasswordValidateType,
} from "./schema";

/**
 * Reset Password API route handler
 * Provides password reset functionality
 */

/**
 * POST handler for password reset request
 */
const resetPasswordHandler = apiHandler({
  endpoint: resetPasswordRequest,
  handler: handleResetPasswordRequest,
  email: {
    afterHandlerEmails: [
      {
        render: renderResetPasswordMail,
        ignoreErrors: true,
      },
    ],
  },
});

/**
 * PUT handler for password reset confirmation
 */
const resetPasswordConfirmHandler = apiHandler({
  endpoint: resetPasswordConfirm,
  handler: handleResetPasswordConfirm,
  email: {
    afterHandlerEmails: [
      {
        render: renderResetPasswordConfirmMail,
        ignoreErrors: false,
      },
    ],
  },
});

/**
 * GET handler for password reset token validation
 */
const resetPasswordValidateHandler = apiHandler({
  endpoint: resetPasswordValidate,
  handler: handleResetPasswordValidate,
  email: {}, // No emails for this endpoint
});

// Export the handlers
export const POST = resetPasswordHandler;
export const PUT = resetPasswordConfirmHandler;
export const GET = resetPasswordValidateHandler;

/**
 * Handle password reset request
 * @param props - API handler props
 * @returns Success message
 */
async function handleResetPasswordRequest({
  data,
}: ApiHandlerProps<ResetPasswordRequestType, UndefinedType>): Promise<
  ApiHandlerResult<string>
> {
  try {
    debugLogger("Password reset request received", { email: data.email });

    // Create a password reset token
    await passwordResetRepository.createPasswordResetToken(data.email);

    // We don't want to reveal if the email exists or not for security reasons
    // So we always return a success message
    return {
      success: true,
      data: "Password reset email sent! Please check your inbox.",
    };
  } catch (error) {
    debugLogger("Error processing password reset request", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error processing request",
      errorCode: 500,
      errorType: ErrorResponseTypes.INTERNAL_ERROR,
    };
  }
}

/**
 * Handle password reset confirmation
 * @param props - API handler props
 * @returns Success message
 */
async function handleResetPasswordConfirm({
  data,
}: ApiHandlerProps<ResetPasswordConfirmType, UndefinedType>): Promise<
  ApiHandlerResult<string>
> {
  try {
    debugLogger("Processing password reset confirmation", {
      email: data.email,
    });

    // Verify the reset token
    const resetPayload = await passwordResetRepository.verifyJwtToken(
      data.token,
    );
    if (!resetPayload?.email || !resetPayload.userId) {
      debugLogger("Invalid or expired token", { email: data.email });
      return {
        success: false,
        message:
          "Invalid or expired token. Please request a new password reset.",
        errorType: ErrorResponseTypes.TOKEN_EXPIRED_ERROR,
        errorCode: 400,
      };
    }

    // Check if the email in the token matches the provided email
    if (resetPayload.email !== data.email) {
      debugLogger("Email mismatch in reset token", {
        tokenEmail: resetPayload.email,
        providedEmail: data.email,
      });
      return {
        success: false,
        message: "Email does not match the token. Please try again.",
        errorType: ErrorResponseTypes.VALIDATION_ERROR,
        errorCode: 400,
      };
    }

    // Find the user
    const user = await userRepository.findByEmail(resetPayload.email);

    if (!user || user.id !== resetPayload.userId) {
      debugLogger("User not found in password reset confirm", {
        userId: resetPayload.userId,
        email: resetPayload.email,
      });
      return {
        success: false,
        message: "User not found or the link was already used",
        errorType: ErrorResponseTypes.NOT_FOUND,
        errorCode: 404,
      };
    }

    // Update the user's password with the repository method that handles hashing
    const updatedUser = await userRepository.updatePassword(
      user.id,
      data.password,
    );

    if (!updatedUser) {
      return {
        success: false,
        message: "Failed to update password",
        errorType: ErrorResponseTypes.INTERNAL_ERROR,
        errorCode: 500,
      };
    }

    debugLogger("Password reset successful", {
      userId: user.id,
      email: user.email,
    });
    return {
      success: true,
      data: "Password has been reset successfully. You can now log in with your new password.",
    };
  } catch (error) {
    debugLogger("Error during password reset confirmation", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error during password reset",
      errorType: ErrorResponseTypes.HTTP_ERROR,
      errorCode: 500,
    };
  }
}

/**
 * Handle password reset token validation
 * @param props - API handler props
 * @returns Success message
 */
async function handleResetPasswordValidate({
  data,
}: ApiHandlerProps<ResetPasswordValidateType, UndefinedType>): Promise<
  ApiHandlerResult<string>
> {
  try {
    debugLogger("Password reset token validation received", {
      token: data.token,
    });

    // Validate the token
    const userId = await passwordResetRepository.validatePasswordResetToken(
      data.token,
    );

    if (!userId) {
      return {
        success: false,
        message: "Invalid or expired password reset token",
        errorCode: 400,
        errorType: ErrorResponseTypes.TOKEN_EXPIRED_ERROR,
      };
    }

    return {
      success: true,
      data: "Password reset token is valid",
    };
  } catch (error) {
    debugLogger("Error processing password reset token validation", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error processing request",
      errorCode: 500,
      errorType: ErrorResponseTypes.INTERNAL_ERROR,
    };
  }
}
