import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import { deleteMenuItem, getMenuItem, updateMenuItem } from "./route-handler";

/**
 * Menu Item Detail API route handlers
 * Provides menu item detail management functionality
 */

/**
 * GET handler for retrieving a specific menu item
 */
export const GET = apiHandler({
  endpoint: definitions.GET,
  handler: getMenuItem,
  email: {}, // No emails for this endpoint
});

/**
 * PUT handler for updating a menu item
 */
export const PUT = apiHandler({
  endpoint: definitions.PUT,
  handler: updateMenuItem,
  email: {}, // No emails for this endpoint
});

/**
 * DELETE handler for removing a menu item
 */
export const DELETE = apiHandler({
  endpoint: definitions.DELETE,
  handler: deleteMenuItem,
  email: {}, // No emails for this endpoint
});
