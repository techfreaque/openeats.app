import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import uiEndpoint from "./definition";
import { deleteUi, updateUi } from "./route-handler";

/**
 * Website Editor UI API route handlers
 * Provides UI component management functionality
 */

/**
 * PUT handler for updating a UI component
 */
export const PUT = apiHandler({
  endpoint: uiEndpoint.PUT,
  handler: updateUi,
  email: undefined,
});

/**
 * DELETE handler for deleting a UI component
 */
export const DELETE = apiHandler({
  endpoint: uiEndpoint.DELETE,
  handler: deleteUi,
  email: undefined,
});
