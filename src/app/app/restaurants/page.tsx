"use client";

import { Filter, Search } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { CategoryPill } from "../components/category-pill";
import { useRestaurants } from "../components/hooks/use-restaurants";
import type { FilterOptions, RestaurantType } from "../components/lib/types";
import {
  RestaurantCard,
  RestaurantCardSkeleton,
} from "../components/restaurant-card";

export default function RestaurantsPage(): React.JSX.Element {
  const { restaurants, isLoading, filterRestaurants } = useRestaurants();

  const [activeCategory, setActiveCategory] = useState("all");
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [dietaryFilter, setDietaryFilter] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<
    "relevance" | "rating" | "delivery-time" | "price-low" | "price-high"
  >("relevance");
  const [filteredResults, setFilteredResults] = useState<RestaurantType[]>([]);

  const categories = [
    { name: "All", icon: "🍽️", value: "all" },
    { name: "Fast Food", icon: "🍔", value: "fast food" },
    { name: "Pizza", icon: "🍕", value: "pizza" },
    { name: "Sushi", icon: "🍣", value: "sushi" },
    { name: "Chinese", icon: "🥡", value: "chinese" },
    { name: "Mexican", icon: "🌮", value: "mexican" },
    { name: "Italian", icon: "🍝", value: "italian" },
    { name: "Dessert", icon: "🍰", value: "dessert" },
    { name: "Breakfast", icon: "🥞", value: "breakfast" },
    { name: "Healthy", icon: "🥗", value: "healthy" },
  ];

  // Filter restaurants based on category
  // let filteredRestaurants = activeCategory === "all" ? restaurants : filterRestaurantsByCategory(activeCategory)
  useEffect(() => {
    const filterOptions: FilterOptions = {
      category: activeCategory === "all" ? undefined : activeCategory,
      priceRange: priceFilter.length > 0 ? priceFilter : undefined,
      dietary: dietaryFilter.length > 0 ? dietaryFilter : undefined,
      sortBy: sortOption === "relevance" ? undefined : sortOption,
      deliveryType: deliveryType as "delivery" | "pickup" | "all",
    };

    setFilteredResults(filterRestaurants(filterOptions));
  }, [
    activeCategory,
    priceFilter,
    dietaryFilter,
    sortOption,
    deliveryType,
    filterRestaurants,
  ]);

  // Filter by delivery type
  // if (deliveryType === "pickup") {
  //   filteredRestaurants = filteredRestaurants.filter((r) => r.pickup)
  // }

  // Filter by search query
  const displayedRestaurants = filteredResults;

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    // filteredRestaurants = filteredRestaurants.filter(
    //   (r) =>
    //     r.name.toLowerCase().includes(query) ||
    //     r.categories.some((c) => c.toLowerCase().includes(query) ||
    //     r.description.toLowerCase().includes(query),
    // )
    displayedRestaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.categories.some((c) => c.toLowerCase().includes(query)) ||
        r.description.toLowerCase().includes(query),
    );
  }

  // Filter by price (mock implementation)
  // if (priceFilter.length > 0) {
  //   // This is a mock implementation since we don't have price range data
  //   // In a real app, you would filter based on actual price range data
  //   const cheapRestaurants = restaurants.filter((_, i) => i % 3 === 0)
  //   const mediumRestaurants = restaurants.filter((_, i) => i % 3 === 1)
  //   const expensiveRestaurants = restaurants.filter((_, i) => i % 3 === 2)

  //   let priceFilteredRestaurants: typeof restaurants = []

  //   if (priceFilter.includes("$")) {
  //     priceFilteredRestaurants = [...priceFilteredRestaurants, ...cheapRestaurants]
  //   }
  //   if (priceFilter.includes("$$")) {
  //     priceFilteredRestaurants = [...priceFilteredRestaurants, ...mediumRestaurants]
  //   }
  //   if (priceFilter.includes("$$$")) {
  //     priceFilteredRestaurants = [...priceFilteredRestaurants, ...expensiveRestaurants]
  //   }

  //   filteredRestaurants = filteredRestaurants.filter((r) => priceFilteredRestaurants.some((pr) => pr.id === r.id))
  // }

  // Filter by dietary preferences (mock implementation)
  // if (dietaryFilter.length > 0) {
  //   // This is a mock implementation since we don't have dietary data
  //   // In a real app, you would filter based on actual dietary data
  //   const vegetarianRestaurants = restaurants.filter((_, i) => i % 2 === 0)
  //   const veganRestaurants = restaurants.filter((_, i) => i % 3 === 0)
  //   const glutenFreeRestaurants = restaurants.filter((_, i) => i % 4 === 0)

  //   let dietaryFilteredRestaurants: typeof restaurants = []

  //   if (dietaryFilter.includes("vegetarian")) {
  //     dietaryFilteredRestaurants = [...dietaryFilteredRestaurants, ...vegetarianRestaurants]
  //   }
  //   if (dietaryFilter.includes("vegan")) {
  //     dietaryFilteredRestaurants = [...dietaryFilteredRestaurants, ...veganRestaurants]
  //   }
  //   if (dietaryFilter.includes("gluten-free")) {
  //     dietaryFilteredRestaurants = [...dietaryFilteredRestaurants, ...glutenFreeRestaurants]
  //   }

  //   filteredRestaurants = filteredRestaurants.filter((r) => dietaryFilteredRestaurants.some((dr) => dr.id === r.id))
  // }

  const handlePriceFilterChange = (value: string): void => {
    setPriceFilter((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleDietaryFilterChange = (value: string): void => {
    setDietaryFilter((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    // Search is already handled by the state change
  };

  const clearFilters = (): void => {
    setActiveCategory("all");
    setSearchQuery("");
    setPriceFilter([]);
    setDietaryFilter([]);
    setSortOption("relevance");
  };

  return (
    <div className="flex-1">
      <section className="w-full py-6 md:py-8 lg:py-10 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Restaurants</h1>
              <p className="text-muted-foreground">
                Find the best restaurants in your area
              </p>
            </div>
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-sm items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search restaurants..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" type="button">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filter</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Refine your restaurant search
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-6 py-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Price Range</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="price-1"
                            checked={priceFilter.includes("$")}
                            onCheckedChange={() => handlePriceFilterChange("$")}
                          />
                          <Label htmlFor="price-1">$ (Inexpensive)</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="price-2"
                            checked={priceFilter.includes("$$")}
                            onCheckedChange={() =>
                              handlePriceFilterChange("$$")
                            }
                          />
                          <Label htmlFor="price-2">$$ (Moderate)</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="price-3"
                            checked={priceFilter.includes("$$$")}
                            onCheckedChange={() =>
                              handlePriceFilterChange("$$$")
                            }
                          />
                          <Label htmlFor="price-3">$$$ (Expensive)</Label>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="font-medium">Dietary</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="vegetarian"
                            checked={dietaryFilter.includes("vegetarian")}
                            onCheckedChange={() =>
                              handleDietaryFilterChange("vegetarian")
                            }
                          />
                          <Label htmlFor="vegetarian">Vegetarian</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="vegan"
                            checked={dietaryFilter.includes("vegan")}
                            onCheckedChange={() =>
                              handleDietaryFilterChange("vegan")
                            }
                          />
                          <Label htmlFor="vegan">Vegan</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="gluten-free"
                            checked={dietaryFilter.includes("gluten-free")}
                            onCheckedChange={() =>
                              handleDietaryFilterChange("gluten-free")
                            }
                          />
                          <Label htmlFor="gluten-free">Gluten-Free</Label>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={clearFilters}>
                        Clear All
                      </Button>
                      <Button>Apply Filters</Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </form>
          </div>
        </div>
      </section>

      <section className="w-full py-6">
        <div className="container px-4 md:px-6">
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <CategoryPill
                key={category.value}
                name={category.name}
                icon={category.icon}
                active={activeCategory === category.value}
                onClick={() => setActiveCategory(category.value)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-6">
        <div className="container px-4 md:px-6">
          <Tabs
            defaultValue="delivery"
            className="w-full"
            onValueChange={(value) => setDeliveryType(value)}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">
                {displayedRestaurants.length}{" "}
                {displayedRestaurants.length === 1
                  ? "Restaurant"
                  : "Restaurants"}{" "}
                Available
              </h2>
              <TabsList>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
                <TabsTrigger value="pickup">Pickup</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="delivery" className="mt-6">
              {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <RestaurantCardSkeleton key={i} />
                    ))}
                </div>
              ) : displayedRestaurants.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {displayedRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-center text-muted-foreground">
                    No restaurants found matching your criteria
                  </p>
                  <Button className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="pickup" className="mt-6">
              {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <RestaurantCardSkeleton key={i} />
                    ))}
                </div>
              ) : displayedRestaurants.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {displayedRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-center text-muted-foreground">
                    No pickup restaurants available matching your criteria
                  </p>
                  <Button className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
