import "server-only";

import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";

const cookies = async () => ({
  delete: (name: string) => {
    console.log(`Deleting cookie: ${name}`);
  }
});
import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";
import { formatResponse } from "next-vibe/server/endpoints/core/api-response";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import type { MessageResponseType } from "next-vibe/shared/types/response.schema";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { SessionRepositoryImpl } from "../repository";

const sessionRepository = new SessionRepositoryImpl();
import logoutEndpoint from "./definition";

/**
 * Logout API route handler
 * Provides user logout functionality
 */

/**
 * GET handler for user logout
 */
export const GET = apiHandler({
  endpoint: logoutEndpoint.GET,
  handler: logoutUser,
  email: {}, // No emails for this endpoint
});

/**
 * Logout user handler
 * Clears auth cookies and removes sessions from database
 * @param props - API handler props
 * @returns Success message
 */
async function logoutUser({
  user,
}: ApiHandlerProps<UndefinedType, UndefinedType>): Promise<
  ApiHandlerResult<MessageResponseType>
> {
  try {
    debugLogger("Logging out user", { userId: user.id });

    // Clear auth cookie
    try {
      (await cookies()).delete("auth-token");
    } catch (error) {
      debugLogger("Error clearing auth cookie", error);
      // Continue even if cookie deletion fails
    }

    // Remove sessions from database
    try {
      await sessionRepository.deleteByUserId(user.id);
      debugLogger("Deleted user sessions", { userId: user.id });
    } catch (error) {
      errorLogger("Error deleting user sessions", error);
      // Continue even if session deletion fails
    }

    return formatResponse("Successfully signed out!");
  } catch (error) {
    errorLogger("Error during logout", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error during logout",
      errorCode: 500,
      data: undefined
    } as ApiHandlerResult<MessageResponseType>;
  }
}
