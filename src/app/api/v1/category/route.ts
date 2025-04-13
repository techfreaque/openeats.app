import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import {
  createCategory,
  getCategories,
  updateCategory,
} from "./route-handler.new";

/**
 * Category API route handlers
 * Provides category management functionality
 */

/**
 * GET handler for retrieving all categories
 */
export const GET = apiHandler({
  endpoint: definitions.GET,
  handler: getCategories,
  email: {}, // No emails for this endpoint
});

/**
 * POST handler for creating a new category
 */
export const POST = apiHandler({
  endpoint: definitions.POST,
  handler: createCategory,
  email: {}, // No emails for this endpoint
});

/**
 * PUT handler for updating a category
 */
export const PUT = apiHandler({
  endpoint: definitions.PUT,
  handler: updateCategory,
  email: {}, // No emails for this endpoint
});
