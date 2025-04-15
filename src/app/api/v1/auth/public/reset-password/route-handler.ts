/**
 * Password reset route handler
 * Handles password reset requests and confirmations
 */

import "server-only";

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { type MessageResponseType } from "next-vibe/shared";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { debugLogger } from "next-vibe/shared/utils/logger";

import type { ResetPasswordRequestType } from "./schema";

/**
 * Request a password reset
 * @param data - The request data containing the user's email
 * @returns A success response or an error response
 */
export const requestPasswordReset: ApiHandlerFunction<
  ResetPasswordRequestType,
  MessageResponseType,
  UndefinedType
> = ({ data }) => {
  debugLogger("Password reset requested", { email: data.email });

  // password reset token gets created in the mail

  // If the user doesn't exist
  // We don't want to reveal this information, so we return a success response anyway
  return {
    success: true,
    data: "If your email is registered, you will receive a password reset link",
  };
};
