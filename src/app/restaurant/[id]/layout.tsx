"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import type React from "react";
import type { JSX } from "react";

import { useRestaurant } from "@/app/api/v1/restaurant/hooks";
import { useRestaurantConfig } from "@/app/api/v1/restaurant-config/hooks";
import type { PartialRestaurantConfigType } from "@/app/app/components/restaurant-config-provider";
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

  const { data: restaurant, isLoading } = useRestaurant(id);
  // Load restaurant config (will be used in the future)
  useRestaurantConfig(id);

  // Show a minimal loading state in the layout
  // The page components will handle more detailed loading states
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="h-16 border-b bg-background px-4 flex items-center">
          <div className="w-32 h-6 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Return null to let the page component handle the error state
  if (!restaurant) {
    return null;
  }

  // Create a config object that matches the expected type
  const restaurantConfig: PartialRestaurantConfigType = {
    theme: {
      theme: "default",
      primaryColor: "primary",
    },
    hero: {
      showHero: true,
      heroHeight: "small",
      heroStyle: "image",
    },
    layout: "standard",
    featuredItems: [],
    featuredCollections: [],
    showReviews: true,
    showGallery: true,
    orderOptions: {
      delivery: true,
      pickup: true,
      dineIn: false,
    },
    menuStyle: "sections",
  };

  return (
    <RestaurantConfigProvider config={restaurantConfig}>
      <div className="flex min-h-screen flex-col">
        <RestaurantNavbar
          restaurantName={restaurant?.name ?? ""}
          restaurantId={restaurant?.id ?? ""}
        />
        <main className="flex-1">{children}</main>
      </div>
    </RestaurantConfigProvider>
  );
}
