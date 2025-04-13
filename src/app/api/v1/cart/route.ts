import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import { createCart, deleteCart, getCart, updateCart } from "./route-handler";

export const GET = apiHandler({
  endpoint: definitions.GET,
  handler: getCart,
  email: undefined,
});

export const POST = apiHandler({
  endpoint: definitions.POST,
  handler: createCart,
  email: undefined,
});

export const PUT = apiHandler({
  endpoint: definitions.PUT,
  handler: updateCart,
  email: undefined,
});

export const DELETE = apiHandler({
  endpoint: definitions.DELETE,
  handler: deleteCart,
  email: undefined,
});
