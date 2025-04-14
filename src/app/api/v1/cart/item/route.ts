import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import cartEndpoints from "../definition";
import { removeCartItem } from "../route-handler";

/**
 * DELETE handler for removing a cart item
 */
export const DELETE = apiHandler({
  endpoint: cartEndpoints.DELETE,
  handler: removeCartItem,
  email: {}, // No emails for DELETE requests
});
