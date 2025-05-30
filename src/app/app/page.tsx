"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "next-vibe/i18n";
import { errorLogger } from "next-vibe/shared/utils/logger";
import {
  Button,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from "next-vibe-ui/ui";
import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { RestaurantResponseType } from "@/app/api/v1/restaurant/schema/restaurant.schema";
import { Countries } from "@/translations";

import { DeliveryType } from "../api/v1/order/delivery.schema";
import { useRestaurants } from "../api/v1/restaurants/hooks";
import { CategoryPill } from "./components/category-pill";
import {
  RestaurantCard,
  RestaurantCardSkeleton,
} from "./components/restaurant-card";

// Category icons mapping
const CATEGORY_ICONS = {
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
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState("all");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(
    DeliveryType.ALL,
  );
  const [location, setLocation] = useState<string>("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false); // Used to track geolocation loading state
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
    const uniqueCategories: Record<
      string,
      {
        name: string;
        image?: string;
        id: string;
      }
    > = {};
    restaurants.forEach((restaurant) => {
      if (restaurant.mainCategory?.id) {
        uniqueCategories[restaurant.mainCategory.id] = restaurant.mainCategory;
      }
    });

    // Map to category objects with icons
    const categoryList = Object.values(uniqueCategories).map((category) => ({
      name: category.name.charAt(0).toUpperCase() + category.name.slice(1),
      icon:
        CATEGORY_ICONS[
          category.name.toLowerCase() as keyof typeof CATEGORY_ICONS
        ] ?? CATEGORY_ICONS.default,
      value: category.id,
    }));

    // Sort alphabetically and add All at the beginning
    return [
      allCategory,
      ...categoryList.sort((a, b) => a.name.localeCompare(b.name)),
    ];
  }, [restaurants]);

  // Track the last time we submitted to prevent excessive submissions
  const lastSubmitTimeRef = useRef<number>(0);

  // Update the form when category changes
  useEffect(() => {
    if (!form) {
      return;
    }

    if (activeCategory === "all") {
      form.setValue("category", undefined);
    } else {
      form.setValue("category", activeCategory);
    }

    // Only submit if we have location data and haven't submitted recently
    const now = Date.now();
    const minSubmitInterval = 2000; // Minimum 2 seconds between submissions
    if (
      form.getValues("zip") &&
      form.getValues("countryCode") &&
      now - lastSubmitTimeRef.current > minSubmitInterval
    ) {
      lastSubmitTimeRef.current = now;
      submitForm(undefined, { urlParamVariables: undefined });
    }
  }, [activeCategory, form, submitForm, lastSubmitTimeRef]);

  // Update the form when delivery type changes
  useEffect(() => {
    if (!form) {
      return;
    }

    form.setValue("deliveryType", deliveryType);

    // Only submit if we have location data and haven't submitted recently
    const now = Date.now();
    const minSubmitInterval = 2000; // Minimum 2 seconds between submissions
    if (
      form.getValues("zip") &&
      form.getValues("countryCode") &&
      now - lastSubmitTimeRef.current > minSubmitInterval
    ) {
      lastSubmitTimeRef.current = now;
      submitForm(undefined, { urlParamVariables: undefined });
    }
  }, [deliveryType, form, submitForm, lastSubmitTimeRef]);

  // Function to handle location change
  const handleLocationChange = useCallback(
    (newLocation: string): void => {
      try {
        setLocation(newLocation);
        localStorage.setItem("openeats-location", newLocation);

        // Extract zip and country from location (simplified)
        const [zip, countryCode] = parseLocation(newLocation);

        if (zip && countryCode) {
          form.setValue("zip", zip);
          form.setValue("countryCode", countryCode as Countries);
        } else {
          // Fallback to defaults if parsing fails
          form.setValue("zip", "10001");
          form.setValue("countryCode", Countries.DE);

          // Show a toast if the location format is invalid
          if (newLocation.trim() !== "") {
            toast({
              title: t("location.invalidFormat"),
              description: t("location.invalidFormatDescription"),
              variant: "destructive",
            });
          }
        }

        form.setValue("radius", 10);
        submitForm(undefined, { urlParamVariables: undefined });
      } catch (error) {
        errorLogger("Error handling location change:", error);
        toast({
          title: t("location.error"),
          description: t("location.errorDescription"),
          variant: "destructive",
        });
      }
    },
    [form, submitForm, toast, t],
  );

  // Helper function to parse location string
  const parseLocation = (loc: string): [string | null, string | null] => {
    // This is a simplified parsing logic - in a real app, you'd use geocoding
    if (loc.includes(",")) {
      // For demo purposes, we'll assume format "zip, countryCode" or "city, countryCode"
      const parts = loc.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        const zip = parts[0] || null;
        const country = parts[1] || null;
        return [zip, country];
      }
    }
    return [null, null];
  };

  // Flag to track initialization
  const hasInitialized = useRef(false);

  // Initialize with location from localStorage if available
  useEffect(() => {
    // Only run this effect once
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    // Check if we have a saved location
    try {
      setIsLoadingLocation(true);
      const savedLocation = localStorage.getItem("openeats-location");
      if (savedLocation) {
        setLocation(savedLocation);
        // Parse the saved location to set form values
        const [zip, countryCode] = parseLocation(savedLocation);
        if (zip && countryCode) {
          form.setValue("zip", zip);
          form.setValue("countryCode", countryCode as Countries);
          form.setValue("radius", 10);

          // Update the last submit time and submit the form
          lastSubmitTimeRef.current = Date.now();
          submitForm(undefined, { urlParamVariables: undefined });
        }
        setIsLoadingLocation(false);
        return;
      }

      // Set a default location
      const defaultLocation = "Berlin, DE";
      setLocation(defaultLocation);
      localStorage.setItem("openeats-location", defaultLocation);

      // Set default form values
      form.setValue("zip", "10001");
      form.setValue("countryCode", Countries.DE);
      form.setValue("radius", 10);

      // Update the last submit time and submit the form
      lastSubmitTimeRef.current = Date.now();
      submitForm(undefined, { urlParamVariables: undefined });

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
            setIsLoadingLocation(false);
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
            setIsLoadingLocation(false);
          },
          { timeout: 10_000, enableHighAccuracy: false },
        );
      } else {
        setIsLoadingLocation(false);
      }
    } catch (error) {
      errorLogger("Error accessing localStorage:", error);
      setLocation("Berlin, DE");
      setIsLoadingLocation(false);

      toast({
        title: t("location.error"),
        description: t("location.errorDescription"),
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once

  // Save location when it changes
  useEffect(() => {
    try {
      if (location) {
        localStorage.setItem("openeats-location", location);
      }
    } catch (error) {
      errorLogger("Error saving location to localStorage:", error);
    }
  }, [location]);

  // Filter by delivery type (need to do this client-side since we're not resubmitting the form)
  const displayedRestaurants = useMemo(() => {
    return deliveryType === DeliveryType.PICKUP
      ? restaurants.filter((r) => r.pickup === true)
      : restaurants;
  }, [deliveryType, restaurants]);

  const featuredRestaurants = useMemo(() => {
    return [...restaurants]
      .filter((r): r is RestaurantResponseType => !!r)
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 4);
  }, [restaurants]);

  // Popular restaurants - top 4 by rating
  const popularRestaurants = useMemo(() => {
    return [...restaurants]
      .filter((r): r is RestaurantResponseType => !!r)
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 4);
  }, [restaurants]);

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
                src="/placeholder.svg"
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
            defaultValue={DeliveryType.DELIVERY}
            className="w-full"
            onValueChange={(value) => setDeliveryType(value as DeliveryType)}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">
                {t("home.restaurantsNearYou.title")}
              </h2>
              <TabsList>
                <TabsTrigger value={DeliveryType.DELIVERY}>
                  {t("home.restaurantsNearYou.delivery")}
                </TabsTrigger>
                <TabsTrigger value={DeliveryType.PICKUP}>
                  {t("home.restaurantsNearYou.pickup")}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={DeliveryType.DELIVERY} className="mt-6">
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
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() =>
                      submitForm(undefined, { urlParamVariables: undefined })
                    }
                  >
                    {t("common.tryAgain")}
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value={DeliveryType.PICKUP} className="mt-6">
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
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() =>
                      submitForm(undefined, { urlParamVariables: undefined })
                    }
                  >
                    {t("common.tryAgain")}
                  </Button>
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
