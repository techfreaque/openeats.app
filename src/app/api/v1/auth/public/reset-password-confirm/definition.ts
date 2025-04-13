import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { messageResponseSchema } from "next-vibe/shared/types/response.schema";

import { resetPasswordConfirmSchema } from "./schema";

/**
 * Reset Password Confirm API endpoint definition
 * Provides password reset confirmation functionality
 */

/**
 * Reset Password Confirm endpoint definition
 */
const resetPasswordConfirmEndpoint = createEndpoint({
  description: "Confirm a password reset request",
  method: Methods.POST,
  path: ["v1", "auth", "public", "reset-password-confirm"],
  requestSchema: resetPasswordConfirmSchema,
  responseSchema: messageResponseSchema,
  requestUrlSchema: undefinedSchema,
  apiQueryOptions: {
    queryKey: ["reset-password-confirm"],
    // Don't cache password reset confirmation requests
    staleTime: 0,
  },
  fieldDescriptions: {
    token: "Password reset token received via email",
    email: "Email address associated with the account",
    password: "New password (min 8 characters)",
    confirmPassword: "Confirm new password (must match password)",
  },
  errorCodes: {
    400: "Invalid request data or token",
    404: "User not found or token already used",
    500: "Internal server error",
  },
  allowedRoles: [UserRoleValue.PUBLIC],
  examples: {
    payloads: {
      default: {
        email: "user@example.com",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        password: "newpassword123",
        confirmPassword: "newpassword123",
      },
    },
    urlPathVariables: undefined,
    responses: {
      default:
        "Password has been reset successfully. You can now log in with your new password.",
    },
  },
});

/**
 * Reset Password Confirm API endpoints
 */
const definition = {
  POST: resetPasswordConfirmEndpoint,
};

export default definition;
