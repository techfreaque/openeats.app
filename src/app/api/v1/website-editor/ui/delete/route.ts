import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import deleteUiEndpoint from "./definition";
import { deleteUi } from "./route-handler";

/**
 * Website Editor UI Delete API route handlers
 * Provides UI delete functionality
 */

/**
 * DELETE handler for deleting a UI component
 */
export const DELETE = apiHandler({
  endpoint: deleteUiEndpoint.DELETE,
  handler: deleteUi,
  email: undefined,
});
