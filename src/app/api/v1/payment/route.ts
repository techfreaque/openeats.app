import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import { processPayment } from "./route-handler";

/**
 * Payment API route handlers
 * Provides payment processing functionality
 */

/**
 * POST handler for processing payments
 */
export const POST = apiHandler({
  endpoint: definitions.POST,
  handler: processPayment,
  email: undefined,
});
