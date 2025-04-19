import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useCallback, useMemo } from "react";

import restaurantConfigEndpoint from "./definition";
import type { RestaurantConfigType } from "./restaurant-config.schema";

/**
 * Hook to fetch restaurant configuration
 * @param restaurantId - The ID of the restaurant
 * @returns Query result with restaurant configuration
 */
export function useRestaurantConfig(restaurantId: string) {
  // Create a stable query key based on the restaurantId
  const queryKey = useMemo(() => {
    return ['restaurant-config', restaurantId || 'none'];
  }, [restaurantId]);

  return useApiQuery(
    restaurantConfigEndpoint.GET,
    { restaurantId },
    undefined,
    {
      enabled: Boolean(restaurantId),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      queryKey,
      refreshDelay: 1000, // Add a delay to prevent rapid refetches
    },
  );
}

/**
 * Hook to update restaurant configuration
 * @returns Mutation for updating restaurant configuration
 */
export function useUpdateRestaurantConfig() {
  const mutation = useApiMutation(restaurantConfigEndpoint.PUT);

  const updateConfig = useCallback(
    async (config: RestaurantConfigType) => {
      const result = await mutation.mutateAsync(config);
      return result;
    },
    [mutation],
  );

  return {
    updateConfig,
    ...mutation,
  };
}
