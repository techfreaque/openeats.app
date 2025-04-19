"use client";

import { Clock, Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "next-vibe/i18n";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { cn } from "next-vibe/shared/utils/utils";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  Skeleton,
  useToast,
} from "next-vibe-ui/ui";
import type React from "react";
import { useState } from "react";

import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";
import type { RestaurantResponseType } from "@/app/api/v1/restaurant/schema/restaurant.schema";

import { useFavorites } from "./hooks/use-favorites";

interface RestaurantCardProps {
  restaurant: RestaurantResponseType;
}

export function RestaurantCard({
  restaurant,
}: RestaurantCardProps): React.JSX.Element {
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = isFavorite(restaurant.id);
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isImageError, setIsImageError] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (favorite) {
        await removeFavorite(restaurant.id);
        toast({
          title: t("restaurant.removedFromFavorites"),
          description: t("restaurant.removedFromFavoritesDescription", {
            name: restaurant.name,
          }),
        });
      } else {
        await addFavorite(restaurant.id);
        toast({
          title: t("restaurant.addedToFavorites"),
          description: t("restaurant.addedToFavoritesDescription", {
            name: restaurant.name,
          }),
        });
      }
    } catch (error) {
      errorLogger("Error toggling favorite status:", error);
      toast({
        title: t("common.error"),
        description: t("restaurant.favoriteError"),
        variant: "destructive",
      });
    }
  };

  const handleImageError = (): void => {
    setIsImageError(true);
  };

  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={
              isImageError || !restaurant.image
                ? "/placeholder.svg"
                : restaurant.image
            }
            alt={restaurant.name}
            fill
            className="object-cover transition-all hover:scale-105"
            onError={handleImageError}
            priority={false}
            loading="lazy"
          />
          {/* Only show promoted badge if the property exists */}
          {restaurant.verified && (
            <Badge
              variant="secondary"
              className="absolute left-2 top-2 bg-primary text-primary-foreground"
            >
              {t("restaurant.verified")}
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
              {restaurant.mainCategory?.name || t("restaurant.uncategorized")}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 pt-0 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>
              {restaurant.rating || "0"} ({restaurant.orderCount || 0}{" "}
              {t("restaurant.orders")})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {restaurant.delivery
                ? t("restaurant.delivery")
                : restaurant.pickup
                  ? t("restaurant.pickup")
                  : t("restaurant.dineIn")}
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
