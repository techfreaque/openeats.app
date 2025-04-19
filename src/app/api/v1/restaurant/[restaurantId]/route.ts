import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import restaurantEndpoint from "../definition";
import { getRestaurant } from "../route-handler";

/**
 * Restaurant API route handlers for specific restaurant ID
 * Provides restaurant management functionality for a specific restaurant
 */

/**
 * GET handler for retrieving a restaurant by ID
 */
export const GET = apiHandler({
  endpoint: restaurantEndpoint.GET,
  handler: getRestaurant,
  email: {}, // No emails for this endpoint
});
