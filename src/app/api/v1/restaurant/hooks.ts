import { useApiForm } from "next-vibe/client/hooks/mutation-form";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useEffect, useMemo } from "react";

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

  return {
    ...result,
    data: result.data,
  };
}

export type UseRestaurantReturn = ReturnType<typeof useRestaurant>;
/**
 * Hook to create a form pre-filled with restaurant data
 * @param restaurantId - The ID of the restaurant to edit
 * @returns Form methods and state for editing a restaurant
 */
export function useRestaurantForm(restaurantId: string) {
  const restaurant = useRestaurant(restaurantId);

  // Create default values for the form
  const defaultValues = useMemo(() => {
    if (!restaurant.data) {
      return undefined;
    }

    return {
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
    };
  }, [restaurant.data]);

  const formData = useApiForm(restaurantEndpoint.POST, {
    defaultValues,
  });

  useEffect(() => {
    if (restaurant.data) {
      // Create form values with proper type casting
      const formValues = {
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
      } as RestaurantUpdateType;
      formData.form.reset(formValues);
    }
  }, [formData.form, restaurant.data]);

  return formData as ReturnType<typeof useApiForm>;
}
