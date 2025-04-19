"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "next-vibe-ui/ui";
import type { JSX } from "react";
import { useEffect, useState } from "react";

import { useMenuItems } from "@/app/api/v1/menu-items/hooks";
import { useRestaurant } from "@/app/api/v1/restaurant/hooks";
import { MenuItem } from "@/app/app/components/menu-item";
import { useRestaurantConfig } from "@/app/app/components/restaurant-config-provider";
import { RestaurantMenuCategories } from "@/app/app/components/restaurant-menu-categories";

export default function RestaurantMenuPage(): JSX.Element | null {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const {
    data: restaurant,
    isLoading: isLoadingRestaurant,
    error: restaurantError,
  } = useRestaurant(id);
  const {
    data: menuItemsData,
    isLoading: isLoadingMenuItems,
    error: menuItemsError,
  } = useMenuItems({ restaurantId: id });
  useRestaurantConfig(); // Load restaurant config

  const isLoading = isLoadingRestaurant || isLoadingMenuItems;
  const error = restaurantError ?? menuItemsError;

  const menuItems = menuItemsData ?? [];

  const [activeCategory, setActiveCategory] = useState<string>("");

  // Group menu items by category
  const _categories: {
    [id: string]: {
      name: string;
      image: string;
      id: string;
    };
  } = {};
  menuItems.forEach((item) => {
    if (item.category?.id) {
      _categories[item.category.id] = item.category;
    }
  });
  const categories = Object.values(_categories);
  const itemsByCategory = categories.map((category) => ({
    category,
    items: menuItems.filter((item) => item.category?.id === category.id),
  }));

  // Set initial active category
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container px-4 md:px-6 py-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading menu items...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !restaurant) {
    return (
      <div className="container px-4 md:px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-3xl font-bold mb-4">
            {error ? "Error loading menu" : "Restaurant not found"}
          </h1>
          <p className="text-muted-foreground max-w-2xl mb-6">
            {error
              ? "There was a problem loading the menu items. Please try again later."
              : "The restaurant you are looking for does not exist or has been removed."}
          </p>
          {error && (
            <div className="mt-2 mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive max-w-md">
              <p className="font-medium">Error details:</p>
              <p>{error?.message ?? "Unknown error"}</p>
            </div>
          )}
          <Button size="lg" asChild>
            <Link href={`/restaurant/${id}`}>Back to Restaurant</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Our Menu</h1>
          <p className="text-muted-foreground">
            Explore our delicious offerings and place your order
          </p>
        </div>

        {/* Menu Categories */}
        <RestaurantMenuCategories
          categories={categories}
          onSelectCategory={setActiveCategory}
          activeCategory={activeCategory}
        />

        {/* Menu Items */}
        <div className="space-y-12">
          {itemsByCategory
            .filter(
              ({ category }) =>
                !activeCategory || category.id === activeCategory,
            )
            .map(({ category, items }) => (
              <div
                key={category.name}
                id={category.name.toLowerCase().replace(/\s+/g, "-")}
              >
                <h2 className="text-2xl font-bold mb-6">{category.name}</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {items.map((item) => (
                    <MenuItem key={item.name} item={item} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
