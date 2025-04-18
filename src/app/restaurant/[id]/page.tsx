"use client";

import { Clock, Heart, MapPin, Phone, Star } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn } from "next-vibe/shared/utils/utils";
import type { JSX } from "react";
import { useEffect, useState } from "react";

import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";
import { useFavorites } from "@/app/api/v1/favorites/hooks";
import { useRestaurant } from "@/app/api/v1/restaurant/hooks";
import { FeaturedCollection } from "@/app/app/components/featured-collection";
import {
  type OrderType,
  OrderTypeSelector,
} from "@/app/app/components/order-type-selector";
import { useRestaurantConfig } from "@/app/app/components/restaurant-config-provider";
import { RestaurantHero } from "@/app/app/components/restaurant-hero";
import { RestaurantStory } from "@/app/app/components/restaurant-story";
import { SpecialOffers } from "@/app/app/components/special-offers";
import { Button } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/translations";

/**
 * Restaurant home page component
 * Displays restaurant details, menu, and ordering options
 */
export default function RestaurantHomePage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();

  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite, toggleFavorite } =
    useFavorites();
  const config = useRestaurantConfig();

  const { data: restaurant, isLoading, error } = useRestaurant(id);
  const favorite = restaurant ? isFavorite(restaurant.id) : false;

  const [orderType, setOrderType] = useState<OrderType>("delivery");

  useEffect(() => {
    if (error) {
      toast({
        title: t("common.error"),
        description: t("restaurant.notFound"),
        variant: "destructive",
      });
    }
  }, [error, t, toast]);

  const galleryImages =
    restaurant?.menuItems && Array.isArray(restaurant.menuItems)
      ? restaurant.menuItems
          .slice(0, 8)
          .filter((item) => item?.image)
          .map((item, i) => ({
            src:
              item.image ||
              `/placeholder.svg?height=400&width=600&text=Menu+Item+${i + 1}`,
            alt: item.name || `Menu item ${i + 1}`,
          }))
      : Array(3)
          .fill(0)
          .map((_, i) => ({
            src: `/placeholder.svg?height=400&width=600&text=Restaurant+Photo+${i + 1}`,
            alt: `Restaurant photo ${i + 1}`,
          }));

  /**
   * Handle favorite button click
   * Adds or removes restaurant from favorites
   */
  const handleFavoriteClick = async (): Promise<void> => {
    if (!restaurant) {
      return;
    }

    await toggleFavorite(restaurant.id);
  };

  if (isLoading) {
    return (
      <div className="container px-4 md:px-6 py-8">
        <div className="bg-background rounded-lg border p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-36" />
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="flex flex-col gap-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container px-4 md:px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold mb-4">
            {t("restaurant.notFound")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mb-6">
            {t("restaurant.notFoundDescription")}
          </p>
          <Button size="lg" asChild>
            <Link href="/">{t("common.backToHome")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const defaultOpeningHours = [
    { day: 0, open: 600, close: 1380 }, // Sunday 10:00 - 23:00
    { day: 1, open: 660, close: 1320 }, // Monday 11:00 - 22:00
    { day: 2, open: 660, close: 1320 }, // Tuesday 11:00 - 22:00
    { day: 3, open: 660, close: 1320 }, // Wednesday 11:00 - 22:00
    { day: 4, open: 660, close: 1320 }, // Thursday 11:00 - 22:00
    { day: 5, open: 660, close: 1320 }, // Friday 11:00 - 22:00
    { day: 6, open: 600, close: 1380 }, // Saturday 10:00 - 23:00
  ];

  const openingHours =
    restaurant.openingTimes &&
    Array.isArray(restaurant.openingTimes) &&
    restaurant.openingTimes.length > 0
      ? restaurant.openingTimes
      : defaultOpeningHours;

  /**
   * Format minutes to time string (e.g. 660 -> "11:00")
   * @param minutes - Minutes since midnight
   * @returns Formatted time string (HH:MM)
   */
  const formatTime = (minutes: number | undefined | null): string => {
    if (
      minutes === undefined ||
      minutes === null ||
      typeof minutes !== "number" ||
      isNaN(minutes)
    ) {
      return "00:00";
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Hero Section */}
      {config.hero && config.hero.showHero && (
        <RestaurantHero
          restaurantName={restaurant.name}
          restaurantImage={restaurant.image || ""}
          additionalImages={galleryImages.slice(0, 3).map((img) => img.src)}
        />
      )}

      <div className="container px-4 md:px-6 -mt-10 relative">
        <div className="bg-background rounded-lg border p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                {user && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-full",
                      favorite
                        ? "text-red-500 hover:text-red-600"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={handleFavoriteClick}
                  >
                    <Heart
                      className={cn("h-5 w-5", favorite && "fill-current")}
                    />
                    <span className="sr-only">
                      {favorite
                        ? t("restaurant.removeFromFavorites")
                        : t("restaurant.addToFavorites")}
                    </span>
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>
                    {typeof restaurant.rating === "number"
                      ? restaurant.rating.toFixed(1)
                      : "0"}
                    (
                    {typeof restaurant.orderCount === "number"
                      ? restaurant.orderCount
                      : 0}{" "}
                    {t("restaurant.orders")})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">
                    {t("restaurant.categories")}:
                  </span>
                  <span>
                    {restaurant.mainCategory &&
                    typeof restaurant.mainCategory === "object" &&
                    "name" in restaurant.mainCategory
                      ? restaurant.mainCategory.name
                      : t("restaurant.uncategorized")}
                  </span>
                </div>
                {typeof restaurant.deliveryTime === "number" && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {restaurant.deliveryTime} {t("restaurant.minutes")}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground">{restaurant.description}</p>

              {/* Restaurant details */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {restaurant.street || ""} {restaurant.streetNumber || ""},{" "}
                    {restaurant.zip || ""} {restaurant.city || ""}
                  </span>
                </div>
                {typeof restaurant.phone === "string" &&
                  restaurant.phone.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{restaurant.phone}</span>
                    </div>
                  )}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border bg-muted p-4">
                <h3 className="font-medium">{t("restaurant.hours")}</h3>
                <div className="mt-2 grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t("restaurant.weekdays")}</span>
                    <span>
                      {formatTime(openingHours[1]?.open || 660)} -{" "}
                      {formatTime(openingHours[1]?.close || 1320)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("restaurant.weekends")}</span>
                    <span>
                      {formatTime(openingHours[6]?.open || 600)} -{" "}
                      {formatTime(openingHours[6]?.close || 1380)}
                    </span>
                  </div>
                </div>
              </div>
              <OrderTypeSelector
                value={orderType}
                onChange={setOrderType}
                options={{
                  delivery: restaurant.delivery === true,
                  pickup: restaurant.pickup === true,
                  dineIn: restaurant.dineIn === true,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Special Offers Section */}
      {config.specialOffers &&
        Array.isArray(config.specialOffers) &&
        config.specialOffers.length > 0 && (
          <SpecialOffers restaurantId={restaurant.id} />
        )}

      {/* Restaurant Story Section */}
      {config.showStory === true &&
        config.story &&
        typeof config.story === "object" && (
          <RestaurantStory restaurantName={restaurant.name || ""} />
        )}

      {/* Featured Collections */}
      {restaurant.menuItems &&
        Array.isArray(restaurant.menuItems) &&
        restaurant.menuItems.length > 0 &&
        config.featuredCollections &&
        Array.isArray(config.featuredCollections) &&
        config.featuredCollections.length > 0 && (
          <div className="py-12">
            <div className="container px-4 md:px-6">
              <div className="space-y-12">
                {config.featuredCollections.map((collection) => (
                  <FeaturedCollection
                    key={collection.id}
                    title={collection.title}
                    description={collection.description}
                    itemIds={collection.itemIds}
                    restaurantId={restaurant.id}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

      {/* CTA Section */}
      <div className="py-12 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t("restaurant.menu.readyToOrder")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mb-6">
              {t("restaurant.menu.exploreMenu")}
            </p>
            <Button size="lg" asChild>
              <Link href={`/restaurant/${restaurant.id}/menu`}>
                {t("restaurant.menu.viewFullMenu")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
