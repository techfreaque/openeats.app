"use client";

import {
  AlertCircle,
  Calendar,
  Clock,
  ExternalLink,
  Heart,
  Info,
  MapPin,
  Phone,
  Share2,
  Star,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "next-vibe/i18n";
import { cn } from "next-vibe/shared/utils/utils";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from "next-vibe-ui/ui";
import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";

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
  const { t } = useTranslation();
  const { toast } = useToast();

  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const config = useRestaurantConfig();

  const { data: restaurant, isLoading, error } = useRestaurant(id);

  // Fallback restaurant data when API fails
  const fallbackRestaurant = useMemo(
    () => ({
      id,
      name: "Restaurant Name",
      description:
        "This is a fallback description for when the API fails to load the restaurant data. The application is still functional with limited features.",
      city: "City",
      zip: "12345",
      phone: "(123) 456-7890",
      email: "contact@restaurant.com",
      image: "/placeholder.svg?height=400&width=1200&text=Restaurant+Cover",
      openingTimes: [
        { day: 0, open: 600, close: 1320, published: true },
        { day: 1, open: 600, close: 1320, published: true },
        { day: 2, open: 600, close: 1320, published: true },
        { day: 3, open: 600, close: 1320, published: true },
        { day: 4, open: 600, close: 1320, published: true },
        { day: 5, open: 600, close: 1380, published: true },
        { day: 6, open: 600, close: 1380, published: true },
      ],
      menuItems: [],
      rating: 4.5,
      orderCount: 100,
      priceLevel: 2,
      street: "123 Main St",
      streetNumber: "1",
      countryId: "DE",
      delivery: true,
      pickup: true,
      dineIn: false,
      published: true,
      verified: true,
      latitude: 0,
      longitude: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mainCategory: {
        id: "00000000-0000-0000-0000-000000000000",
        name: "General",
        image: "",
      },
    }),
    [id],
  );

  // Determine if we're in development mode
  const isDevelopment =
    typeof window !== "undefined" && window.location.hostname === "localhost";

  // Use fallback data if there's an API error but still show the page
  const restaurantData =
    error && isDevelopment ? fallbackRestaurant : restaurant;
  const favorite = restaurantData ? isFavorite(restaurantData.id) : false;

  const [orderType, setOrderType] = useState<OrderType>("delivery");

  // Show error toast and development mode banner
  useEffect(() => {
    if (error) {
      // Show error toast
      toast({
        title: t("common.error"),
        description: t("restaurant.notFound"),
        variant: "destructive",
      });

      // Show development mode banner if using fallback data
      if (isDevelopment && restaurantData === fallbackRestaurant) {
        toast({
          title: "Development Mode",
          description: `Using fallback restaurant data. ${
            error instanceof Error ? error.message : "API error"
          }`,
          variant: "destructive",
        });
      }
    }
  }, [error, t, toast, isDevelopment, restaurantData, fallbackRestaurant]);

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
          {error && typeof error === "object" && "message" in error && (
            <div className="mt-2 mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive max-w-md">
              <p className="font-medium">Error details:</p>
              <p>{error instanceof Error ? error.message : "Unknown error"}</p>
            </div>
          )}
          <Button size="lg" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Restaurant data is available at this point

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
    if (minutes == null || typeof minutes !== "number" || isNaN(minutes)) {
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
                {restaurantData.priceLevel && (
                  <Badge variant="outline" className="px-2 py-0">
                    {Array(restaurantData.priceLevel).fill("$").join("")}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {restaurantData.description}
              </p>

              {/* Restaurant details */}
              <div className="pt-4 space-y-3 border-t mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>
                    {restaurantData.street ?? ""}{" "}
                    {restaurantData.streetNumber ?? ""},{" "}
                    {restaurantData.zip ?? ""} {restaurantData.city ?? ""}
                  </span>
                </div>
                {typeof restaurantData.phone === "string" &&
                  restaurantData.phone.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      <a
                        href={`tel:${restaurantData.phone}`}
                        className="hover:underline"
                      >
                        {restaurantData.phone}
                      </a>
                    </div>
                  )}
                {typeof restaurantData.email === "string" &&
                  restaurantData.email.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Info className="h-4 w-4 text-primary" />
                      <a
                        href={`mailto:${restaurantData.email}`}
                        className="hover:underline"
                      >
                        {restaurantData.email}
                      </a>
                    </div>
                  )}
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a
                      href={`https://maps.google.com/?q=${restaurantData.latitude},${restaurantData.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Directions
                    </a>
                  </Button>
                </div>
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

      {/* Reservation System */}
      <div className="py-12 bg-background border-t">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold mb-4">Make a Reservation</h2>
              <p className="text-muted-foreground mb-6">
                Reserve your table in advance to ensure the best dining
                experience.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">Available 7 days a week</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium">Lunch & Dinner hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    Special events & private dining available
                  </span>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="mt-6">
                    Book a Table
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Reserve a Table</DialogTitle>
                    <DialogDescription>
                      Select your preferred date, time and party size.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <Tabs defaultValue="date">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="date">Date</TabsTrigger>
                        <TabsTrigger value="time">Time</TabsTrigger>
                        <TabsTrigger value="guests">Guests</TabsTrigger>
                      </TabsList>
                      <TabsContent value="date" className="p-4">
                        <div className="grid grid-cols-7 gap-2">
                          {Array.from({ length: 14 }).map((_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() + i);
                            return (
                              <Button
                                key={i}
                                variant={i === 3 ? "default" : "outline"}
                                className="h-12 w-full flex flex-col p-1"
                              >
                                <span className="text-xs">
                                  {date.toLocaleDateString("en-US", {
                                    weekday: "short",
                                  })}
                                </span>
                                <span className="text-sm font-bold">
                                  {date.getDate()}
                                </span>
                              </Button>
                            );
                          })}
                        </div>
                      </TabsContent>
                      <TabsContent value="time" className="p-4">
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            "11:30",
                            "12:00",
                            "12:30",
                            "13:00",
                            "13:30",
                            "18:00",
                            "18:30",
                            "19:00",
                            "19:30",
                            "20:00",
                            "20:30",
                            "21:00",
                          ].map((time, i) => (
                            <Button
                              key={time}
                              variant={i === 5 ? "default" : "outline"}
                              className="h-10"
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="guests" className="p-4">
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <Button
                              key={num}
                              variant={num === 2 ? "default" : "outline"}
                              className="h-10"
                            >
                              {num} {num === 1 ? "Guest" : "Guests"}
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <DialogFooter>
                    <Button type="submit">Confirm Reservation</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-lg overflow-hidden border">
              <iframe
                src={`https://maps.google.com/maps?q=${restaurantData.latitude},${restaurantData.longitude}&z=15&output=embed`}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map location for ${restaurantData.name}`}
              />
            </div>
          </div>
        </div>
      </div>

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
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href={`/restaurant/${restaurantData.id}/menu`}>
                  {t("restaurant.menu.viewFullMenu")}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/restaurant/${restaurantData.id}/reviews`}>
                  View All Reviews
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
