import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { messageResponseSchema } from "next-vibe/shared/types/response.schema";
import { z } from "zod";

import { resetPasswordRequestSchema } from "./schema";

/**
 * Reset Password API endpoint definition
 * Provides password reset functionality
 */

/**
 * Reset Password endpoint definition
 */
const resetPasswordEndpoint = createEndpoint({
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
 * Reset Password confirmation endpoint definition
 */
const resetPasswordConfirmEndpoint = createEndpoint({
  description: "Confirm a password reset",
  method: Methods.PUT,
  path: ["v1", "auth", "public", "reset-password"],
  requestSchema: z.object({
    token: z.string(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
  }),
  responseSchema: messageResponseSchema,
  requestUrlSchema: undefinedSchema,
  apiQueryOptions: {
    queryKey: ["reset-password-confirm"],
    // Don't cache password reset confirmations
    staleTime: 0,
  },
  fieldDescriptions: {
    token: "Password reset token",
    password: "New password",
  },
  errorCodes: {
    400: "Invalid token or password",
    500: "Internal server error",
  },
  allowedRoles: [UserRoleValue.PUBLIC],
  examples: {
    payloads: {
      default: {
        token: "abc123",
        password: "newPassword123",
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: "Password reset successfully",
    },
  },
});

/**
 * Reset Password validation endpoint definition
 */
const resetPasswordValidateEndpoint = createEndpoint({
  description: "Validate a password reset token",
  method: Methods.GET,
  path: ["v1", "auth", "public", "reset-password"],
  requestSchema: z.object({
    token: z.string(),
  }),
  responseSchema: messageResponseSchema,
  requestUrlSchema: undefinedSchema,
  apiQueryOptions: {
    queryKey: ["reset-password-validate"],
    // Don't cache password reset validations
    staleTime: 0,
  },
  fieldDescriptions: {
    token: "Password reset token",
  },
  errorCodes: {
    400: "Invalid token",
    500: "Internal server error",
  },
  allowedRoles: [UserRoleValue.PUBLIC],
  examples: {
    payloads: {
      default: {
        token: "abc123",
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
const definition = {
  POST: resetPasswordEndpoint,
  PUT: resetPasswordConfirmEndpoint,
  GET: resetPasswordValidateEndpoint,
};

export default definition;

/**
 * Export definitions for use in other files
 */
export const definitions = definition;
