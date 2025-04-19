import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import codeEndpoint from "./definition";
import { getCode } from "./route-handler";

/**
 * Website Editor Code API route handlers
 * Provides code management functionality
 */

/**
 * GET handler for retrieving code by ID
 */
export const GET = apiHandler({
  endpoint: codeEndpoint.GET,
  handler: getCode,
  email: undefined,
});
