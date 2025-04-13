import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import { scanMenu } from "./route-handler";

/**
 * Menu Scanner API route handlers
 * Provides menu scanning functionality using AI
 */

/**
 * POST handler for scanning menu images
 */
export const POST = apiHandler({
  endpoint: definitions.POST,
  handler: scanMenu,
  email: undefined,
});
