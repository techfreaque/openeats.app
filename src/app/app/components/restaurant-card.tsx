"use client";

import { Clock, Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "next-vibe/shared/utils/utils";
import { useAuth } from "@/hooks/useAuth";
import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useFavorites } from "./hooks/use-favorites";
import { useTranslation } from "./lib/i18n";
import type { RestaurantType } from "./lib/types";

interface RestaurantCardProps {
  restaurant: RestaurantType;
}

export function RestaurantCard({
  restaurant,
}: RestaurantCardProps): React.JSX.Element {
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = isFavorite(restaurant.id);
  const { t } = useTranslation();

  const handleFavoriteClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    if (favorite) {
      removeFavorite(restaurant.id);
    } else {
      addFavorite(restaurant.id);
    }
  };

  return (
    <Link href={`/app/restaurant/${restaurant.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={restaurant.image || "/placeholder.svg"}
            alt={restaurant.name}
            fill
            className="object-cover transition-all hover:scale-105"
          />
          {restaurant.promoted && (
            <Badge
              variant="secondary"
              className="absolute left-2 top-2 bg-primary text-primary-foreground"
            >
              {t("restaurant.promoted")}
            </Badge>
          )}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm",
                favorite
                  ? "text-red-500 hover:text-red-600"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={handleFavoriteClick}
            >
              <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
              <span className="sr-only">
                {favorite
                  ? t("restaurant.removeFromFavorites")
                  : t("restaurant.addToFavorites")}
              </span>
            </Button>
          )}
        </div>
        <CardContent className="p-4">
          <div className="space-y-1">
            <h3 className="font-semibold">{restaurant.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {restaurant.categories.join(", ")}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 pt-0 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>
              {restaurant.rating} ({restaurant.reviews}{" "}
              {t("restaurant.reviews")})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {restaurant.deliveryTime} {t("restaurant.minutes")}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

export function RestaurantCardSkeleton(): React.JSX.Element {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </CardFooter>
    </Card>
  );
}
