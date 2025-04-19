"use client";

import { useParams } from "next/navigation";
import type React from "react";
import type { JSX } from "react";

import { useRestaurant } from "@/app/api/v1/restaurant/hooks";
import { useRestaurantConfig } from "@/app/api/v1/restaurant-config/hooks";
import { RestaurantConfigProvider } from "@/app/app/components/restaurant-config-provider";
import { RestaurantNavbar } from "@/app/app/components/restaurant-navbar";

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <Layout>{children}</Layout>;
}
function Layout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element | null {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: restaurant } = useRestaurant(id);
  const { data: config } = useRestaurantConfig(id);

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
