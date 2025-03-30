"use client";

import { useParams } from "next/navigation";
import type { JSX } from "react";
import { useEffect, useState } from "react";

import { useRestaurants } from "@/app/app/components/hooks/use-restaurants";
import { MenuItem } from "@/app/app/components/menu-item";
import { useRestaurantConfig } from "@/app/app/components/restaurant-config-provider";
import { RestaurantMenuCategories } from "@/app/app/components/restaurant-menu-categories";

export default function RestaurantMenuPage(): JSX.Element | null {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { getRestaurantById, getMenuItemsByRestaurantId } = useRestaurants();
  const config = useRestaurantConfig();

  const restaurant = getRestaurantById(id);
  const menuItems = getMenuItemsByRestaurantId(id);

  const [activeCategory, setActiveCategory] = useState<string>("");

  // Group menu items by category
  const categories = [...new Set(menuItems.map((item) => item.category))];
  const itemsByCategory = categories.map((category) => ({
    category,
    items: menuItems.filter((item) => item.category === category),
  }));

  // Set initial active category
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [activeCategory]);

  if (!restaurant) {
    return null;
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
              ({ category }) => !activeCategory || category === activeCategory,
            )
            .map(({ category, items }) => (
              <div
                key={category}
                id={category.toLowerCase().replace(/\s+/g, "-")}
              >
                <h2 className="text-2xl font-bold mb-6">{category}</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {items.map((item) => (
                    <MenuItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
