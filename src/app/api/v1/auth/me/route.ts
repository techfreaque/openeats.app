import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import meEndpoint from "./definition";
import { getUser } from "./route-handler/get-me";
import { updateUser } from "./route-handler/update-me";

/**
 * Auth API route handlers
 * Provides user authentication and profile management
 */

/**
 * GET handler for retrieving current user information
 */
export const GET = apiHandler({
  endpoint: meEndpoint.GET,
  handler: getUser,
  email: undefined,
});

/**
 * POST handler for updating current user information
 */
export const POST = apiHandler({
  endpoint: meEndpoint.POST,
  handler: updateUser,
  email: undefined,
});
