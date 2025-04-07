import { useApiQueryForm } from "next-vibe/client/hooks/query-form";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";

import restaurantsEndpoints from "./definition";
import type { RestaurantsResponseType, RestaurantsSearchType } from "./schema";

export type UseRestaurantsReturn = ReturnType<typeof useRestaurants>;
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRestaurants() {
  return useApiQueryForm<
    RestaurantsSearchType,
    RestaurantsResponseType,
    UndefinedType
  >(restaurantsEndpoints.POST, undefined);
}
