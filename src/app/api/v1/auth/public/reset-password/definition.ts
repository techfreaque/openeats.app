import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { messageResponseSchema } from "next-vibe/shared/types/response.schema";

import {
  resetPasswordConfirmSchema,
  resetPasswordRequestSchema,
  resetPasswordValidateSchema,
} from "./schema";

/**
 * Reset Password API endpoint definition
 * Provides password reset functionality
 */

/**
 * Reset Password Request endpoint definition
 */
const resetPasswordRequestEndpoint = createEndpoint({
  description: "Send a password reset email",
  method: Methods.POST,
  path: ["v1", "auth", "public", "reset-password"],
  requestSchema: resetPasswordRequestSchema,
  responseSchema: messageResponseSchema,
  requestUrlSchema: undefinedSchema,
  apiQueryOptions: {
    queryKey: ["reset-password"],
    // Don't cache password reset requests
    staleTime: 0,
  },
  fieldDescriptions: {
    email: "Email address to send the reset link to",
  },
  errorCodes: {
    400: "Invalid request data",
    500: "Internal server error",
  },
  allowedRoles: [UserRoleValue.PUBLIC],
  examples: {
    payloads: {
      default: {
        email: "user@example.com",
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: "Password reset email sent! Please check your inbox.",
    },
  },
});

/**
 * Reset Password Confirm endpoint definition
 */
const resetPasswordConfirmEndpoint = createEndpoint({
  description: "Reset a password with a token",
  method: Methods.PUT,
  path: ["v1", "auth", "public", "reset-password"],
  requestSchema: resetPasswordConfirmSchema,
  responseSchema: messageResponseSchema,
  requestUrlSchema: undefinedSchema,
  apiQueryOptions: {
    queryKey: ["reset-password-confirm"],
    // Don't cache password reset confirmation requests
    staleTime: 0,
  },
  fieldDescriptions: {
    email: "Email address associated with the account",
    token: "Password reset token received via email",
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
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example",
        password: "newPassword123",
        confirmPassword: "newPassword123",
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
 * Reset Password Validate endpoint definition
 */
const resetPasswordValidateEndpoint = createEndpoint({
  description: "Validate a password reset token",
  method: Methods.GET,
  path: ["v1", "auth", "public", "reset-password"],
  requestSchema: resetPasswordValidateSchema,
  responseSchema: messageResponseSchema,
  requestUrlSchema: undefinedSchema,
  apiQueryOptions: {
    queryKey: ["reset-password-validate"],
    // Don't cache password reset validation requests
    staleTime: 0,
  },
  fieldDescriptions: {
    token: "Password reset token to validate",
  },
  errorCodes: {
    400: "Invalid token",
    500: "Internal server error",
  },
  allowedRoles: [UserRoleValue.PUBLIC],
  examples: {
    payloads: {
      default: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example",
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: "Password reset token is valid",
    },
  },
});

/**
 * Reset Password API endpoints
 */
const resetPasswordEndpoints = {
  POST: resetPasswordRequestEndpoint,
  PUT: resetPasswordConfirmEndpoint,
  GET: resetPasswordValidateEndpoint,
};

// Export individual endpoints for direct access
export const resetPasswordRequest = resetPasswordRequestEndpoint;
export const resetPasswordConfirm = resetPasswordConfirmEndpoint;
export const resetPasswordValidate = resetPasswordValidateEndpoint;

export default resetPasswordEndpoints;
