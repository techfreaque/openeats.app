import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import { renderCartEmail } from "./email";
import { createCart, deleteCart, getCart, updateCart } from "./route-handler";

/**
 * Cart API route handlers
 * This file connects the API endpoints with their handlers and email functionality
 */

/**
 * GET handler for retrieving cart items
 */
export const GET = apiHandler({
  endpoint: definitions.GET,
  handler: getCart,
  email: {}, // No emails for GET requests
});

/**
 * POST handler for adding items to cart
 */
export const POST = apiHandler({
  endpoint: definitions.POST,
  handler: createCart,
  email: {
    afterHandlerEmails: [
      {
        render: renderCartEmail,
        ignoreErrors: true, // Ignore email errors for cart operations
      },
    ],
  },
});

/**
 * PUT handler for updating cart items
 */
export const PUT = apiHandler({
  endpoint: definitions.PUT,
  handler: updateCart,
  email: {
    afterHandlerEmails: [
      {
        render: renderCartEmail,
        ignoreErrors: true, // Ignore email errors for cart operations
      },
    ],
  },
});

/**
 * DELETE handler for removing cart items
 */
export const DELETE = apiHandler({
  endpoint: definitions.DELETE,
  handler: deleteCart,
  email: {}, // No emails for DELETE requests
});
