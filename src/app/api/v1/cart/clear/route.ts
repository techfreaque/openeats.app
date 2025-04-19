import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import cartEndpoints from "../definition";
import { deleteCart } from "../route-handler";

/**
 * DELETE handler for clearing the cart
 */
export const DELETE = apiHandler({
  endpoint: cartEndpoints.DELETE,
  handler: deleteCart,
  email: {}, // No emails for DELETE requests
});
