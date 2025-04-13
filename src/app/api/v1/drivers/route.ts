import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import { createDriver, getDrivers, updateDriver } from "./route-handler";

/**
 * Driver API route handlers
 * Provides driver management functionality
 */

/**
 * GET handler for retrieving all drivers
 */
export const GET = apiHandler({
  endpoint: definitions.GET,
  handler: getDrivers,
  email: undefined,
});

/**
 * POST handler for creating a new driver
 */
export const POST = apiHandler({
  endpoint: definitions.POST,
  handler: createDriver,
  email: undefined,
});

/**
 * PUT handler for updating a driver
 */
export const PUT = apiHandler({
  endpoint: definitions.PUT,
  handler: updateDriver,
  email: undefined,
});
