"use client";

import {
  AlertCircle,
  Filter,
  Loader2,
  Search,
  SlidersHorizontal,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "next-vibe/i18n";
import {
  Badge,
  Button,
  Checkbox,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "next-vibe-ui/ui";
import type { JSX } from "react";
import { useEffect, useState } from "react";

import { useMenuItems } from "@/app/api/v1/menu-items/hooks";
import { useRestaurant } from "@/app/api/v1/restaurant/hooks";
import { LanguageSelector } from "@/app/app/components/language-selector";
import { MenuItem } from "@/app/app/components/menu-item";
import { useRestaurantConfig } from "@/app/app/components/restaurant-config-provider";
import { RestaurantMenuCategories } from "@/app/app/components/restaurant-menu-categories";

// Define dietary filter types
type DietaryFilter =
  | "vegetarian"
  | "vegan"
  | "glutenFree"
  | "dairyFree"
  | "spicy"
  | "organic";

// Define price range filter
type PriceRange = "all" | "under10" | "10to20" | "over20";

export default function RestaurantMenuPage(): JSX.Element | null {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { t } = useTranslation();

  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilters, setDietaryFilters] = useState<DietaryFilter[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");

  // API data
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
  const config = useRestaurantConfig(); // Load restaurant config

  const isLoading = isLoadingRestaurant || isLoadingMenuItems;
  const error = restaurantError ?? menuItemsError;

  const menuItems = menuItemsData ?? [];

  // Filter menu items based on search query and filters
  const filteredMenuItems = menuItems.filter((item) => {
    // Search filter
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Price filter
    if (priceRange === "under10" && item.price >= 10) {
      return false;
    }
    if (priceRange === "10to20" && (item.price < 10 || item.price > 20)) {
      return false;
    }
    if (priceRange === "over20" && item.price <= 20) {
      return false;
    }

    // Dietary filters - in a real app, these would be properties of the menu items
    // For now, we'll simulate this with some logic based on the item description
    if (dietaryFilters.length > 0) {
      const itemDescription = item.description.toLowerCase();
      const matchesDietary = dietaryFilters.some((filter) => {
        switch (filter) {
          case "vegetarian":
            return (
              itemDescription.includes("vegetarian") ||
              !itemDescription.includes("meat")
            );
          case "vegan":
            return itemDescription.includes("vegan");
          case "glutenFree":
            return (
              itemDescription.includes("gluten-free") ||
              itemDescription.includes("gluten free")
            );
          case "dairyFree":
            return (
              itemDescription.includes("dairy-free") ||
              itemDescription.includes("dairy free")
            );
          case "spicy":
            return (
              itemDescription.includes("spicy") ||
              itemDescription.includes("hot")
            );
          case "organic":
            return itemDescription.includes("organic");
          default:
            return false;
        }
      });
      if (!matchesDietary) {
        return false;
      }
    }

    return true;
  });

  // Group menu items by category
  const _categories: {
    [id: string]: {
      name: string;
      image: string;
      id: string;
    };
  } = {};
  filteredMenuItems.forEach((item) => {
    if (item.category?.id) {
      _categories[item.category.id] = item.category;
    }
  });
  const categories = Object.values(_categories);
  const itemsByCategory = categories.map((category) => ({
    category,
    items: filteredMenuItems.filter(
      (item) => item.category?.id === category.id,
    ),
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

  // Toggle dietary filter
  const toggleDietaryFilter = (filter: DietaryFilter) => {
    setDietaryFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setDietaryFilters([]);
    setPriceRange("all");
    setActiveCategory("");
  };

  // Get featured items (items with highest price or special flag in a real app)
  const featuredItems = [...menuItems]
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);

  return (
    <div className="pb-20">
      {/* Hero section */}
      <div className="bg-muted py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {restaurant?.name} - {t("restaurant.menu.title", "Our Menu")}
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                {t(
                  "restaurant.menu.subtitle",
                  "Explore our delicious offerings and place your order",
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/restaurant/${id}`}>
                  {t("restaurant.menu.backToRestaurant", "Back to Restaurant")}
                </Link>
              </Button>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8">
        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t(
                "restaurant.menu.searchPlaceholder",
                "Search menu items...",
              )}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Sheet open={showFiltersSheet} onOpenChange={setShowFiltersSheet}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                {t("restaurant.menu.filters", "Filters")}
                {(dietaryFilters.length > 0 || priceRange !== "all") && (
                  <Badge variant="secondary" className="ml-1">
                    {dietaryFilters.length + (priceRange !== "all" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  {t("restaurant.menu.filterOptions", "Filter Options")}
                </SheetTitle>
                <SheetDescription>
                  {t(
                    "restaurant.menu.filterDescription",
                    "Customize your menu view with these filters.",
                  )}
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">
                    {t(
                      "restaurant.menu.dietaryPreferences",
                      "Dietary Preferences",
                    )}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="vegetarian"
                        checked={dietaryFilters.includes("vegetarian")}
                        onCheckedChange={() =>
                          toggleDietaryFilter("vegetarian")
                        }
                      />
                      <Label htmlFor="vegetarian" className="ml-2">
                        {t("restaurant.menu.vegetarian", "Vegetarian")}
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="vegan"
                        checked={dietaryFilters.includes("vegan")}
                        onCheckedChange={() => toggleDietaryFilter("vegan")}
                      />
                      <Label htmlFor="vegan" className="ml-2">
                        {t("restaurant.menu.vegan", "Vegan")}
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="glutenFree"
                        checked={dietaryFilters.includes("glutenFree")}
                        onCheckedChange={() =>
                          toggleDietaryFilter("glutenFree")
                        }
                      />
                      <Label htmlFor="glutenFree" className="ml-2">
                        {t("restaurant.menu.glutenFree", "Gluten Free")}
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="dairyFree"
                        checked={dietaryFilters.includes("dairyFree")}
                        onCheckedChange={() => toggleDietaryFilter("dairyFree")}
                      />
                      <Label htmlFor="dairyFree" className="ml-2">
                        {t("restaurant.menu.dairyFree", "Dairy Free")}
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="spicy"
                        checked={dietaryFilters.includes("spicy")}
                        onCheckedChange={() => toggleDietaryFilter("spicy")}
                      />
                      <Label htmlFor="spicy" className="ml-2">
                        {t("restaurant.menu.spicy", "Spicy")}
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="organic"
                        checked={dietaryFilters.includes("organic")}
                        onCheckedChange={() => toggleDietaryFilter("organic")}
                      />
                      <Label htmlFor="organic" className="ml-2">
                        {t("restaurant.menu.organic", "Organic")}
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">
                    {t("restaurant.menu.priceRange", "Price Range")}
                  </h3>
                  <RadioGroup
                    value={priceRange}
                    onValueChange={(value) =>
                      setPriceRange(value as PriceRange)
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all">
                        {t("restaurant.menu.allPrices", "All Prices")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="under10" id="under10" />
                      <Label htmlFor="under10">
                        {t("restaurant.menu.under10", "Under $10")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="10to20" id="10to20" />
                      <Label htmlFor="10to20">
                        {t("restaurant.menu.10to20", "$10 to $20")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="over20" id="over20" />
                      <Label htmlFor="over20">
                        {t("restaurant.menu.over20", "Over $20")}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={resetFilters}>
                  {t("restaurant.menu.resetFilters", "Reset Filters")}
                </Button>
                <Button onClick={() => setShowFiltersSheet(false)}>
                  {t("restaurant.menu.applyFilters", "Apply Filters")}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active filters display */}
        {(dietaryFilters.length > 0 || priceRange !== "all" || searchQuery) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                <Search className="h-3 w-3" />
                {searchQuery}
                <button
                  className="ml-1 hover:text-destructive"
                  onClick={() => setSearchQuery("")}
                >
                  ×
                </button>
              </Badge>
            )}
            {dietaryFilters.map((filter) => (
              <Badge key={filter} variant="secondary" className="gap-1">
                <Tag className="h-3 w-3" />
                {t(`restaurant.menu.${filter}`, filter)}
                <button
                  className="ml-1 hover:text-destructive"
                  onClick={() => toggleDietaryFilter(filter)}
                >
                  ×
                </button>
              </Badge>
            ))}
            {priceRange !== "all" && (
              <Badge variant="secondary" className="gap-1">
                <Filter className="h-3 w-3" />
                {t(`restaurant.menu.${priceRange}`, priceRange)}
                <button
                  className="ml-1 hover:text-destructive"
                  onClick={() => setPriceRange("all")}
                >
                  ×
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={resetFilters}
            >
              {t("restaurant.menu.clearAll", "Clear All")}
            </Button>
          </div>
        )}

        {/* Featured items section - only show if we have items and no filters active */}
        {featuredItems.length > 0 &&
          !searchQuery &&
          dietaryFilters.length === 0 &&
          priceRange === "all" &&
          !activeCategory && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">
                {t("restaurant.menu.featuredItems", "Featured Items")}
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {featuredItems.map((item) => (
                  <MenuItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

        {/* Menu Categories */}
        <RestaurantMenuCategories
          categories={categories}
          onSelectCategory={setActiveCategory}
          activeCategory={activeCategory}
        />

        {/* Menu Items */}
        <div className="space-y-12">
          {itemsByCategory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {t(
                  "restaurant.menu.noItemsFound",
                  "No menu items found matching your filters.",
                )}
              </p>
              <Button variant="outline" className="mt-4" onClick={resetFilters}>
                {t("restaurant.menu.resetFilters", "Reset Filters")}
              </Button>
            </div>
          ) : (
            itemsByCategory
              .filter(
                ({ category }) =>
                  !activeCategory || category.id === activeCategory,
              )
              .map(({ category, items }) => (
                <div
                  key={category.id}
                  id={category.name.toLowerCase().replace(/\s+/g, "-")}
                >
                  <h2 className="text-2xl font-bold mb-6">{category.name}</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {items.map((item) => (
                      <MenuItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
