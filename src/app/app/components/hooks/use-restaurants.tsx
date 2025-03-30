"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { mockMenuItems } from "../data/menu-items";
import { mockRestaurants } from "../data/restaurants";
import type { MenuItemType, RestaurantType } from "../lib/types";

// Add these type definitions at the top of the file
interface FilterOptions {
  category?: string;
  priceRange?: string[];
  dietary?: string[];
  sortBy?:
    | "relevance"
    | "rating"
    | "delivery-time"
    | "price-low"
    | "price-high";
  deliveryType?: "delivery" | "pickup" | "all";
}

// Update the RestaurantContextType interface to include the new filter function
interface RestaurantContextType {
  restaurants: RestaurantType[];
  featuredRestaurants: RestaurantType[];
  popularRestaurants: RestaurantType[];
  newRestaurants: RestaurantType[];
  isLoading: boolean;
  error: string | null;
  getRestaurantById: (id: string) => RestaurantType | null;
  getMenuItemsByRestaurantId: (restaurantId: string) => MenuItemType[];
  getMenuItemById: (id: string) => MenuItemType | null;
  searchRestaurants: (query: string) => RestaurantType[];
  filterRestaurantsByCategory: (category: string) => RestaurantType[];
  filterRestaurants: (options: FilterOptions) => RestaurantType[];
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(
  undefined,
);

export function RestaurantProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantType[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      setIsLoading(true);

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setRestaurants(mockRestaurants);
        setMenuItems(mockMenuItems);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load restaurant data");
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  // Get featured restaurants (promoted ones)
  const featuredRestaurants = restaurants.filter((r) => r.promoted);

  // Get popular restaurants (highest rated)
  const popularRestaurants = [...restaurants]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  // Get new restaurants (just mock this with random selection)
  const newRestaurants = [...restaurants]
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  const getRestaurantById = (id: string): RestaurantType | null => {
    return restaurants.find((r) => r.id === id) || null;
  };

  const getMenuItemsByRestaurantId = (restaurantId: string): MenuItemType[] => {
    return menuItems.filter((item) => item.restaurantId === restaurantId);
  };

  const getMenuItemById = (id: string): MenuItemType | null => {
    return menuItems.find((item) => item.id === id) || null;
  };

  const searchRestaurants = (query: string): RestaurantType[] => {
    if (!query) {
      return restaurants;
    }

    const lowerCaseQuery = query.toLowerCase();

    return restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(lowerCaseQuery) ||
        restaurant.categories.some((category) =>
          category.toLowerCase().includes(lowerCaseQuery),
        ) ||
        restaurant.description.toLowerCase().includes(lowerCaseQuery),
    );
  };

  const filterRestaurantsByCategory = (category: string): RestaurantType[] => {
    if (category === "all") {
      return restaurants;
    }

    return restaurants.filter((restaurant) =>
      restaurant.categories.some(
        (cat) => cat.toLowerCase() === category.toLowerCase(),
      ),
    );
  };

  // Add this new function to the RestaurantProvider component
  const filterRestaurants = (options: FilterOptions): RestaurantType[] => {
    let filtered = [...restaurants];

    // Filter by category
    if (options.category && options.category !== "all") {
      filtered = filtered.filter((restaurant) =>
        restaurant.categories.some(
          (cat) => cat.toLowerCase() === options.category?.toLowerCase(),
        ),
      );
    }

    // Filter by delivery type
    if (options.deliveryType === "pickup") {
      filtered = filtered.filter((r) => r.pickup);
    }

    // Filter by price range (mock implementation)
    if (options.priceRange && options.priceRange.length > 0) {
      // This is a mock implementation since we don't have price range data
      const cheapRestaurants = restaurants.filter((_, i) => i % 3 === 0);
      const mediumRestaurants = restaurants.filter((_, i) => i % 3 === 1);
      const expensiveRestaurants = restaurants.filter((_, i) => i % 3 === 2);

      let priceFilteredRestaurants: RestaurantType[] = [];

      if (options.priceRange.includes("$")) {
        priceFilteredRestaurants = [
          ...priceFilteredRestaurants,
          ...cheapRestaurants,
        ];
      }
      if (options.priceRange.includes("$$")) {
        priceFilteredRestaurants = [
          ...priceFilteredRestaurants,
          ...mediumRestaurants,
        ];
      }
      if (options.priceRange.includes("$$$")) {
        priceFilteredRestaurants = [
          ...priceFilteredRestaurants,
          ...expensiveRestaurants,
        ];
      }

      filtered = filtered.filter((r) =>
        priceFilteredRestaurants.some((pr) => pr.id === r.id),
      );
    }

    // Filter by dietary preferences (mock implementation)
    if (options.dietary && options.dietary.length > 0) {
      // This is a mock implementation since we don't have dietary data
      const vegetarianRestaurants = restaurants.filter((_, i) => i % 2 === 0);
      const veganRestaurants = restaurants.filter((_, i) => i % 3 === 0);
      const glutenFreeRestaurants = restaurants.filter((_, i) => i % 4 === 0);

      let dietaryFilteredRestaurants: RestaurantType[] = [];

      if (options.dietary.includes("vegetarian")) {
        dietaryFilteredRestaurants = [
          ...dietaryFilteredRestaurants,
          ...vegetarianRestaurants,
        ];
      }
      if (options.dietary.includes("vegan")) {
        dietaryFilteredRestaurants = [
          ...dietaryFilteredRestaurants,
          ...veganRestaurants,
        ];
      }
      if (options.dietary.includes("gluten-free")) {
        dietaryFilteredRestaurants = [
          ...dietaryFilteredRestaurants,
          ...glutenFreeRestaurants,
        ];
      }

      filtered = filtered.filter((r) =>
        dietaryFilteredRestaurants.some((dr) => dr.id === r.id),
      );
    }

    // Sort results
    if (options.sortBy) {
      if (options.sortBy === "rating") {
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
      } else if (options.sortBy === "delivery-time") {
        filtered = [...filtered].sort(
          (a, b) => a.deliveryTime - b.deliveryTime,
        );
      } else if (options.sortBy === "price-low") {
        filtered = [...filtered].sort((a, b) => a.deliveryFee - b.deliveryFee);
      } else if (options.sortBy === "price-high") {
        filtered = [...filtered].sort((a, b) => b.deliveryFee - a.deliveryFee);
      }
    }

    return filtered;
  };

  // Add the new function to the context provider value
  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        featuredRestaurants,
        popularRestaurants,
        newRestaurants,
        isLoading,
        error,
        getRestaurantById,
        getMenuItemsByRestaurantId,
        getMenuItemById,
        searchRestaurants,
        filterRestaurantsByCategory,
        filterRestaurants,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurants(): RestaurantContextType {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error("useRestaurants must be used within a RestaurantProvider");
  }
  return context;
}
