"use client";

import type { ReactNode } from "react";
import type { JSX } from "react";
import { useFavorites as useApiFavorites } from "@/app/api/v1/favorites/hooks";

/**
 * FavoritesProvider component
 * This is a wrapper around the API favorites hook to maintain backward compatibility
 */
export function FavoritesProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <>{children}</>;
}

/**
 * Hook for using favorites
 * This is a zustand-based implementation connected to the API
 */
export function useFavorites(): {
  favorites: string[];
  isLoading: boolean;
  error: string | null;
  addFavorite: (restaurantId: string) => Promise<void>;
  removeFavorite: (restaurantId: string) => Promise<void>;
  isFavorite: (restaurantId: string) => boolean;
} {
  const {
    favorites,
    isLoading,
    error,
    addFavorite: apiAddFavorite,
    removeFavorite: apiRemoveFavorite,
    isFavorite,
  } = useApiFavorites();
  
  const addFavorite = async (restaurantId: string): Promise<void> => {
    await apiAddFavorite(restaurantId);
  };
  
  const removeFavorite = async (restaurantId: string): Promise<void> => {
    await apiRemoveFavorite(restaurantId);
  };
  
  return {
    favorites,
    isLoading,
    error: error ? error.message : null,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
}
