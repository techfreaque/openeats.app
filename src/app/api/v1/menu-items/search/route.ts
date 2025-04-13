import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "../definition";
import { searchMenuItems } from "../route-handler";

/**
 * Menu Items Search API route handler
 * Provides menu items search functionality
 */

/**
 * POST handler for searching menu items
 */
export const POST = apiHandler({
  endpoint: definitions.POST,
  handler: searchMenuItems,
  email: {}, // No emails for this endpoint
});
