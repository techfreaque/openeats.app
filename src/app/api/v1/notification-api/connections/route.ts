import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import connectionsEndpoint from "./definition";
import { getConnections } from "./route-handler";

/**
 * GET handler for retrieving active connections
 * Admin-only endpoint to view all active WebSocket connections
 */
export const GET = apiHandler({
  endpoint: connectionsEndpoint,
  email: {},
  handler: getConnections,
});
