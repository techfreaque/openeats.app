import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import uiDetailEndpoint from "./definition";
import { getUiDetail } from "./route-handler";

/**
 * Website Editor UI Detail API route handlers
 * Provides UI detail functionality
 */

/**
 * GET handler for retrieving UI details by ID
 */
export const GET = apiHandler({
  endpoint: uiDetailEndpoint.GET,
  handler: getUiDetail,
  email: undefined,
});
