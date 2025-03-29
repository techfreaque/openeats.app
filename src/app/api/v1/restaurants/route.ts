import { apiHandler } from "@/packages/next-vibe/server/endpoints/core/api-handler";

import restaurantsEndpoint from "./definition";
import { getRestaurants } from "./route-handler";

export const GET = apiHandler({
  endpoint: restaurantsEndpoint.GET,
  handler: getRestaurants,
  email: undefined,
});
