import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "../definition";
import { deleteCategory, toggleCategoryPublished } from "../route-handler.new";

/**
 * Category API route handlers for specific category ID
 * Provides category management functionality for a specific category
 */

/**
 * DELETE handler for deleting a category
 */
export const DELETE = apiHandler({
  endpoint: definitions.DELETE,
  handler: deleteCategory,
  email: {}, // No emails for this endpoint
});

/**
 * PATCH handler for toggling category published status
 */
export const PATCH = apiHandler({
  endpoint: definitions.PATCH,
  handler: toggleCategoryPublished,
  email: {}, // No emails for this endpoint
});
