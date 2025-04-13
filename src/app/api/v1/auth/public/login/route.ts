import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import loginEndpoint from "./definition";
import { loginUser } from "./route-handler";

/**
 * Login API route handler
 * Provides user authentication functionality
 */

/**
 * POST handler for user login
 */
export const POST = apiHandler({
  endpoint: loginEndpoint.POST,
  handler: loginUser,
  email: {}, // No emails for this endpoint
});
