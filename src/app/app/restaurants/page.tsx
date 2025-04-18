"use client";

import { Clock, Filter, Search, Star } from "lucide-react";
import { errorLogger } from "next-vibe/shared/utils/logger";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Form,
  FormControl,
  FormField,
  FormItem,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from "next-vibe-ui/ui";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRestaurants } from "@/app/api/v1/restaurants/hooks";

import { CategoryPill } from "../components/category-pill";
import {
  RestaurantCard,
  RestaurantCardSkeleton,
} from "../components/restaurant-card";

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  "all": "🍽️",
  "fast food": "🍔",
  "pizza": "🍕",
  "sushi": "🍣",
  "chinese": "🥡",
  "mexican": "🌮",
  "italian": "🍝",
  "dessert": "🍰",
  "breakfast": "🥞",
  "healthy": "🥗",
  // Fallback for unknown categories
  "default": "🍴",
};

export default function RestaurantsPage(): React.JSX.Element {
  const { form, data, isLoading, error, submitForm } = useRestaurants();
  const isError = !!error;
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationSet, setLocationSet] = useState(false);
  const { toast } = useToast();

  // Extract restaurants from the API response
  const restaurants = data?.restaurants || [];

  // Dynamically extract categories from restaurant data
  const categories = useMemo(() => {
    // Start with "All" category
    const allCategory = { name: "All", icon: "🍽️", value: "all" };

    // If we don't have data yet, return just the "All" category
    if (!restaurants || restaurants.length === 0) {
      return [allCategory];
    }

    const uniqueCategories: {
      id: {
        name: string;
        image: string;
        id: string;
      };
    } = {};
    restaurants.forEach((restaurant) => {
      uniqueCategories[restaurant.mainCategory.id] = restaurant.mainCategory;
    });

    // Map to category objects with icons
    const categoryList = Object.values(uniqueCategories).map((category) => ({
      name: category.name.charAt(0).toUpperCase() + category.name.slice(1),
      icon:
        CATEGORY_ICONS[category.name.toLowerCase()] ?? CATEGORY_ICONS.default,
      value: category.id,
    }));

    // Sort alphabetically and add All at the beginning
    return [
      allCategory,
      ...categoryList.sort((a, b) => a.name.localeCompare(b.name)),
    ];
  }, [restaurants]);

  // Check if we have required location data
  useEffect(() => {
    const hasCountryCode = form.getValues("countryCode");
    const hasZip = form.getValues("zip");

    if (hasCountryCode && hasZip) {
      setLocationSet(true);
    }
  }, [form]);

  // Track the last time we submitted to prevent excessive submissions
  const lastSubmitTimeRef = useRef<number>(0);
  const minSubmitInterval = 2000; // Minimum 2 seconds between submissions

  // Flag to track initialization
  const hasInitialized = useRef(false);

  // Initialize form with default values on mount
  useEffect(() => {
    // Only run this effect once
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    // Set other defaults but don't overwrite country/zip
    if (!form.getValues("radius")) {
      form.setValue("radius", 10);
    }
    if (!form.getValues("deliveryType")) {
      form.setValue("deliveryType", "delivery");
    }

    // Only auto-submit if location is set and we haven't submitted recently
    if (locationSet) {
      const now = Date.now();
      lastSubmitTimeRef.current = now;
      submitForm(undefined, { urlParamVariables: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once

  // Function to set location data in the form
  const setLocation = useCallback(
    (countryCode: string, zip: string) => {
      try {
        form.setValue("countryCode", countryCode);
        form.setValue("zip", zip);
        setLocationSet(true);
      } catch (error) {
        errorLogger("Error setting location:", error);
        toast({
          title: "Error",
          description: "Failed to set location. Please try again.",
          variant: "destructive",
        });
      }
    },
    [form, toast],
  );

  // Handler functions - these will automatically trigger the query because autoSubmit is enabled
  const handleCategoryClick = (category: string): void => {
    form.setValue("category", category === "all" ? undefined : category);
    submitForm(undefined, { urlParamVariables: undefined });
  };

  const handleDeliveryTypeChange = (type: string): void => {
    form.setValue("deliveryType", type);
    submitForm(undefined, { urlParamVariables: undefined });
  };

  const handleSearch = useCallback(
    (e: React.FormEvent): void => {
      e.preventDefault();
      try {
        submitForm(e, { urlParamVariables: undefined });
      } catch (error) {
        errorLogger("Error submitting search:", error);
        toast({
          title: "Error",
          description: "Failed to search restaurants. Please try again.",
          variant: "destructive",
        });
      }
    },
    [submitForm, toast],
  );

  const handlePriceFilterChange = (value: string): void => {
    const currentValues = form.getValues("priceRange") || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    form.setValue("priceRange", newValues.length ? newValues : undefined);
    submitForm(undefined, { urlParamVariables: undefined });
  };

  const handleDietaryFilterChange = (value: string): void => {
    const currentValues = form.getValues("dietary") || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    form.setValue("dietary", newValues.length ? newValues : undefined);
    submitForm(undefined, { urlParamVariables: undefined });
  };

  const handleSortChange = (value: string): void => {
    form.setValue("sortBy", value);
    submitForm(undefined, { urlParamVariables: undefined });
  };

  const handleCurrentlyOpenChange = (checked: boolean): void => {
    form.setValue("currentlyOpen", checked);
    submitForm(undefined, { urlParamVariables: undefined });
  };

  const handleRatingChange = (value: string): void => {
    form.setValue("rating", value ? Number(value) : undefined);
    submitForm(undefined, { urlParamVariables: undefined });
  };

  const clearFilters = useCallback((): void => {
    try {
      // Keep location information when clearing filters
      const countryCode = form.getValues("countryCode");
      const zip = form.getValues("zip");

      form.reset();

      form.setValue("countryCode", countryCode);
      form.setValue("zip", zip);
      form.setValue("radius", 10);
      form.setValue("deliveryType", "delivery");
      form.setValue("sortBy", "relevance");

      submitForm(undefined, { urlParamVariables: undefined });
      setFilterOpen(false);

      toast({
        title: "Filters cleared",
        description: "All filters have been reset to default values.",
      });
    } catch (error) {
      errorLogger("Error clearing filters:", error);
      toast({
        title: "Error",
        description: "Failed to clear filters. Please try again.",
        variant: "destructive",
      });
    }
  }, [form, submitForm, toast]);

  // Get current values from form
  const activeCategory = form.getValues("category") || "all";
  const deliveryType = form.getValues("deliveryType") || "delivery";
  const priceFilter = form.getValues("priceRange") || [];
  const dietaryFilter = form.getValues("dietary") || [];
  const sortOption = form.getValues("sortBy") || "relevance";
  const currentlyOpen = form.getValues("currentlyOpen") || false;
  const ratingFilter = form.getValues("rating") || 0;

  // Calculate active filters count for the badge
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (priceFilter.length > 0) {
      count++;
    }
    if (dietaryFilter.length > 0) {
      count++;
    }
    if (currentlyOpen) {
      count++;
    }
    if (ratingFilter > 0) {
      count++;
    }
    return count;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero section with search */}
      <section className="w-full py-8 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Discover Restaurants Near You
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Find the best food delivery and pickup options in your area
            </p>

            <Form {...form}>
              <form onSubmit={handleSearch} className="mt-6">
                <div className="flex items-center max-w-md mx-auto">
                  <div className="relative flex-1">
                    <FormField
                      control={form.control}
                      name="search"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                className="pl-10 py-6 pr-20 rounded-full"
                                placeholder="Search restaurants..."
                                {...field}
                                value={field.value || ""}
                              />
                              <Button
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full px-4"
                                type="submit"
                              >
                                Search
                              </Button>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>

      {/* Category and filter section */}
      <section className="border-b sticky top-16 bg-white z-10 shadow-sm">
        <div className="container px-4 md:px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-wrap md:flex-nowrap">
              {categories.map((category) => (
                <CategoryPill
                  key={category.value}
                  name={category.name}
                  icon={category.icon}
                  active={activeCategory === category.value}
                  onClick={() => handleCategoryClick(category.value)}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {getActiveFilterCount() > 0 && (
                      <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto" side="right">
                  <SheetHeader>
                    <SheetTitle>Refine Results</SheetTitle>
                    <SheetDescription>
                      Customize your restaurant search with these filters
                    </SheetDescription>
                  </SheetHeader>

                  <div className="py-6 space-y-6">
                    {/* Sort order */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm">Sort By</h3>
                      <Select
                        defaultValue={sortOption}
                        onValueChange={handleSortChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sort order" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="rating">
                            Rating (High to Low)
                          </SelectItem>
                          <SelectItem value="delivery-time">
                            Delivery Time
                          </SelectItem>
                          <SelectItem value="price-low">
                            Price (Low to High)
                          </SelectItem>
                          <SelectItem value="price-high">
                            Price (High to Low)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Currently open toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="open-now">Open Now</Label>
                        <p className="text-sm text-muted-foreground">
                          Only show restaurants that are currently open
                        </p>
                      </div>
                      <Switch
                        id="open-now"
                        checked={currentlyOpen}
                        onCheckedChange={handleCurrentlyOpenChange}
                      />
                    </div>

                    <Separator />

                    {/* Rating filter */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm">Minimum Rating</h3>
                      <div className="flex gap-2">
                        {[0, 3, 3.5, 4, 4.5].map((value) => (
                          <Button
                            key={value}
                            variant={
                              ratingFilter === value ? "default" : "outline"
                            }
                            className="flex-1 px-2"
                            onClick={() => handleRatingChange(value.toString())}
                          >
                            {value > 0 ? (
                              <div className="flex items-center">
                                {value}{" "}
                                <Star className="h-3 w-3 ml-1 fill-current" />
                              </div>
                            ) : (
                              "Any"
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Price range */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm">Price Range</h3>
                      <div className="flex gap-2">
                        <Button
                          variant={
                            priceFilter.includes("$") ? "default" : "outline"
                          }
                          className="flex-1"
                          onClick={() => handlePriceFilterChange("$")}
                        >
                          $
                        </Button>
                        <Button
                          variant={
                            priceFilter.includes("$$") ? "default" : "outline"
                          }
                          className="flex-1"
                          onClick={() => handlePriceFilterChange("$$")}
                        >
                          $$
                        </Button>
                        <Button
                          variant={
                            priceFilter.includes("$$$") ? "default" : "outline"
                          }
                          className="flex-1"
                          onClick={() => handlePriceFilterChange("$$$")}
                        >
                          $$$
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Dietary options */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm">
                        Dietary Preferences
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Card
                          className={`border-2 cursor-pointer ${dietaryFilter.includes("vegetarian") ? "border-primary" : "border-muted"}`}
                          onClick={() =>
                            handleDietaryFilterChange("vegetarian")
                          }
                        >
                          <CardContent className="p-3 text-center">
                            <div className="text-lg mb-1">🥗</div>
                            <div className="text-sm font-medium">
                              Vegetarian
                            </div>
                          </CardContent>
                        </Card>
                        <Card
                          className={`border-2 cursor-pointer ${dietaryFilter.includes("vegan") ? "border-primary" : "border-muted"}`}
                          onClick={() => handleDietaryFilterChange("vegan")}
                        >
                          <CardContent className="p-3 text-center">
                            <div className="text-lg mb-1">🌱</div>
                            <div className="text-sm font-medium">Vegan</div>
                          </CardContent>
                        </Card>
                        <Card
                          className={`border-2 cursor-pointer ${dietaryFilter.includes("gluten-free") ? "border-primary" : "border-muted"}`}
                          onClick={() =>
                            handleDietaryFilterChange("gluten-free")
                          }
                        >
                          <CardContent className="p-3 text-center">
                            <div className="text-lg mb-1">🌾</div>
                            <div className="text-sm font-medium">
                              Gluten-Free
                            </div>
                          </CardContent>
                        </Card>
                        <Card
                          className={`border-2 cursor-pointer ${dietaryFilter.includes("organic") ? "border-primary" : "border-muted"}`}
                          onClick={() => handleDietaryFilterChange("organic")}
                        >
                          <CardContent className="p-3 text-center">
                            <div className="text-lg mb-1">🍃</div>
                            <div className="text-sm font-medium">Organic</div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>

                  <SheetFooter className="flex-row justify-between">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All
                    </Button>
                    <Button onClick={() => setFilterOpen(false)}>
                      Apply Filters
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <Select
                defaultValue={sortOption}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="rating">Rating (High to Low)</SelectItem>
                  <SelectItem value="delivery-time">Delivery Time</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">
                    Price (High to Low)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters display */}
          {(activeCategory !== "all" ||
            priceFilter.length > 0 ||
            dietaryFilter.length > 0 ||
            currentlyOpen ||
            ratingFilter > 0) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activeCategory !== "all" && (
                <Badge variant="outline" className="px-3 py-1">
                  Category:{" "}
                  {categories.find((c) => c.value === activeCategory)?.name}
                  <button
                    className="ml-1"
                    onClick={() => handleCategoryClick("all")}
                  >
                    ×
                  </button>
                </Badge>
              )}
              {priceFilter.map((price) => (
                <Badge key={price} variant="outline" className="px-3 py-1">
                  Price: {price}
                  <button
                    className="ml-1"
                    onClick={() => handlePriceFilterChange(price)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {dietaryFilter.map((diet) => (
                <Badge key={diet} variant="outline" className="px-3 py-1">
                  {diet.charAt(0).toUpperCase() + diet.slice(1)}
                  <button
                    className="ml-1"
                    onClick={() => handleDietaryFilterChange(diet)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {currentlyOpen && (
                <Badge variant="outline" className="px-3 py-1">
                  Open Now
                  <button
                    className="ml-1"
                    onClick={() => handleCurrentlyOpenChange(false)}
                  >
                    ×
                  </button>
                </Badge>
              )}
              {ratingFilter > 0 && (
                <Badge variant="outline" className="px-3 py-1">
                  {ratingFilter}+ Stars
                  <button
                    className="ml-1"
                    onClick={() => handleRatingChange("0")}
                  >
                    ×
                  </button>
                </Badge>
              )}
              {(activeCategory !== "all" ||
                priceFilter.length > 0 ||
                dietaryFilter.length > 0 ||
                currentlyOpen ||
                ratingFilter > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7"
                >
                  Clear All
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Results section */}
      <section className="flex-grow py-8 bg-gray-50">
        <div className="container px-4 md:px-6">
          <Tabs
            defaultValue={deliveryType}
            className="w-full"
            onValueChange={handleDeliveryTypeChange}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {restaurants.length} Results
              </h2>
              <TabsList className="grid w-fit grid-cols-2">
                <TabsTrigger
                  value="delivery"
                  className="flex gap-1.5 items-center"
                >
                  <Clock className="h-4 w-4" /> Delivery
                </TabsTrigger>
                <TabsTrigger
                  value="pickup"
                  className="flex gap-1.5 items-center"
                >
                  <Clock className="h-4 w-4" /> Pickup
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="delivery" className="mt-0">
              {isLoading ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <RestaurantCardSkeleton key={i} />
                    ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold mb-2 text-destructive">
                    Error Loading Restaurants
                  </h3>
                  <p className="text-center text-muted-foreground max-w-md mb-6">
                    We encountered a problem while loading restaurants. Please
                    try again or adjust your search criteria.
                  </p>
                  <Button
                    onClick={() =>
                      submitForm(undefined, { urlParamVariables: undefined })
                    }
                  >
                    Try Again
                  </Button>
                </div>
              ) : restaurants.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {restaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-xl font-bold mb-2">
                    No Restaurants Found
                  </h3>
                  <p className="text-center text-muted-foreground max-w-md mb-6">
                    We couldn't find any restaurants matching your current
                    filters. Try adjusting your search criteria or explore other
                    options.
                  </p>
                  <Button onClick={clearFilters}>Clear All Filters</Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="pickup" className="mt-0">
              {isLoading ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <RestaurantCardSkeleton key={i} />
                    ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold mb-2 text-destructive">
                    Error Loading Pickup Options
                  </h3>
                  <p className="text-center text-muted-foreground max-w-md mb-6">
                    We encountered a problem while loading pickup options.
                    Please try again or adjust your search criteria.
                  </p>
                  <Button
                    onClick={() =>
                      submitForm(undefined, { urlParamVariables: undefined })
                    }
                  >
                    Try Again
                  </Button>
                </div>
              ) : restaurants.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {restaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold mb-2">
                    No Pickup Options Available
                  </h3>
                  <p className="text-center text-muted-foreground max-w-md mb-6">
                    We couldn't find any restaurants offering pickup that match
                    your current filters. Try adjusting your search criteria or
                    switch to delivery.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                    <Button
                      onClick={() => handleDeliveryTypeChange("delivery")}
                    >
                      Switch to Delivery
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
