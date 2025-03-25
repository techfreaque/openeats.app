"use client";

import { Clock, Search, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "@/client-package/hooks/use-cart";
import { useLocalSearchParams } from "@/client-package/hooks/use-local-search-params";
import { SearchProvider, useSearch } from "@/client-package/hooks/use-search";
import { useWindowDimensions } from "@/client-package/hooks/use-window-dimensions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/next-portal/client/hooks/use-debounce";

import AddressSelector from "../components/AddressSelector";
import DesktopHeader from "../components/DesktopHeader";

// Filter categories mock data - replace with your actual categories
const filterCategories = [
  { id: "1", name: "All" },
  { id: "2", name: "Fast Food" },
  { id: "3", name: "Healthy" },
  { id: "4", name: "Vegetarian" },
  { id: "5", name: "Dessert" },
];

// Define interface for our restaurant items
interface Restaurant {
  id: string;
  name: string;
  category: string;
  rating: string;
  deliveryTime: string;
  image: string;
}

// Main search wrapper component
export default function SearchScreen() {
  return (
    <SearchProvider>
      <SearchScreenContent />
    </SearchProvider>
  );
}

// Inner component that uses the search context
function SearchScreenContent() {
  const [selectedFilter, setSelectedFilter] = useState("1"); // Default to 'All'
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Pizza",
    "Burger",
    "Sushi",
  ]);
  const [address, setAddress] = useState("123 Main St, Anytown");
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    [],
  );

  const router = useRouter();
  const params = useLocalSearchParams();
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;
  const { cartItems } = useCart();

  const {
    searchTerm,
    setSearchTerm,
    performSearch,
    clearSearch: clearSearchContext,
    results,
    isLoading,
  } = useSearch();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // This effect runs when URL parameters change
  useEffect(() => {
    // Handle category or section from params
    if (params.category) {
      setSearchTerm(params.category.toString());
    } else if (params.section) {
      // Handle section filtering if needed
    } else if (params.query) {
      setSearchTerm(params.query.toString());
    }
  }, [params, setSearchTerm]);

  // Effect for when the debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, performSearch]);

  // Effect to update filtered restaurants when search results or filter changes
  useEffect(() => {
    // This is where you'd transform API results into your restaurant format
    // For now, we'll just mock this transformation
    if (results.length > 0) {
      const transformedResults = results.map((item) => ({
        id: item.id,
        name: item.title,
        category: item.description.split(" ")[0], // Just for demo
        rating: "4.5", // Mocked rating
        deliveryTime: "30-45 min", // Mocked delivery time
        image: item.imageUrl || "https://via.placeholder.com/300x200", // Default image if none provided
      }));

      setFilteredRestaurants(transformedResults);
    } else {
      // Mock data when no results
      setFilteredRestaurants([]);
    }
  }, [results, selectedFilter]);

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    if (query && !recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    clearSearchContext();
  };

  const removeRecentSearch = (search: string) => {
    setRecentSearches(recentSearches.filter((item) => item !== search));
  };

  const handleRestaurantPress = (id: string) => {
    router.push(`/restaurant/${id}`);
  };

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
  };

  const handleFilterClick = (filterId: string) => {
    setSelectedFilter(filterId);
    // In a real app, you might want to filter results based on this
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header for large screens */}
      {isLargeScreen && (
        <DesktopHeader
          currentAddress={address}
          onAddressChange={handleAddressChange}
          cartItemCount={cartItems?.length || 0}
        />
      )}

      {/* Location Header - Only show on mobile */}
      {!isLargeScreen && (
        <AddressSelector
          onSelectAddress={handleAddressChange}
          currentAddress={address}
          compact={true}
        />
      )}

      <div
        className={`p-4 ${isLargeScreen ? "max-w-7xl mx-auto w-full px-6 pt-6" : ""}`}
      >
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Search for restaurants or cuisines"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10 py-2"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Filter Categories */}
        <div className="mb-4 overflow-x-auto">
          <Tabs
            value={selectedFilter}
            onValueChange={handleFilterClick}
            className="w-full"
          >
            <TabsList className="inline-flex w-auto">
              {filterCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="px-4 py-2"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Recent Searches */}
        {!searchTerm && recentSearches.length > 0 && (
          <div className="mb-4 space-y-1">
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              Recent Searches
            </h3>
            {recentSearches.map((search, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-gray-200"
              >
                <button
                  className="flex items-center"
                  onClick={() => setSearchTerm(search)}
                >
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">{search}</span>
                </button>
                <button onClick={() => removeRecentSearch(search)}>
                  <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search Results */}
        {searchTerm ? (
          <div className="space-y-4">
            {isLoading ? (
              // Loading state
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-40 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRestaurants.map((restaurant) => (
                  <Card
                    key={restaurant.id}
                    className="overflow-hidden cursor-pointer transition-shadow hover:shadow-lg"
                    onClick={() => handleRestaurantPress(restaurant.id)}
                  >
                    <div className="aspect-video relative">
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-1">
                        <h3 className="font-bold text-lg text-gray-800">
                          {restaurant.name}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {restaurant.category}
                        </p>
                      </div>
                      <div className="flex items-center mt-2">
                        <div className="flex items-center mr-4">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm font-medium">
                            {restaurant.rating}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="ml-1 text-sm text-gray-500">
                            {restaurant.deliveryTime}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center p-8">
                <div className="flex flex-col items-center justify-center p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No restaurants found
                  </h3>
                  <p className="text-sm text-gray-500">
                    Try a different search term
                  </p>
                </div>
              </Card>
            )}
          </div>
        ) : (
          // Popular cuisines section
          <div>
            <h2
              className={`font-semibold text-gray-800 mb-4 ${isLargeScreen ? "text-2xl" : "text-lg"}`}
            >
              Popular Cuisines
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "Pizza",
                "Burgers",
                "Sushi",
                "Mexican",
                "Chinese",
                "Indian",
              ].map((cuisine, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSearchTerm(cuisine)}
                >
                  <CardContent className="flex items-center justify-center p-6">
                    <span
                      className={`font-medium text-gray-800 ${isLargeScreen ? "text-lg" : "text-base"}`}
                    >
                      {cuisine}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
