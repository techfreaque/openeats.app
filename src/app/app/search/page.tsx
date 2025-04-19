"use client";

import { Filter, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  Button,
  Checkbox,
  Input,
  Label,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "next-vibe-ui/ui";
import type React from "react";
import { useEffect, useState } from "react";

import { useRestaurants } from "@/app/api/v1/restaurants/hooks";

import type { FilterOptions, RestaurantType } from "../components/lib/types";
import {
  RestaurantCard,
  RestaurantCardSkeleton,
} from "../components/restaurant-card";

export default function SearchPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const { data: restaurants, isLoading } = useRestaurants();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [dietaryFilter, setDietaryFilter] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<
    "relevance" | "rating" | "delivery-time" | "price-low" | "price-high"
  >("relevance");
  const [filteredResults, setFilteredResults] = useState<RestaurantType[]>([]);

  // Search results
  const [results, setResults] = useState<typeof restaurants>([]);

  useEffect(() => {
    if (initialQuery) {
      const searchResults = searchRestaurants(initialQuery);
      setResults(searchResults);
    }
  }, [initialQuery, searchRestaurants]);

  useEffect(() => {
    // First get search results
    const searchResults = initialQuery ? searchRestaurants(initialQuery) : [];

    // Then apply additional filters
    const filterOptions: FilterOptions = {
      priceRange: priceFilter.length > 0 ? priceFilter : undefined,
      dietary: dietaryFilter.length > 0 ? dietaryFilter : undefined,
      sortBy: sortOption === "relevance" ? undefined : sortOption,
      deliveryType: deliveryType as "delivery" | "pickup" | "all",
    };

    // Start with search results and apply additional filters
    let filtered = [...searchResults];

    // Apply delivery type filter
    if (deliveryType === "pickup") {
      filtered = filtered.filter((r) => r.pickup);
    }

    // Apply price filter
    if (priceFilter.length > 0) {
      // This is a mock implementation since we don't have price range data
      const cheapRestaurants = restaurants.filter((_, i) => i % 3 === 0);
      const mediumRestaurants = restaurants.filter((_, i) => i % 3 === 1);
      const expensiveRestaurants = restaurants.filter((_, i) => i % 3 === 2);

      let priceFilteredRestaurants: RestaurantType[] = [];

      if (priceFilter.includes("$")) {
        priceFilteredRestaurants = [
          ...priceFilteredRestaurants,
          ...cheapRestaurants,
        ];
      }
      if (priceFilter.includes("$$")) {
        priceFilteredRestaurants = [
          ...priceFilteredRestaurants,
          ...mediumRestaurants,
        ];
      }
      if (priceFilter.includes("$$$")) {
        priceFilteredRestaurants = [
          ...priceFilteredRestaurants,
          ...expensiveRestaurants,
        ];
      }

      filtered = filtered.filter((r) =>
        priceFilteredRestaurants.some((pr) => pr.id === r.id),
      );
    }

    // Apply dietary filter
    if (dietaryFilter.length > 0) {
      // This is a mock implementation since we don't have dietary data
      const vegetarianRestaurants = restaurants.filter((_, i) => i % 2 === 0);
      const veganRestaurants = restaurants.filter((_, i) => i % 3 === 0);
      const glutenFreeRestaurants = restaurants.filter((_, i) => i % 4 === 0);

      let dietaryFilteredRestaurants: RestaurantType[] = [];

      if (dietaryFilter.includes("vegetarian")) {
        dietaryFilteredRestaurants = [
          ...dietaryFilteredRestaurants,
          ...vegetarianRestaurants,
        ];
      }
      if (dietaryFilter.includes("vegan")) {
        dietaryFilteredRestaurants = [
          ...dietaryFilteredRestaurants,
          ...veganRestaurants,
        ];
      }
      if (dietaryFilter.includes("gluten-free")) {
        dietaryFilteredRestaurants = [
          ...dietaryFilteredRestaurants,
          ...glutenFreeRestaurants,
        ];
      }

      filtered = filtered.filter((r) =>
        dietaryFilteredRestaurants.some((dr) => dr.id === r.id),
      );
    }

    // Apply sorting
    if (sortOption !== "relevance") {
      if (sortOption === "rating") {
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
      } else if (sortOption === "delivery-time") {
        filtered = [...filtered].sort(
          (a, b) => a.deliveryTime - b.deliveryTime,
        );
      } else if (sortOption === "price-low") {
        filtered = [...filtered].sort((a, b) => a.deliveryFee - b.deliveryFee);
      } else if (sortOption === "price-high") {
        filtered = [...filtered].sort((a, b) => b.deliveryFee - a.deliveryFee);
      }
    }

    setFilteredResults(filtered);
  }, [
    initialQuery,
    searchRestaurants,
    restaurants,
    deliveryType,
    priceFilter,
    dietaryFilter,
    sortOption,
  ]);

  // Filter by delivery type
  // let filteredResults = deliveryType === "pickup" ? results.filter((r) => r.pickup) : results

  // Filter by price (mock implementation)
  // if (priceFilter.length > 0) {
  //   // This is a mock implementation since we don't have price range data
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

  //   filteredResults = filteredResults.filter((r) => priceFilteredRestaurants.some((pr) => pr.id === r.id))
  // }

  // Filter by dietary preferences (mock implementation)
  // if (dietaryFilter.length > 0) {
  //   // This is a mock implementation since we don't have dietary data
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

  //   filteredResults = filteredResults.filter((r) => dietaryFilteredRestaurants.some((dr) => dr.id === r.id))
  // }

  // Sort results
  // if (sortOption === "rating") {
  //   filteredResults = [...filteredResults].sort((a, b) => b.rating - a.rating)
  // } else if (sortOption === "delivery-time") {
  //   filteredResults = [...filteredResults].sort((a, b) => a.deliveryTime - b.deliveryTime)
  // } else if (sortOption === "price-low") {
  //   filteredResults = [...filteredResults].sort((a, b) => a.deliveryFee - b.deliveryFee)
  // } else if (sortOption === "price-high") {
  //   filteredResults = [...filteredResults].sort((a, b) => b.deliveryFee - a.deliveryFee)
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
    const searchResults = searchRestaurants(searchQuery);
    setResults(searchResults);
  };

  const clearFilters = (): void => {
    setSearchQuery(initialQuery);
    setPriceFilter([]);
    setDietaryFilter([]);
    setSortOption("relevance");
  };

  const displayedRestaurants = filteredResults;

  return (
    <div className="flex-1">
      <section className="w-full py-6 md:py-8 lg:py-10 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Search Results
              </h1>
              <p className="text-muted-foreground">
                {displayedRestaurants.length} results for "{initialQuery}"
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
                      Refine your search results
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-6 py-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Sort By</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={
                            sortOption === "relevance" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setSortOption("relevance")}
                        >
                          Relevance
                        </Button>
                        <Button
                          variant={
                            sortOption === "rating" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setSortOption("rating")}
                        >
                          Rating
                        </Button>
                        <Button
                          variant={
                            sortOption === "delivery-time"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setSortOption("delivery-time")}
                        >
                          Delivery Time
                        </Button>
                        <Button
                          variant={
                            sortOption === "price-low" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setSortOption("price-low")}
                        >
                          Price (Low to High)
                        </Button>
                      </div>
                    </div>
                    <Separator />
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
                Found
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
                    No restaurants found matching your search criteria
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
                    No pickup restaurants available matching your search
                    criteria
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
