import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import subPromptEndpoint from "./definition";
import { createSubPrompt } from "./route-handler/create-subprompt";
import { getSubPrompt } from "./route-handler/get-subprompt";

/**
 * Website Editor Subprompt API route handlers
 * Provides subprompt management functionality
 */

/**
 * POST handler for creating a new subprompt
 */
export const POST = apiHandler({
  endpoint: subPromptEndpoint.POST,
  handler: createSubPrompt,
  email: undefined,
});

/**
 * GET handler for retrieving a subprompt by ID
 */
export const GET = apiHandler({
  endpoint: subPromptEndpoint.GET,
  handler: getSubPrompt,
  email: undefined,
});
