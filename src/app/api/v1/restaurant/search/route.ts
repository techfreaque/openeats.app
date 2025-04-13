import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "../definition";
import { searchRestaurants } from "../route-handler";

/**
 * Restaurant Search API route handler
 * Provides restaurant search functionality
 */

/**
 * POST handler for searching restaurants
 */
export const POST = apiHandler({
  endpoint: definitions.POST,
  handler: searchRestaurants,
  email: {}, // No emails for this endpoint
});
