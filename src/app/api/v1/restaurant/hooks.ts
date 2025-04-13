import { useApiForm } from "next-vibe/client/hooks/mutation-form";
import { useApiQuery } from "next-vibe/client/hooks/query";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { useEffect } from "react";

import restaurantEndpoint from "./definition";
import type {
  RestaurantGetType,
  RestaurantResponseType,
  RestaurantUpdateType,
} from "./schema/restaurant.schema";

/**
 * Hook to fetch restaurant data by ID
 * @param restaurantId - The ID of the restaurant to fetch
 * @returns Query result with restaurant data
 */
export function useRestaurant(restaurantId: string) {
  const typedEndpoint = restaurantEndpoint.GET as unknown as typeof restaurantEndpoint.GET;
  
  return useApiQuery<
    RestaurantGetType, 
    RestaurantResponseType, 
    UndefinedType, 
    "default"
  >(
    typedEndpoint,
    {
      restaurantId,
    },
    undefined,
    {
      enabled: Boolean(restaurantId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export type UseRestaurantReturn = ReturnType<typeof useRestaurant>;

/**
 * Hook to create a form pre-filled with restaurant data
 * @param restaurantId - The ID of the restaurant to edit
 * @returns Form methods and state for editing a restaurant
 */
export function useRestaurantForm(restaurantId: string) {
  const restaurant = useRestaurant(restaurantId);
  
  const typedEndpoint = restaurantEndpoint.POST as unknown as typeof restaurantEndpoint.POST;
  
  const formData = useApiForm<
    RestaurantUpdateType, 
    RestaurantResponseType, 
    UndefinedType, 
    "default"
  >(
    typedEndpoint,
    {
      defaultValues: restaurant.data ? {
        ...restaurant.data,
        mainCategoryId: restaurant.data.mainCategory?.id,
      } : undefined
    }
  );
  
  useEffect(() => {
    if (restaurant.data) {
      const formValues = {
        ...restaurant.data,
        mainCategoryId: restaurant.data.mainCategory?.id,
      };
      formData.form.reset(formValues as RestaurantUpdateType);
    }
  }, [formData.form, restaurant.data]);

  return formData;
}
