"use client";

import { useParams } from "next/navigation";
import type React from "react";
import type { JSX } from "react";

import { useRestaurantConfigData } from "../../components/hooks/use-restaurant-config";
import { useRestaurants } from "../../components/hooks/use-restaurants";
import { RestaurantConfigProvider } from "../../components/restaurant-config-provider";
import { RestaurantNavbar } from "../../components/restaurant-navbar";

export default function RestaurantLayout({
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
    <RestaurantConfigProvider config={config}>
      <div className="flex min-h-screen flex-col">
        <RestaurantNavbar
          restaurantName={restaurant.name}
          restaurantId={restaurant.id}
        />
        <main className="flex-1">{children}</main>
      </div>
    </RestaurantConfigProvider>
  );
}
