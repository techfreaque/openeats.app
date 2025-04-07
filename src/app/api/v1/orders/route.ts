import "next-vibe/server/utils/server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import { getOrders } from "./route-handler";

export const GET = apiHandler({
  endpoint: definitions.GET,
  email: undefined,
  handler: getOrders,
});
