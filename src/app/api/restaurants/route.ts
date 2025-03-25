import { restaurantsEndpoint } from "@/client-package/schema/api/v1/restaurant/restaurants";
import { apiHandler } from "@/next-portal/api/api-handler";

import { getRestaurants } from "../v1/restaurant/restaurants";

export const GET = apiHandler({
  endpoint: restaurantsEndpoint,
  handler: getRestaurants,
});
