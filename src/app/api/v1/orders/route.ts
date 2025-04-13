import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import { getOrders } from "./route-handler.new";

/**
 * Orders API route handlers
 * Provides order listing functionality
 */

/**
 * GET handler for retrieving orders
 */
export const GET = apiHandler({
  endpoint: definitions.GET,
  handler: getOrders,
  email: {}, // No emails for this endpoint
});
