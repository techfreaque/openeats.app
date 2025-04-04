"use client";

import { useParams } from "next/navigation";
import type React from "react";
import type { JSX } from "react";

import { FavoritesProvider } from "@/app/app/components/hooks/use-favorites";
import { useRestaurantConfigData } from "@/app/app/components/hooks/use-restaurant-config";
import {
  RestaurantProvider,
  useRestaurants,
} from "@/app/app/components/hooks/use-restaurants";
import { ReviewProvider } from "@/app/app/components/hooks/use-reviews";
import { RestaurantConfigProvider } from "@/app/app/components/restaurant-config-provider";
import { RestaurantNavbar } from "@/app/app/components/restaurant-navbar";

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <RestaurantProvider>
      <FavoritesProvider>
        <ReviewProvider>
          <Layout>{children}</Layout>
        </ReviewProvider>
      </FavoritesProvider>
    </RestaurantProvider>
  );
}
function Layout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element | null {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { getRestaurantById } = useRestaurants();
  const { config, isLoading } = useRestaurantConfigData(id);

  const restaurant = getRestaurantById(id);

  if (!restaurant) {
    return null;
  }

  return (
    <RestaurantProvider>
      <RestaurantConfigProvider config={config}>
        <div className="flex min-h-screen flex-col">
          <RestaurantNavbar
            restaurantName={restaurant.name}
            restaurantId={restaurant.id}
          />
          <main className="flex-1">{children}</main>
        </div>
      </RestaurantConfigProvider>
    </RestaurantProvider>
  );
}
