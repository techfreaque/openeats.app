import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import toggleLikeEndpoint from "./definition";
import { toggleLike } from "./route-handler";

/**
 * Website Editor UI Like API route handlers
 * Provides UI like functionality
 */

/**
 * POST handler for toggling a like on a UI component
 */
export const POST = apiHandler({
  endpoint: toggleLikeEndpoint.POST,
  handler: toggleLike,
  email: undefined,
});
