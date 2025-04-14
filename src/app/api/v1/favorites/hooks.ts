"use client";

import { useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";
import { translations } from "@/translations";

import favoritesEndpoints from "./definition";
import type { 
  FavoriteAddType, 
  FavoriteRemoveType, 
  FavoritesGetType, 
  FavoritesResponseType 
} from "./schema";

/**
 * Hook for managing user favorites
 * @returns Object with favorites data and methods to add/remove favorites
 */
export const useFavorites = () => {
  const { user } = useAuth();
  
  // Create a simple translation function
  const t = (key: string, fallback?: string): string => {
    const parts = key.split(".");
    let result = translations.EN;
    
    for (const part of parts) {
      if (result && typeof result === "object" && part in result) {
        result = result[part] as any;
      } else {
        return fallback || key;
      }
    }
    
    return typeof result === "string" ? result : fallback || key;
  };
  
  // Query for fetching favorites
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useApiQuery<FavoritesGetType, FavoritesResponseType, Record<string, never>, "default">(
    favoritesEndpoints.GET,
    {},
    {},
    {
      enabled: !!user,
    }
  );
  
  // Mutation for adding a favorite
  const { mutateAsync: addFavoriteMutation } = useApiMutation<
    FavoritesResponseType,
    FavoriteAddType,
    Record<string, never>,
    "default"
  >(favoritesEndpoints.POST, {
    onSuccess: () => {
      toast({
        title: t("restaurant.addedToFavorites"),
        description: "Restaurant added to your favorites",
      });
      refetch();
    },
    onError: (data: { 
      error: Error; 
      requestData: FavoriteAddType; 
      pathParams: Record<string, never>; 
    }) => {
      toast({
        title: "Error",
        description: data.error.message || "Failed to add restaurant to favorites",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for removing a favorite
  const { mutateAsync: removeFavoriteMutation } = useApiMutation<
    FavoritesResponseType,
    FavoriteRemoveType,
    Record<string, never>,
    "default"
  >(favoritesEndpoints.DELETE, {
    onSuccess: () => {
      toast({
        title: t("restaurant.removedFromFavorites"),
        description: "Restaurant removed from your favorites",
      });
      refetch();
    },
    onError: (data: { 
      error: Error; 
      requestData: FavoriteRemoveType; 
      pathParams: Record<string, never>; 
    }) => {
      toast({
        title: "Error",
        description: data.error.message || "Failed to remove restaurant from favorites",
        variant: "destructive",
      });
    },
  });
  
  // Add a restaurant to favorites
  const addFavorite = useCallback(
    async (restaurantId: string) => {
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to save favorites",
          variant: "destructive",
        });
        return;
      }
      
      await addFavoriteMutation({
        requestData: { restaurantId },
        urlParams: {},
      });
    },
    [addFavoriteMutation, user]
  );
  
  // Remove a restaurant from favorites
  const removeFavorite = useCallback(
    async (restaurantId: string) => {
      if (!user) {
        return;
      }
      
      await removeFavoriteMutation({
        requestData: { restaurantId },
        urlParams: {},
      });
    },
    [removeFavoriteMutation, user]
  );
  
  // Check if a restaurant is in favorites
  const isFavorite = useCallback(
    (restaurantId: string): boolean => {
      if (!data || !data.favorites) {
        return false;
      }
      
      return data.favorites.includes(restaurantId);
    },
    [data]
  );
  
  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (restaurantId: string) => {
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to save favorites",
          variant: "destructive",
        });
        return;
      }
      
      if (isFavorite(restaurantId)) {
        await removeFavorite(restaurantId);
      } else {
        await addFavorite(restaurantId);
      }
    },
    [addFavorite, isFavorite, removeFavorite, user]
  );
  
  return {
    favorites: data?.favorites || [],
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
};
