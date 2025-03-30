"use client";

import { Heart, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "next-vibe/shared/utils/utils";
import { useAuth } from "@/hooks/useAuth";
import type { JSX } from "react";
import { useState } from "react";

import { Button } from "@/components/ui";

import { FeaturedCollection } from "../../components/featured-collection";
import { useFavorites } from "../../components/hooks/use-favorites";
import { useRestaurants } from "../../components/hooks/use-restaurants";
import {
  type OrderType,
  OrderTypeSelector,
} from "../../components/order-type-selector";
import { useRestaurantConfig } from "../../components/restaurant-config-provider";
import { RestaurantHero } from "../../components/restaurant-hero";
import { RestaurantStory } from "../../components/restaurant-story";
import { SpecialOffers } from "../../components/special-offers";

export default function RestaurantHomePage(): JSX.Element | null {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { getRestaurantById } = useRestaurants();
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const config = useRestaurantConfig();

  const restaurant = getRestaurantById(id);
  const favorite = restaurant ? isFavorite(restaurant.id) : false;

  const [orderType, setOrderType] = useState<OrderType>("delivery");

  // Mock gallery images
  const galleryImages = Array(8)
    .fill(0)
    .map((_, i) => ({
      src: `/placeholder.svg?height=400&width=600&text=Restaurant+Photo+${i + 1}`,
      alt: `Restaurant photo ${i + 1}`,
    }));

  const handleFavoriteClick = (): void => {
    if (!restaurant) {
      return;
    }

    if (favorite) {
      removeFavorite(restaurant.id);
    } else {
      addFavorite(restaurant.id);
    }
  };

  if (!restaurant) {
    return null;
  }

  return (
    <>
      {/* Hero Section */}
      {config.hero.showHero && (
        <RestaurantHero
          restaurantName={restaurant.name}
          restaurantImage={restaurant.image}
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
                      {favorite ? "Remove from favorites" : "Add to favorites"}
                    </span>
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>
                    {restaurant.rating} ({restaurant.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Categories:</span>
                  <span>{restaurant.categories.join(", ")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Delivery:</span>
                  <span>{restaurant.deliveryTime} min</span>
                </div>
              </div>
              <p className="text-muted-foreground">{restaurant.description}</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border bg-muted p-4">
                <h3 className="font-medium">Hours</h3>
                <div className="mt-2 grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>11:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday - Sunday</span>
                    <span>10:00 AM - 11:00 PM</span>
                  </div>
                </div>
              </div>
              <OrderTypeSelector
                value={orderType}
                onChange={setOrderType}
                options={config.orderOptions}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Special Offers Section */}
      {config.specialOffers && config.specialOffers.length > 0 && (
        <SpecialOffers restaurantId={restaurant.id} />
      )}

      {/* Restaurant Story Section */}
      {config.showStory && config.story && (
        <RestaurantStory restaurantName={restaurant.name} />
      )}

      {/* Featured Collections */}
      {config.featuredCollections && config.featuredCollections.length > 0 && (
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
            <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
            <p className="text-muted-foreground max-w-2xl mb-6">
              Explore our full menu and place your order for delivery or pickup.
            </p>
            <Button size="lg" asChild>
              <Link href={`/app/restaurant/${restaurant.id}/menu`}>
                View Full Menu
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
