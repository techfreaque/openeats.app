import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import listUisEndpoint from "./definition";
import { listUis } from "./route-handler";

/**
 * Website Editor UI List API route handlers
 * Provides UI list functionality
 */

/**
 * GET handler for listing UI components
 */
export const GET = apiHandler({
  endpoint: listUisEndpoint.GET,
  handler: listUis,
  email: undefined,
});
