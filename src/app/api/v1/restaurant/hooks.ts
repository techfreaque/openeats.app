import { useApiForm } from "next-vibe/client/hooks/mutation-form";
import { useApiQuery } from "next-vibe/client/hooks/query";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { useEffect } from "react";

import restaurantEndpoint from "./definition";
import type {
  RestaurantGetType,
  RestaurantResponseType,
} from "./schema/restaurant.schema";

export type UseRestaurantReturn = ReturnType<typeof useRestaurant>;
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRestaurant(restaurantId: string) {
  // Use useApiQuery for ME endpoint with proper dependencies
  return useApiQuery<RestaurantGetType, RestaurantResponseType, UndefinedType>(
    restaurantEndpoint.GET,
    {
      restaurantId,
    },
    undefined,
  );
}

export type UseAuthReturn = ReturnType<typeof useRestaurant>;
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRestaurantForm(restaurantId: string) {
  const restaurant = useRestaurant(restaurantId);
  const formData = useApiForm(restaurantEndpoint.POST);
  useEffect(() => {
    if (restaurant.data) {
      formData.form.reset(restaurant.data);
    }
  }, [formData.form, restaurant.data]);

  return formData;
}
