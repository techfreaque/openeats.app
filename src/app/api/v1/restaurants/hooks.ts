import { useApiQueryForm } from "next-vibe/client/hooks/query-form";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";

import restaurantsEndpoints from "./definition";
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
  >(restaurantsEndpoints.POST, undefined, {
    debounceMs: 800,
  });
}
