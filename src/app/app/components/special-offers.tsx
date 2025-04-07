"use client";
import Image from "next/image";
import type { JSX } from "react";

import { useRestaurants } from "@/app/api/v1/restaurants/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useRestaurantConfig } from "./restaurant-config-provider";

interface SpecialOffersProps {
  restaurantId: string;
}

export function SpecialOffers({
  restaurantId,
}: SpecialOffersProps): JSX.Element | null {
  const config = useRestaurantConfig();
  const { getMenuItemById } = useRestaurants();

  if (!config.specialOffers || config.specialOffers.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-muted">
      <div className="container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Special Offers</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {config.specialOffers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden">
              {offer.image && (
                <div className="relative h-48 w-full">
                  <Image
                    src={offer.image || "/placeholder.svg"}
                    alt={offer.title}
                    fill
                    className="object-cover"
                  />
                  {offer.discount && (
                    <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                      {offer.discount} OFF
                    </Badge>
                  )}
                </div>
              )}

              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                {offer.description && (
                  <p className="text-muted-foreground mb-4">
                    {offer.description}
                  </p>
                )}
                {offer.validUntil && (
                  <p className="text-sm font-medium mb-4">
                    Valid: {offer.validUntil}
                  </p>
                )}

                {offer.itemIds && offer.itemIds.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      Included Items:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {offer.itemIds.map((itemId) => {
                        const item = getMenuItemById(itemId);
                        return item ? (
                          <Badge key={itemId} variant="outline">
                            {item.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <Button className="w-full mt-4" asChild>
                  <a href="#menu">Order Now</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
