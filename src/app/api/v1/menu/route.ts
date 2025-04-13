import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import { createMenuItem, getMenuItems } from "./route-handler";

/**
 * Menu API route handlers
 * Provides menu management functionality
 */

/**
 * GET handler for retrieving menu items
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
