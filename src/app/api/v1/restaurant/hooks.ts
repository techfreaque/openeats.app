import { useApiForm } from "next-vibe/client/hooks/mutation-form";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { useCallback, useEffect, useMemo } from "react";

import restaurantEndpoint from "./definition";
import type { RestaurantUpdateType } from "./schema/restaurant.schema";

/**
 * Hook to fetch restaurant data by ID
 * @param restaurantId - The ID of the restaurant to fetch
 * @returns Query result with restaurant data
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRestaurant(restaurantId: string) {
  // Use a stable query key to improve caching
  const queryKey = [`restaurant-${restaurantId}`];

  const result = useApiQuery(
    restaurantEndpoint.GET,
    {
      restaurantId,
    },
    undefined,
    {
      enabled: Boolean(restaurantId),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      queryKey, // Use the stable query key
      // Disable refetching on window focus to prevent unnecessary API calls
      refreshDelay: 1000, // Add a delay to prevent rapid refetches
    },
  );

  // Transform the result to return a single restaurant instead of an array
  // Use useMemo to prevent unnecessary re-renders
  const data = useMemo(() => {
    return Array.isArray(result.data) && result.data.length > 0 ? result.data[0] : undefined;
  }, [result.data]);

  return {
    ...result,
    data,
  };
}

export type UseRestaurantReturn = ReturnType<typeof useRestaurant>;
/**
 * Hook to create a form pre-filled with restaurant data
 * @param restaurantId - The ID of the restaurant to edit
 * @returns Form methods and state for editing a restaurant
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRestaurantForm(restaurantId: string) {
  const restaurant = useRestaurant(restaurantId);

  const formData = useApiForm(restaurantEndpoint.POST, {
    defaultValues: restaurant.data
      ? {
          ...restaurant.data,
          mainCategoryId: restaurant.data.mainCategory?.id,
        }
      : undefined,
  });

  useEffect(() => {
    if (restaurant.data) {
      const formValues: RestaurantUpdateType = {
        ...restaurant.data,
        mainCategoryId: restaurant.data.mainCategory?.id,
      };
      formData.form.reset(formValues);
    }
  }, [formData.form, restaurant.data]);

  return formData;
}
