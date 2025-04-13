import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import sendEndpoint from "./definition";
import { sendNotification } from "./route-handler";

/**
 * POST handler for sending notifications
 * This endpoint sends a notification to all clients subscribed to a channel
 */
export const POST = apiHandler({
  endpoint: sendEndpoint,
  email: {},
  handler: sendNotification,
});
