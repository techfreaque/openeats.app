import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import { createMenuItem, getMenuItems } from "./route-handler";

/**
 * Menu Items API route handlers
 * Provides menu items management functionality
 */

/**
 * GET handler for retrieving all menu items
 */
export const GET = apiHandler({
  endpoint: definitions.GET,
  handler: getMenuItems,
  email: {}, // No emails for this endpoint
});

/**
 * POST handler for creating a new menu item
 */
export const POST = apiHandler({
  endpoint: definitions.POST,
  handler: createMenuItem,
  email: {}, // No emails for this endpoint
});

/**
 * POST handler for searching menu items
 * This is implemented as a separate endpoint at /api/v1/menu-items/search
 */
