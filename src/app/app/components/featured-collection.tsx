"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { JSX } from "react";
import { useState } from "react";

import { useRestaurants } from "@/app/api/v1/restaurants/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import type { MenuItemType } from "./lib/types";

interface FeaturedCollectionProps {
  title: string;
  description?: string;
  itemIds: string[];
  restaurantId: string;
}

export function FeaturedCollection({
  title,
  description,
  itemIds,
  restaurantId,
}: FeaturedCollectionProps): JSX.Element | null {
  const { getMenuItemById } = useRestaurants();
  const [scrollPosition, setScrollPosition] = useState(0);

  // Get menu items from IDs
  const items: MenuItemType[] = itemIds
    .map((id) => getMenuItemById(id))
    .filter((item): item is MenuItemType => item !== null);

  const scrollContainer = (direction: "left" | "right"): void => {
    const container = document.getElementById(
      `collection-${title.replace(/\s+/g, "-").toLowerCase()}`,
    );
    if (!container) {
      return;
    }

    const scrollAmount = 300;
    const newPosition =
      direction === "left"
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    setScrollPosition(newPosition);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scrollContainer("left")}
            disabled={scrollPosition === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Scroll left</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scrollContainer("right")}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Scroll right</span>
          </Button>
        </div>
      </div>

      <div
        id={`collection-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => (
          <Card
            key={item.id}
            className="flex-shrink-0 w-[280px] overflow-hidden"
          >
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
              <p className="mt-2 font-medium">${item.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/app/item/${item.id}`}>View Item</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
