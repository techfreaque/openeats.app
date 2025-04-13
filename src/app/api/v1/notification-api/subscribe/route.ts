import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import subscribeEndpoint from "./definition";
import { subscribeToChannels } from "./route-handler";

/**
 * POST handler for subscribing to notifications
 * This endpoint provides information about how to connect to the WebSocket server
 */
export const POST = apiHandler({
  endpoint: subscribeEndpoint,
  email: {},
  handler: subscribeToChannels,
});
