import { useApiForm } from "next-vibe/client/hooks/mutation-form";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useEffect } from "react";

import restaurantEndpoint from "./definition";
import type {
  RestaurantResponseType,
  RestaurantUpdateType,
} from "./schema/restaurant.schema";

/**
 * Hook to fetch restaurant data by ID
 * @param restaurantId - The ID of the restaurant to fetch
 * @returns Query result with restaurant data
 */
export function useRestaurant(restaurantId: string): {
  data: RestaurantResponseType | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
} {
  const result = useApiQuery(
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

  // Transform the result to return a single restaurant instead of an array
  return {
    ...result,
    data:
      Array.isArray(result.data) && result.data.length > 0
        ? result.data[0]
        : undefined,
  };
}

export type UseRestaurantReturn = ReturnType<typeof useRestaurant>;
/**
 * Hook to create a form pre-filled with restaurant data
 * @param restaurantId - The ID of the restaurant to edit
 * @returns Form methods and state for editing a restaurant
 */
export function useRestaurantForm(
  restaurantId: string,
): ReturnType<typeof useApiForm> {
  const restaurant = useRestaurant(restaurantId);

  const formData = useApiForm(restaurantEndpoint.POST, {
    defaultValues: restaurant.data
      ? {
          name: restaurant.data.name ?? "",
          description: restaurant.data.description ?? "",
          street: restaurant.data.street ?? "",
          streetNumber: restaurant.data.streetNumber ?? "",
          zip: restaurant.data.zip ?? "",
          city: restaurant.data.city ?? "",
          phone: restaurant.data.phone ?? "",
          email: restaurant.data.email ?? "",
          image: restaurant.data.image ?? "",
          published: Boolean(restaurant.data.published),
          delivery: Boolean(restaurant.data.delivery),
          pickup: Boolean(restaurant.data.pickup),
          dineIn: Boolean(restaurant.data.dineIn),
          priceLevel:
            typeof restaurant.data.priceLevel === "number"
              ? restaurant.data.priceLevel
              : 1,
          countryId: restaurant.data.countryId,
          mainCategoryId: restaurant.data.mainCategory?.id ?? "",
          id: restaurant.data.id ?? "",
        }
      : undefined,
  });

  useEffect(() => {
    if (restaurant.data) {
      const formValues: RestaurantUpdateType = {
        name: restaurant.data.name || "",
        description: restaurant.data.description || "",
        street: restaurant.data.street || "",
        streetNumber: restaurant.data.streetNumber || "",
        zip: restaurant.data.zip || "",
        city: restaurant.data.city || "",
        phone: restaurant.data.phone || "",
        email: restaurant.data.email || "",
        image: restaurant.data.image || "",
        published: Boolean(restaurant.data.published),
        delivery: Boolean(restaurant.data.delivery),
        pickup: Boolean(restaurant.data.pickup),
        dineIn: Boolean(restaurant.data.dineIn),
        priceLevel:
          typeof restaurant.data.priceLevel === "number"
            ? restaurant.data.priceLevel
            : 1,
        countryId: restaurant.data.countryId,
        mainCategoryId: restaurant.data.mainCategory?.id ?? "",
        id: restaurant.data.id || "",
        userRoles:
          restaurant.data.userRoles?.filter(
            (role) =>
              role.role === "PARTNER_ADMIN" || role.role === "PARTNER_EMPLOYEE",
          ) ?? [],
      };
      formData.form.reset(formValues);
    }
  }, [formData.form, restaurant.data]);

  return formData;
}
