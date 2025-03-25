import { useEffect, useState } from "react";

import type { MenuItem, Restaurant } from "../../types";
import { isApiAvailable, menuItemsApi, restaurantApi } from "../api-client";

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First try to fetch from API
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        const response = await restaurantApi.getAllRestaurants();
        setRestaurants(response.restaurants || response);
      } else {
        setError("API is unavailable.");
      }
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError("Failed to load restaurants. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
    try {
      // Try to get from API first
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        const response = await restaurantApi.getRestaurant(id);
        return response.restaurant || response;
      } else {
        setError("API is unavailable.");
        return null;
      }
    } catch (err) {
      console.error(`Error fetching restaurant with ID ${id}:`, err);
      setError(`Failed to load restaurant with ID ${id}.`);
      return null;
    }
  };

  const getMenuItems = async (restaurantId: string): Promise<MenuItem[]> => {
    try {
      // Try API first
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        const response = await menuItemsApi.getMenuItems(restaurantId);
        return response.menuItems || response;
      } else {
        setError("API is unavailable.");
        return [];
      }
    } catch (err) {
      console.error(
        `Error fetching menu items for restaurant ${restaurantId}:`,
        err,
      );
      setError(`Failed to load menu items for restaurant ${restaurantId}.`);
      return [];
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return {
    restaurants,
    isLoading,
    error,
    fetchRestaurants,
    getRestaurantById,
    getMenuItems,
  };
}
