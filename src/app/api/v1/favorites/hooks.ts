"use client";

import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useApiStore } from "next-vibe/client/hooks/store";
import { useTranslation } from "next-vibe/i18n";
import { toast } from "next-vibe-ui/ui";
import { useCallback, useMemo } from "react";

import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";

import favoritesEndpoints from "./definition";
import type {
  FavoriteAddType,
  FavoriteRemoveType,
  FavoritesGetType,
  FavoritesResponseType,
} from "./schema";

/**
 * Type for empty parameters
 */
type EmptyParams = object;

/**
 * Hook for managing user favorites
 * @returns Object with favorites data and methods to add/remove favorites
 */
export const useFavorites = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const queryKey = ["favorites", user?.id || "anonymous"];

  // Use a stable query key and memoize it
  const memoizedQueryKey = useMemo(() => queryKey, [user?.id]);

  const { data, isLoading, error } = useApiQuery<
    FavoritesGetType,
    FavoritesResponseType,
    EmptyParams,
    "default"
  >(
    favoritesEndpoints.GET,
    {},
    {},
    {
      enabled: !!user,
      queryKey: memoizedQueryKey,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refreshDelay: 1000, // Add a delay to prevent rapid refetches
    },
  );

  // Mutation for adding a favorite
  const { mutateAsync: addFavoriteMutation } = useApiMutation<
    FavoritesResponseType,
    FavoriteAddType,
    EmptyParams,
    "default"
  >(favoritesEndpoints.POST, {
    onSuccess: () => {
      toast({
        title: t("restaurant.addedToFavorites", "Added to favorites"),
        description: t(
          "restaurant.addedToFavoritesDescription",
          "Restaurant added to your favorites",
        ),
      });
      useApiStore.getState().invalidateQueries(queryKey);
    },
    onError: (data: {
      error: Error;
      requestData: FavoriteAddType;
      pathParams: EmptyParams;
    }) => {
      toast({
        title: t("error", "Error"),
        description:
          data.error.message ||
          t(
            "restaurant.errorAddingFavorite",
            "Failed to add restaurant to favorites",
          ),
        variant: "destructive",
      });
    },
  });

  // Mutation for removing a favorite
  const { mutateAsync: removeFavoriteMutation } = useApiMutation<
    FavoritesResponseType,
    FavoriteRemoveType,
    EmptyParams,
    "default"
  >(favoritesEndpoints.DELETE, {
    onSuccess: () => {
      toast({
        title: t("restaurant.removedFromFavorites", "Removed from favorites"),
        description: t(
          "restaurant.removedFromFavoritesDescription",
          "Restaurant removed from your favorites",
        ),
      });
      useApiStore.getState().invalidateQueries(queryKey);
    },
    onError: (data: {
      error: Error;
      requestData: FavoriteRemoveType;
      pathParams: EmptyParams;
    }) => {
      toast({
        title: t("error", "Error"),
        description:
          data.error.message ||
          t(
            "restaurant.errorRemovingFavorite",
            "Failed to remove restaurant from favorites",
          ),
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
          description: t(
            "auth.signInToSaveFavorites",
            "Please sign in to save favorites",
          ),
          variant: "destructive",
        });
        return;
      }

      await addFavoriteMutation({
        requestData: { restaurantId },
        urlParams: {},
      });
    },
    [addFavoriteMutation, user, t],
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
    [removeFavoriteMutation, user],
  );

  // Check if a restaurant is in favorites
  const isFavorite = useCallback(
    (restaurantId: string): boolean => {
      if (!data?.favorites) {
        return false;
      }

      return data.favorites.includes(restaurantId);
    },
    [data],
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (restaurantId: string) => {
      if (!user) {
        toast({
          title: t("auth.signInRequired", "Sign in required"),
          description: t(
            "auth.signInToSaveFavorites",
            "Please sign in to save favorites",
          ),
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
    [addFavorite, isFavorite, removeFavorite, user, t],
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
