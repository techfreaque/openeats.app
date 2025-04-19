import { useApiQuery } from "next-vibe/client/hooks/query";
import { useApiQueryForm } from "next-vibe/client/hooks/query-form";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { useCallback, useEffect } from "react";

import restaurantsEndpoint from "./definition";
import type { RestaurantsResponseType, RestaurantsSearchType } from "./schema";

/**
 * Hook to fetch and filter restaurants
 * Uses debounced query form to prevent excessive API calls
 */
export function useRestaurants(): ReturnType<
  typeof useApiQueryForm<
    RestaurantsSearchType,
    RestaurantsResponseType,
    UndefinedType
  >
> & {
  retry: () => void;
  isEmpty: boolean;
} {
  const queryForm = useApiQueryForm<
    RestaurantsSearchType,
    RestaurantsResponseType,
    UndefinedType
  >(restaurantsEndpoint.POST, undefined, {
    debounceMs: 800,
  });

  // Add error handling wrapper
  const originalSubmitForm = queryForm.submitForm;
  const submitFormWithErrorHandling = useCallback(
    (
      ...args: Parameters<typeof originalSubmitForm>
    ): ReturnType<typeof originalSubmitForm> => {
      try {
        return originalSubmitForm(...args);
      } catch (error) {
        errorLogger("Error fetching restaurants:", error);
        throw error;
      }
    },
    [originalSubmitForm],
  );

  // Add a retry function for convenience
  const retry = useCallback(() => {
    queryForm.form.reset(queryForm.form.getValues());
    return submitFormWithErrorHandling(undefined, {
      urlParamVariables: undefined,
    });
  }, [queryForm.form, submitFormWithErrorHandling]);

  return {
    ...queryForm,
    submitForm: submitFormWithErrorHandling,
    retry,
    // Add helper properties for common states
    isEmpty:
      !queryForm.isLoading &&
      !queryForm.isError &&
      (!queryForm.data?.restaurants || queryForm.data.restaurants.length === 0),
  };
}

/**
 * Hook to fetch restaurants with fixed parameters
 * Useful for getting restaurants without user input
 */
export function useRestaurantsQuery(
  params: Partial<RestaurantsSearchType>,
): ReturnType<
  typeof useApiQuery<
    RestaurantsSearchType,
    RestaurantsResponseType,
    UndefinedType
  >
> & {
  retry: () => void;
  isEmpty: boolean;
} {
  const query = useApiQuery(
    restaurantsEndpoint.POST,
    {
      page: 1,
      limit: 30,
      ...params,
    },
    undefined,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  );

  // Log errors if they occur
  if (query.error) {
    errorLogger(
      "Error fetching restaurants with fixed parameters:",
      query.error,
    );
  }

  // Add a retry function for convenience
  const retry = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    ...query,
    retry,
    // Add helper properties for common states
    isEmpty:
      !query.isLoading &&
      !query.isError &&
      (!query.data?.restaurants || query.data.restaurants.length === 0),
  };
}

/**
 * Hook to get a specific menu item by ID from a restaurant
 * @param restaurantId - The ID of the restaurant
 * @param menuItemId - The ID of the menu item
 * @returns The menu item if found, undefined otherwise
 */
export function useRestaurantMenuItem(
  restaurantId: string,
  menuItemId: string,
): {
  menuItem: unknown;
  getMenuItemById: (id: string) => unknown;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  retry: () => void;
} {
  // Use the restaurant ID as a search parameter
  const { data, isLoading, isError, error, retry } = useRestaurantsQuery({
    search: restaurantId,
    limit: 1, // We only need one restaurant
  });

  const getMenuItemById = useCallback(
    (id: string) => {
      if (!data?.restaurants || !Array.isArray(data.restaurants)) {
        return undefined;
      }

      const restaurant = data.restaurants.find((r) => r.id === restaurantId);
      if (!restaurant?.menuItems) {
        return undefined;
      }

      return restaurant.menuItems.find((item) => item.id === id);
    },
    [data, restaurantId],
  );

  const menuItem = getMenuItemById(menuItemId);

  // Log error if we couldn't find the menu item
  useEffect(() => {
    if (!isLoading && !isError && !menuItem) {
      errorLogger(
        `Menu item ${menuItemId} not found in restaurant ${restaurantId}`,
      );
    }
  }, [isLoading, isError, menuItem, menuItemId, restaurantId]);

  return {
    menuItem,
    getMenuItemById,
    isLoading,
    isError,
    error,
    retry,
  };
}
