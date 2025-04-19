import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import menuItemsEndpoints from "./definition";
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  updateMenuItem,
} from "./route-handler";

/**
 * Menu Items API route handlers
 * Provides menu items management functionality
 */

/**
 * GET handler for retrieving all menu items
 */
export const GET = apiHandler({
  endpoint: menuItemsEndpoints.GET,
  handler: getMenuItems,
  email: {}, // No emails for this endpoint
});

/**
 * POST handler for creating a new menu item
 */
export const POST = apiHandler({
  endpoint: menuItemsEndpoints.POST,
  handler: createMenuItem,
  email: {}, // No emails for this endpoint
});

/**
 * PUT handler for updating a menu item
 */
export const PUT = apiHandler({
  endpoint: menuItemsEndpoints.PUT,
  handler: updateMenuItem,
  email: {}, // No emails for this endpoint
});

/**
 * DELETE handler for deleting a menu item
 */
export const DELETE = apiHandler({
  endpoint: menuItemsEndpoints.DELETE,
  handler: deleteMenuItem,
  email: {}, // No emails for this endpoint
});

/**
 * Search endpoint is implemented at /api/v1/menu-items/search
 */
