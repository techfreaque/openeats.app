import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import { renderOrderCreateMail } from "./email";
import { createOrder } from "./route-handler";

/**
 * Order API route handlers
 * Provides order creation functionality
 */

/**
 * POST handler for creating a new order
 */
export const POST = apiHandler({
  endpoint: definitions.POST,
  handler: createOrder,
  email: {
    afterHandlerEmails: [
      {
        render: renderOrderCreateMail,
        ignoreErrors: false,
      },
    ],
  },
});
