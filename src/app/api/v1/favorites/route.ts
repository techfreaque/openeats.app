import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import favoritesEndpoints from "./definition";
import { addFavorite, getFavorites, removeFavorite } from "./route-handler";

/**
 * GET handler for retrieving user favorites
 */
export const GET = apiHandler({
  endpoint: favoritesEndpoints.GET,
  handler: getFavorites,
  email: {}, // No emails for GET requests
});

/**
 * POST handler for adding a restaurant to favorites
 */
export const POST = apiHandler({
  endpoint: favoritesEndpoints.POST,
  handler: addFavorite,
  email: {}, // No emails for POST requests
});

/**
 * DELETE handler for removing a restaurant from favorites
 */
export const DELETE = apiHandler({
  endpoint: favoritesEndpoints.DELETE,
  handler: removeFavorite,
  email: {}, // No emails for DELETE requests
});
