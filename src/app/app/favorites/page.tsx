"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { JSX } from "react";

import { Button } from "@/components/ui";

import { useFavorites } from "../components/hooks/use-favorites";
import { useRestaurants } from "../components/hooks/use-restaurants";
import {
  RestaurantCard,
  RestaurantCardSkeleton,
} from "../components/restaurant-card";

export default function FavoritesPage(): JSX.Element | null {
  const router = useRouter();
  const { user } = useAuth();
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const { restaurants, isLoading: restaurantsLoading } = useRestaurants();

  if (!user) {
    router.push("/auth/public/login?redirect=/app/favorites");
    return null;
  }

  const favoriteRestaurants = restaurants.filter((restaurant) =>
    favorites.includes(restaurant.id),
  );

  const isLoading = favoritesLoading || restaurantsLoading;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Favorite Restaurants</h1>
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>

          <div className="mt-8">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <RestaurantCardSkeleton key={i} />
                  ))}
              </div>
            ) : favoriteRestaurants.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {favoriteRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">
                  You don't have any favorite restaurants yet
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Click the heart icon on any restaurant to add it to your
                  favorites
                </p>
                <Button className="mt-4" asChild>
                  <a href="/app/">Browse Restaurants</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
