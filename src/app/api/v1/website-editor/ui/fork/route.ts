import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import forkUiEndpoint from "./definition";
import { forkUi } from "./route-handler";

/**
 * Website Editor UI Fork API route handlers
 * Provides UI fork functionality
 */

/**
 * POST handler for forking a UI component
 */
export const POST = apiHandler({
  endpoint: forkUiEndpoint.POST,
  handler: forkUi,
  email: undefined,
});
