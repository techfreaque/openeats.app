import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import aiChatEndpoint from "./definition";
import { postChat } from "./route-handler/post-chat";

/**
 * AI Chat API route handlers
 * Provides AI-assisted form filling functionality
 */

/**
 * POST handler for AI chat interactions
 */
export const POST = apiHandler({
  endpoint: aiChatEndpoint.POST,
  handler: postChat,
  email: undefined,
});
