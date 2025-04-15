import { useApiForm } from "next-vibe/client/hooks/mutation-form";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useEffect } from "react";

import restaurantEndpoint from "./definition";
import type { RestaurantUpdateType } from "./schema/restaurant.schema";

/**
 * Hook to fetch restaurant data by ID
 * @param restaurantId - The ID of the restaurant to fetch
 * @returns Query result with restaurant data
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRestaurant(restaurantId: string) {
  return useApiQuery(
    restaurantEndpoint.GET,
    {
      restaurantId,
    },
    undefined,
    {
      enabled: Boolean(restaurantId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );
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
