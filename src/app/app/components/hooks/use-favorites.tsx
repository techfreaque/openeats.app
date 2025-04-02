"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";

interface FavoritesContextType {
  favorites: string[]; // Restaurant IDs
  isLoading: boolean;
  error: string | null;
  addFavorite: (restaurantId: string) => void;
  removeFavorite: (restaurantId: string) => void;
  isFavorite: (restaurantId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

export function FavoritesProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load favorites from localStorage
    if (user) {
      const savedFavorites = localStorage.getItem(
        `openeats-favorites-${user.id}`,
      );
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } else {
      setFavorites([]);
    }
    setIsLoading(false);
  }, [user]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `openeats-favorites-${user.id}`,
        JSON.stringify(favorites),
      );
    }
  }, [favorites, user]);

  const addFavorite = (restaurantId: string): void => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }

    if (!favorites.includes(restaurantId)) {
      setFavorites([...favorites, restaurantId]);
      toast({
        title: "Added to favorites",
        description: "Restaurant added to your favorites",
      });
    }
  };

  const removeFavorite = (restaurantId: string): void => {
    if (!user) {
      return;
    }

    setFavorites(favorites.filter((id) => id !== restaurantId));
    toast({
      title: "Removed from favorites",
      description: "Restaurant removed from your favorites",
    });
  };

  const isFavorite = (restaurantId: string): boolean => {
    return favorites.includes(restaurantId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        error,
        addFavorite,
        removeFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
