import "server-only";

import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { debugLogger } from "next-vibe/shared/utils/logger";

import resetPasswordEndpoint from "./definition";
import { passwordResetService } from "./reset-password.service";
import type { ResetPasswordRequestType } from "./schema";

/**
 * Reset Password API route handler
 * Provides password reset functionality
 */

/**
 * POST handler for password reset request
 */
// Create a properly typed handler
const resetPasswordHandler = apiHandler({
  endpoint: resetPasswordEndpoint.POST,
  handler: handleResetPasswordRequest,
  email: {}, // Email sending is handled by the service
});

/**
 * PUT handler for password reset confirmation
 */
const resetPasswordConfirmHandler = apiHandler({
  endpoint: resetPasswordEndpoint.PUT,
  handler: handleResetPasswordConfirm,
  email: {}, // No emails for this endpoint
});

/**
 * GET handler for password reset token validation
 */
const resetPasswordValidateHandler = apiHandler({
  endpoint: resetPasswordEndpoint.GET,
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
    await passwordResetService.createPasswordResetToken(data.email);

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
}: ApiHandlerProps<
  { token: string; password: string },
  UndefinedType
>): Promise<ApiHandlerResult<string>> {
  try {
    debugLogger("Password reset confirmation received", { token: data.token });

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
      data: "Password reset successfully",
    };
  } catch (error) {
    debugLogger("Error processing password reset confirmation", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error processing request",
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
}: ApiHandlerProps<{ token: string }, UndefinedType>): Promise<
  ApiHandlerResult<string>
> {
  try {
    debugLogger("Password reset token validation received", {
      token: data.token,
    });

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
    };
  }
}
