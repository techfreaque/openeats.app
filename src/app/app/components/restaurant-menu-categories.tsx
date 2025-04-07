"use client";
import Image from "next/image";
import { cn } from "next-vibe/shared/utils/utils";
import type { JSX } from "react";

import { useRestaurantConfig } from "./restaurant-config-provider";

interface RestaurantMenuCategoriesProps {
  categories: {
    name: string;
    image: string;
    id: string;
  }[];
  onSelectCategory: (category: string) => void;
  activeCategory?: string;
}

export function RestaurantMenuCategories({
  categories,
  onSelectCategory,
  activeCategory,
}: RestaurantMenuCategoriesProps): JSX.Element {
  const config = useRestaurantConfig();

  // If we have custom menu categories with images in the config, use those
  if (config.menuCategories && config.menuCategories.length > 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {config.menuCategories.map((category) => (
          <button
            key={category.id}
            className={cn(
              "relative rounded-lg overflow-hidden transition-all",
              activeCategory === category.id
                ? "ring-2 ring-primary"
                : "hover:opacity-90",
            )}
            onClick={() => onSelectCategory(category.id)}
          >
            <div className="relative aspect-square">
              {category.image ? (
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">🍽️</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-medium">{category.name}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  // Otherwise, use the standard categories from the menu items
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          className={cn(
            "px-4 py-2 rounded-full transition-colors",
            activeCategory === category.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80",
          )}
          onClick={() => onSelectCategory(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
