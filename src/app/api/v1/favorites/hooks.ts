"use client";

import { useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";
import { translations } from "@/translations";
import { useApiStore } from "next-vibe/client/hooks/store";

import favoritesEndpoints from "./definition";
import type { 
  FavoriteAddType, 
  FavoriteRemoveType, 
  FavoritesGetType, 
  FavoritesResponseType 
} from "./schema";

/**
 * Create a type-safe translation function
 */
const createTranslator = () => {
  return (key: string, fallback?: string): string => {
    const parts = key.split(".");
    let current: Record<string, unknown> = translations.EN;
    
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        const value = current[part];
        current = value as Record<string, unknown>;
      } else {
        return fallback || key;
      }
    }
    
    return typeof current === "string" ? current : fallback || key;
  };
};

/**
 * Hook for managing user favorites
 * @returns Object with favorites data and methods to add/remove favorites
 */
export const useFavorites = () => {
  const { user } = useAuth();
  const t = createTranslator();
  
  const queryKey = ["favorites", user?.id || "anonymous"];
  
  const {
    data,
    isLoading,
    error,
  } = useApiQuery<FavoritesGetType, FavoritesResponseType, Record<string, never>, "default">(
    favoritesEndpoints.GET,
    {},
    {},
    {
      enabled: !!user,
      queryKey,
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
        title: t("restaurant.addedToFavorites", "Added to favorites"),
        description: t("restaurant.addedToFavoritesDescription", "Restaurant added to your favorites"),
      });
      useApiStore.getState().invalidateQueries(queryKey);
    },
    onError: (data: { 
      error: Error; 
      requestData: FavoriteAddType; 
      pathParams: Record<string, never>; 
    }) => {
      toast({
        title: t("error", "Error"),
        description: data.error.message || t("restaurant.errorAddingFavorite", "Failed to add restaurant to favorites"),
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
        title: t("restaurant.removedFromFavorites", "Removed from favorites"),
        description: t("restaurant.removedFromFavoritesDescription", "Restaurant removed from your favorites"),
      });
      useApiStore.getState().invalidateQueries(queryKey);
    },
    onError: (data: { 
      error: Error; 
      requestData: FavoriteRemoveType; 
      pathParams: Record<string, never>; 
    }) => {
      toast({
        title: t("error", "Error"),
        description: data.error.message || t("restaurant.errorRemovingFavorite", "Failed to remove restaurant from favorites"),
        variant: "destructive",
      });
    },
  });
  
  // Add a restaurant to favorites
  const addFavorite = useCallback(
    async (restaurantId: string) => {
      if (!user) {
        toast({
          title: t("auth.signInRequired", "Sign in required"),
          description: t("auth.signInToSaveFavorites", "Please sign in to save favorites"),
          variant: "destructive",
        });
        return;
      }
      
      await addFavoriteMutation({
        requestData: { restaurantId },
        urlParams: {},
      });
    },
    [addFavoriteMutation, user, t]
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
          title: t("auth.signInRequired", "Sign in required"),
          description: t("auth.signInToSaveFavorites", "Please sign in to save favorites"),
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
    [addFavorite, isFavorite, removeFavorite, user, t]
  );
  
  return {
    favorites: data?.favorites || [],
    isLoading: isLoading || false,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
};
