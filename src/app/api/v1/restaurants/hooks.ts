import { useApiQueryForm } from "next-vibe/client/hooks/query-form";
import { useApiQuery } from "next-vibe/client/hooks/query";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";

import restaurantsEndpoint from "./definition";
import type { RestaurantsResponseType, RestaurantsSearchType } from "./schema";

/**
 * Hook to fetch and filter restaurants
 * Uses debounced query form to prevent excessive API calls
 */
export function useRestaurants() {
  return useApiQueryForm<
    RestaurantsSearchType,
    RestaurantsResponseType,
    UndefinedType
  >(restaurantsEndpoint.POST, undefined, {
    debounceMs: 800,
  });
}

/**
 * Hook to fetch restaurants with fixed parameters
 * Useful for getting restaurants without user input
 */
export function useRestaurantsQuery(params: Partial<RestaurantsSearchType>) {
  return useApiQuery(
    restaurantsEndpoint.POST,
    {
      page: 1,
      limit: 30,
      ...params,
    },
    undefined,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}
