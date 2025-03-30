import { useCallback, useEffect, useState } from "react";

import type { MenuItem, Restaurant } from "../../types";
import { isApiAvailable, menuItemsApi, restaurantApi } from "../api-client";

export const useRestaurant = (id: string) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurant = useCallback(async () => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        const restaurantResponse = await restaurantApi.getRestaurant(id);
        setRestaurant(restaurantResponse.restaurant || restaurantResponse);

        const menuItemsResponse = await menuItemsApi.getMenuItems(id);
        setMenuItems(menuItemsResponse.menuItems || menuItemsResponse);
      } else {
        setError("API is unavailable.");
      }
    } catch (err) {
      console.error("Error fetching restaurant:", err);
      setError("Failed to load restaurant details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  const getMenuItemsByCategory = useCallback(
    (categoryName: string) => {
      if (!menuItems) {
        return [];
      }
      return menuItems.filter((item) => item.category === categoryName);
    },
    [menuItems],
  );

  return {
    restaurant,
    menuItems,
    isLoading,
    error,
    refetch: fetchRestaurant,
    getMenuItemsByCategory,
  };
};
