import { apiHandler } from "@/packages/next-vibe/server/endpoints/core/api-handler";

import restaurantsEndpoint from "./definition";
import { getRestaurants } from "./route-handler";

/**
 * POST handler for searching restaurants
 */
export const POST = apiHandler({
  endpoint: restaurantsEndpoint.POST,
  handler: getRestaurants,
  email: undefined,
});
