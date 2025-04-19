"use client";

import { AlertCircle, Clock, Heart, MapPin, Phone, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "next-vibe/i18n";
import { cn } from "next-vibe/shared/utils/utils";
import { Button, Skeleton, useToast } from "next-vibe-ui/ui";
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

/**
 * Restaurant home page component
 * Displays restaurant details, menu, and ordering options
 */
export default function RestaurantHomePage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const id = params.id;
  // Router will be used in future implementations
  // const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();

  const { user } = useAuth();
  // Only using isFavorite and toggleFavorite for now
  const { isFavorite, toggleFavorite } = useFavorites();
  const config = useRestaurantConfig();

  const { data: restaurant, isLoading, error } = useRestaurant(id);

  // Fallback restaurant data when API fails
  const fallbackRestaurant = {
    id,
    name: "Restaurant Name",
    description:
      "This is a fallback description for when the API fails to load the restaurant data. The application is still functional with limited features.",
    address: "123 Main St",
    city: "City",
    state: "State",
    zip: "12345",
    phone: "(123) 456-7890",
    email: "contact@restaurant.com",
    website: "https://restaurant.com",
    logo: "/placeholder.svg?height=200&width=200&text=Restaurant+Logo",
    image: "/placeholder.svg?height=400&width=1200&text=Restaurant+Cover",
    openingTimes: [
      { day: 0, open: 600, close: 1320 },
      { day: 1, open: 600, close: 1320 },
      { day: 2, open: 600, close: 1320 },
      { day: 3, open: 600, close: 1320 },
      { day: 4, open: 600, close: 1320 },
      { day: 5, open: 600, close: 1380 },
      { day: 6, open: 600, close: 1380 },
    ],
    menuItems: [],
    rating: 4.5,
    orderCount: 100,
    priceRange: "$$",
    cuisine: "Various",
    deliveryTime: 30,
    deliveryFee: 5,
    minOrder: 15,
    isOpen: true,
    acceptsReservations: true,
    street: "123 Main St",
    streetNumber: "",
    country: "Country",
    delivery: true,
    pickup: true,
    dineIn: false,
    mainCategory: { name: "Restaurant" },
  };

  // Use fallback data if there's an API error but still show the page
  const restaurantData =
    error && process.env.NODE_ENV === "development"
      ? fallbackRestaurant
      : restaurant;
  const favorite = restaurantData ? isFavorite(restaurantData.id) : false;

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
    restaurantData?.menuItems && Array.isArray(restaurantData.menuItems)
      ? restaurantData.menuItems
          .slice(0, 8)
          .filter((item) => item?.image)
          .map((item, i) => ({
            src:
              item.image ??
              `/placeholder.svg?height=400&width=600&text=Menu+Item+${i + 1}`,
            alt: item.name ?? `Menu item ${i + 1}`,
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
    if (!restaurantData) {
      return;
    }

    await toggleFavorite(restaurantData.id);
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

  // In production, show error page if no restaurant data
  // In development, we'll use fallback data to continue
  if (!restaurantData) {
    return (
      <div className="container px-4 md:px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-3xl font-bold mb-4">
            {error ? "Error loading restaurant" : "Restaurant not found"}
          </h1>
          <p className="text-muted-foreground max-w-2xl mb-6">
            {error
              ? "There was a problem loading the restaurant information. Please try again later."
              : "The restaurant you are looking for does not exist or has been removed."}
          </p>
          {error && (
            <div className="mt-2 mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive max-w-md">
              <p className="font-medium">Error details:</p>
              <p>{error?.message ?? "Unknown error"}</p>
            </div>
          )}
          <Button size="lg" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Show a development mode banner when using fallback data
  const isUsingFallback = error && restaurantData === fallbackRestaurant;

  // Add a development mode banner if using fallback data
  useEffect(() => {
    if (isUsingFallback) {
      toast({
        title: "Development Mode",
        description:
          "Using fallback restaurant data due to API error. This would show an error page in production.",
        variant: "destructive",
        duration: 10_000,
      });
    }
  }, [isUsingFallback, toast]);

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
    restaurantData.openingTimes &&
    Array.isArray(restaurantData.openingTimes) &&
    restaurantData.openingTimes.length > 0
      ? restaurantData.openingTimes
      : defaultOpeningHours;

  /**
   * Format minutes to time string (e.g. 660 -> "11:00")
   * @param minutes - Minutes since midnight
   * @returns Formatted time string (HH:MM)
   */
  const formatTime = (minutes: number | undefined | null): string => {
    if (
      minutes === null ||
      minutes === undefined ||
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
      {config.hero?.showHero && (
        <RestaurantHero
          restaurantName={restaurantData.name}
          restaurantImage={restaurantData.image || ""}
          additionalImages={galleryImages.slice(0, 3).map((img) => img.src)}
        />
      )}

      <div className="container px-4 md:px-6 -mt-10 relative">
        <div className="bg-background rounded-lg border p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{restaurantData.name}</h1>
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
                    {typeof restaurantData.rating === "number"
                      ? restaurantData.rating.toFixed(1)
                      : "0"}
                    (
                    {typeof restaurantData.orderCount === "number"
                      ? restaurantData.orderCount
                      : 0}{" "}
                    {t("restaurant.orders")})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">
                    {t("restaurant.categories")}:
                  </span>
                  <span>
                    {restaurantData.mainCategory &&
                    typeof restaurantData.mainCategory === "object" &&
                    "name" in restaurantData.mainCategory
                      ? restaurantData.mainCategory.name
                      : "Restaurant"}
                  </span>
                </div>
                {restaurantData.delivery && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Delivery Available</span>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground">
                {restaurantData.description}
              </p>

              {/* Restaurant details */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {restaurantData.street ?? ""}{" "}
                    {restaurantData.streetNumber ?? ""},{" "}
                    {restaurantData.zip ?? ""} {restaurantData.city ?? ""}
                  </span>
                </div>
                {typeof restaurantData.phone === "string" &&
                  restaurantData.phone.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{restaurantData.phone}</span>
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
                      {formatTime(openingHours[1]?.open ?? 660)} -{" "}
                      {formatTime(openingHours[1]?.close ?? 1320)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("restaurant.weekends")}</span>
                    <span>
                      {formatTime(openingHours[6]?.open ?? 600)} -{" "}
                      {formatTime(openingHours[6]?.close ?? 1380)}
                    </span>
                  </div>
                </div>
              </div>
              <OrderTypeSelector
                value={orderType}
                onChange={setOrderType}
                options={{
                  delivery: restaurantData.delivery === true,
                  pickup: restaurantData.pickup === true,
                  dineIn: restaurantData.dineIn === true,
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
          <SpecialOffers restaurantId={restaurantData.id} />
        )}

      {/* Restaurant Story Section */}
      {config.showStory === true &&
        config.story &&
        typeof config.story === "object" && (
          <RestaurantStory restaurantName={restaurantData.name ?? ""} />
        )}

      {/* Featured Collections */}
      {restaurantData.menuItems &&
        Array.isArray(restaurantData.menuItems) &&
        restaurantData.menuItems.length > 0 &&
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
                    description={collection.description ?? ""}
                    itemIds={collection.itemIds}
                    restaurantId={restaurantData.id}
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
              <Link href={`/restaurant/${restaurantData.id}/menu`}>
                {t("restaurant.menu.viewFullMenu")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
