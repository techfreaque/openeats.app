import "server-only";

import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { hashPassword } from "../register/route";
import { verifyPasswordResetToken } from "../reset-password/utils";
import resetPasswordConfirmEndpoint from "./definition";
import { renderResetPasswordConfirmMail } from "./email";
import type { ResetPasswordConfirmType } from "./schema";
import { findUserByEmailAndId, updateUserPassword } from "./user.repository";

/**
 * Reset Password Confirm API route handler
 * Provides password reset confirmation functionality
 */

/**
 * POST handler for password reset confirmation
 */
export const POST = apiHandler({
  endpoint: resetPasswordConfirmEndpoint.POST,
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
    const resetPayload = await verifyPasswordResetToken(data.token);
    if (!resetPayload?.email || !resetPayload.userId) {
      debugLogger("Invalid or expired token", { email: data.email });
      return {
        success: false,
        message:
          "Invalid or expired token. Please request a new password reset.",
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
        errorCode: 400,
      };
    }

    // Find the user
    const user = await findUserByEmailAndId(
      resetPayload.email,
      resetPayload.userId,
    );

    if (!user) {
      debugLogger("User not found in password reset confirm", {
        userId: resetPayload.userId,
        email: resetPayload.email,
      });
      return {
        success: false,
        message: "User not found or the link was already used",
        errorCode: 404,
      };
    }

    // Hash the new password
    const hashedPassword = await hashPassword(data.password);

    // Update the user's password
    const updateResult = await updateUserPassword(user.id, hashedPassword);

    if (!updateResult) {
      return {
        success: false,
        message: "Failed to update password",
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
      errorCode: 500,
    };
  }
}
