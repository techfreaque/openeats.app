"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "next-vibe/i18n";
import { errorLogger } from "next-vibe/shared/utils/logger";
import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

import { useRestaurants } from "../api/v1/restaurants/hooks";
import { CategoryPill } from "./components/category-pill";
import {
  RestaurantCard,
  RestaurantCardSkeleton,
} from "./components/restaurant-card";

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  "all": "🍽️",
  "fast food": "🍔",
  "pizza": "🍕",
  "sushi": "🍣",
  "chinese": "🥡",
  "mexican": "🌮",
  "italian": "🍝",
  "dessert": "🍰",
  "breakfast": "🥞",
  "healthy": "🥗",
  // Fallback for unknown categories
  "default": "🍴",
};

export default function Home(): JSX.Element {
  const { form, data, isLoading, submitForm } = useRestaurants();
  const restaurants = data?.restaurants || [];

  const [activeCategory, setActiveCategory] = useState("all");
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [location, setLocation] = useState<string>("");
  const { toast } = useToast();
  const { t } = useTranslation();

  // Dynamically extract categories from restaurant data
  const categories = useMemo(() => {
    // Start with "All" category
    const allCategory = { name: "All", icon: "🍽️", value: "all" };

    // If we don't have data yet, return just the "All" category
    if (!restaurants || restaurants.length === 0) {
      return [allCategory];
    }

    // Extract unique categories from restaurants
    const uniqueCategories = new Set<string>();
    restaurants.forEach((restaurant) => {
      if (restaurant.mainCategory) {
        uniqueCategories.add(restaurant.mainCategory);
      }
    });

    // Map to category objects with icons
    const categoryList = Array.from(uniqueCategories).map((category) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      icon: CATEGORY_ICONS[category.toLowerCase()] || CATEGORY_ICONS.default,
      value: category.toLowerCase(),
    }));

    // Sort alphabetically and add All at the beginning
    return [
      allCategory,
      ...categoryList.sort((a, b) => a.name.localeCompare(b.name)),
    ];
  }, [restaurants]);

  // Update the form when category changes
  useEffect(() => {
    if (form) {
      if (activeCategory === "all") {
        form.setValue("category", undefined);
      } else {
        form.setValue("category", activeCategory);
      }

      // Only submit if we have location data
      if (form.getValues("zip") && form.getValues("countryCode")) {
        submitForm(undefined, { urlParamVariables: undefined });
      }
    }
  }, [activeCategory, form, submitForm]);

  // Update the form when delivery type changes
  useEffect(() => {
    if (form) {
      form.setValue("deliveryType", deliveryType);

      // Only submit if we have location data
      if (form.getValues("zip") && form.getValues("countryCode")) {
        submitForm(undefined, { urlParamVariables: undefined });
      }
    }
  }, [deliveryType, form, submitForm]);

  // Function to handle location change
  const handleLocationChange = (newLocation: string): void => {
    setLocation(newLocation);
    localStorage.setItem("openeats-location", newLocation);

    // Extract zip and country from location (simplified)
    const [zip, countryCode] = parseLocation(newLocation);

    if (zip && countryCode) {
      form.setValue("zip", zip);
      form.setValue("countryCode", countryCode);
    } else {
      // Fallback to defaults if parsing fails
      form.setValue("zip", "10001");
      form.setValue("countryCode", "US");
    }

    form.setValue("radius", 10);
    submitForm(undefined, { urlParamVariables: undefined });
  };

  // Helper function to parse location string
  const parseLocation = (loc: string): [string | null, string | null] => {
    // This is a simplified parsing logic - in a real app, you'd use geocoding
    if (loc.includes(",")) {
      // For demo purposes, we'll assume format "zip, countryCode" or "city, countryCode"
      const parts = loc.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        return [parts[0], parts[1]];
      }
    }
    return [null, null];
  };

  // Initialize with location from localStorage if available
  useEffect(() => {
    // Check if we have a saved location
    const savedLocation = localStorage.getItem("openeats-location");
    if (savedLocation) {
      setLocation(savedLocation);
      return;
    }

    // Set a default location
    setLocation("New York, NY");
    localStorage.setItem("openeats-location", "New York, NY");

    // Try to detect location automatically
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, we would use reverse geocoding to get the address
          // For now, we'll just use the coordinates
          const { latitude, longitude } = position.coords;
          const locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setLocation(locationString);
          localStorage.setItem("openeats-location", locationString);
        },
        (error: GeolocationPositionError) => {
          errorLogger("Error getting location:", error);
          // Keep the default location
          if (error.code === error.PERMISSION_DENIED) {
            toast({
              title: t("location.locationAccessDenied"),
              description: t("location.locationAccessDeniedDescription"),
              variant: "destructive",
            });
          }
        },
        { timeout: 10000, enableHighAccuracy: false },
      );
    }
  }, [form, toast, t, submitForm]);

  // Save location when it changes
  useEffect(() => {
    if (location) {
      localStorage.setItem("openeats-location", location);
    }
  }, [location]);

  // Filter by delivery type (need to do this client-side since we're not resubmitting the form)
  const displayedRestaurants =
    deliveryType === "pickup"
      ? restaurants.filter((r) => r.pickup)
      : restaurants;

  // Features restaurants - top 4 by rating
  const featuredRestaurants = [...restaurants]
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    .slice(0, 4);

  // Popular restaurants - top 4 by rating
  const popularRestaurants = [...restaurants]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  return (
    <>
      <section className="w-full py-6 md:py-12 lg:py-16 bg-muted">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t("home.hero.title")}
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  {t("home.hero.subtitle")}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder={t("home.hero.deliveryAddressPlaceholder")}
                    className="w-full"
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                  />
                </div>
                <Button size="lg" asChild>
                  <Link href="/app/restaurants">
                    {t("home.hero.findFoodButton")}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <Image
                src="/placeholder.svg?height=400&width=400"
                alt="Hero Image"
                width={400}
                height={400}
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              {t("home.categories.title")}
            </h2>
            <Link
              href="/app/restaurants"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("home.categories.viewAll")}
            </Link>
          </div>
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <CategoryPill
                key={category.value}
                name={category.name}
                icon={category.icon}
                active={activeCategory === category.value}
                onClick={() => setActiveCategory(category.value)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-12">
        <div className="container">
          <Tabs
            defaultValue="delivery"
            className="w-full"
            onValueChange={(value) => setDeliveryType(value)}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">
                {t("home.restaurantsNearYou.title")}
              </h2>
              <TabsList>
                <TabsTrigger value="delivery">
                  {t("home.restaurantsNearYou.delivery")}
                </TabsTrigger>
                <TabsTrigger value="pickup">
                  {t("home.restaurantsNearYou.pickup")}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="delivery" className="mt-6">
              {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <RestaurantCardSkeleton key={i} />
                    ))}
                </div>
              ) : displayedRestaurants.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {displayedRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-center text-muted-foreground">
                    {t("home.restaurantsNearYou.noRestaurants")}
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="pickup" className="mt-6">
              {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <RestaurantCardSkeleton key={i} />
                    ))}
                </div>
              ) : displayedRestaurants.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {displayedRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-center text-muted-foreground">
                    {t("home.restaurantsNearYou.noPickup")}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="w-full py-12 bg-muted">
        <div className="container">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            {t("home.popularRestaurants.title")}
          </h2>
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <RestaurantCardSkeleton key={i} />
                ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {popularRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="w-full py-12">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            {t("home.featuredRestaurants.title")}
          </h2>
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <RestaurantCardSkeleton key={i} />
                ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="w-full py-12 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">
                {t("home.ownRestaurant.title")}
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                {t("home.ownRestaurant.subtitle")}
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/app/create-restaurant">
                {t("home.ownRestaurant.getStarted")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
