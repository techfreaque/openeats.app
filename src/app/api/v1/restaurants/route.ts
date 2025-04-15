import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";

import { apiHandler } from "@/packages/next-vibe/server/endpoints/core/api-handler";

import restaurantsEndpoint from "./definition";
import { getRestaurants } from "./route-handler";
import type {
  RestaurantsResponseType,
  RestaurantsSearchOutputType,
} from "./schema";

/**
 * POST handler for searching restaurants
 */
export const POST = apiHandler({
  endpoint: restaurantsEndpoint.POST,
  handler: getRestaurants as ApiHandlerFunction<
    RestaurantsSearchOutputType,
    RestaurantsResponseType,
    UndefinedType
  >,
  email: undefined,
});
