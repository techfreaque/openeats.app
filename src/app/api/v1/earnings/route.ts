import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import { createEarning, getEarnings } from "./route-handler";

/**
 * Earnings API route handlers
 * Provides driver earnings management functionality
 */

/**
 * GET handler for retrieving driver earnings
 */
export const GET = apiHandler({
  endpoint: definitions.GET,
  handler: getEarnings,
  email: undefined,
});

/**
 * POST handler for creating a new earning record
 */
export const POST = apiHandler({
  endpoint: definitions.POST,
  handler: createEarning,
  email: undefined,
});
