import { useLocalSearchParams, useRouter } from "expo-router";
import { Clock, Search, Star, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddressSelector from "../../components/AddressSelector";
import DesktopHeader from "../../components/DesktopHeader";
import { useCart } from "../../lib/hooks/useCart";

// Mock data for restaurants
const allRestaurants = [
  {
    id: "1",
    name: "Burger Palace",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    rating: 4.8,
    deliveryTime: "15-25 min",
    category: "American",
  },
  {
    id: "2",
    name: "Pizza Heaven",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    rating: 4.5,
    deliveryTime: "20-30 min",
    category: "Italian",
  },
  {
    id: "3",
    name: "Sushi Express",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    rating: 4.7,
    deliveryTime: "25-35 min",
    category: "Japanese",
  },
  {
    id: "4",
    name: "Taco Fiesta",
    image:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    rating: 4.6,
    deliveryTime: "15-25 min",
    category: "Mexican",
  },
  {
    id: "5",
    name: "Noodle House",
    image:
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    rating: 4.4,
    deliveryTime: "20-30 min",
    category: "Chinese",
  },
  {
    id: "6",
    name: "Salad Bar",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    rating: 4.3,
    deliveryTime: "10-20 min",
    category: "Healthy",
  },
  {
    id: "7",
    name: "Indian Spice",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356c36?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    rating: 4.6,
    deliveryTime: "25-35 min",
    category: "Indian",
  },
  {
    id: "8",
    name: "Mediterranean Delight",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    rating: 4.5,
    deliveryTime: "20-30 min",
    category: "Mediterranean",
  },
];

// Filter categories
const filterCategories = [
  { id: "1", name: "All" },
  { id: "2", name: "Fast Food" },
  { id: "3", name: "Healthy" },
  { id: "4", name: "Italian" },
  { id: "5", name: "Asian" },
  { id: "6", name: "Mexican" },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("1"); // Default to 'All'
  const [recentSearches, setRecentSearches] = useState([
    "Pizza",
    "Burger",
    "Sushi",
  ]);
  const [address, setAddress] = useState("123 Main St, Anytown");
  const router = useRouter();
  const params = useLocalSearchParams();
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;
  const { cartItems } = useCart();

  useEffect(() => {
    // Handle category or section from params
    if (params.category) {
      setSearchQuery(params.category.toString());
    } else if (params.section) {
      // Handle section filtering if needed
    } else if (params.query) {
      setSearchQuery(params.query.toString());
    }
  }, [params]);

  // Filter restaurants based on search query and selected filter
  const filteredRestaurants = allRestaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === "1") {
      return matchesSearch;
    } // All
    if (selectedFilter === "2") {
      return (
        matchesSearch && ["American", "Italian"].includes(restaurant.category)
      );
    } // Fast Food
    if (selectedFilter === "3") {
      return matchesSearch && restaurant.category === "Healthy";
    } // Healthy
    if (selectedFilter === "4") {
      return matchesSearch && restaurant.category === "Italian";
    } // Italian
    if (selectedFilter === "5") {
      return (
        matchesSearch && ["Japanese", "Chinese"].includes(restaurant.category)
      );
    } // Asian
    if (selectedFilter === "6") {
      return matchesSearch && restaurant.category === "Mexican";
    } // Mexican

    return matchesSearch;
  });

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query && !recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const removeRecentSearch = (search) => {
    setRecentSearches(recentSearches.filter((item) => item !== search));
  };

  const handleRestaurantPress = (id) => {
    router.push(`/restaurant/${id}`);
  };

  const handleAddressChange = (newAddress) => {
    setAddress(newAddress);
  };

  return (
    <SafeAreaView style={styles.container}>
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

      <View
        style={[
          styles.contentContainer,
          isLargeScreen && styles.largeScreenContentContainer,
        ]}
      >
        {/* Search Bar - Only show on mobile since desktop has it in the header */}
        {!isLargeScreen && (
          <View style={styles.searchContainer}>
            <Search size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for restaurants or cuisines"
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Filter Categories */}
        <View style={styles.filterContainer}>
          <FlatList
            data={filterCategories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterItem,
                  selectedFilter === item.id && styles.selectedFilterItem,
                ]}
                onPress={() => setSelectedFilter(item.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === item.id && styles.selectedFilterText,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Recent Searches (show only if no search query and there are recent searches) */}
        {!searchQuery && recentSearches.length > 0 && (
          <View style={styles.recentSearchesContainer}>
            <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
            {recentSearches.map((search, index) => (
              <View key={index} style={styles.recentSearchItem}>
                <TouchableOpacity
                  style={styles.recentSearchTextContainer}
                  onPress={() => setSearchQuery(search)}
                >
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.recentSearchText}>{search}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeRecentSearch(search)}>
                  <X size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Search Results */}
        {searchQuery ? (
          <FlatList
            data={filteredRestaurants}
            keyExtractor={(item) => item.id}
            numColumns={isLargeScreen ? 2 : 1}
            columnWrapperStyle={isLargeScreen && styles.gridRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.restaurantItem,
                  isLargeScreen && styles.gridRestaurantItem,
                ]}
                onPress={() => handleRestaurantPress(item.id)}
              >
                <Image
                  source={{ uri: item.image }}
                  style={[
                    styles.restaurantImage,
                    isLargeScreen && styles.gridRestaurantImage,
                  ]}
                />
                <View style={styles.restaurantInfo}>
                  <Text
                    style={[
                      styles.restaurantName,
                      isLargeScreen && styles.largeScreenText,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.restaurantCategory,
                      isLargeScreen && styles.largeScreenSubText,
                    ]}
                  >
                    {item.category}
                  </Text>
                  <View style={styles.restaurantMeta}>
                    <View style={styles.ratingContainer}>
                      <Star
                        size={isLargeScreen ? 16 : 14}
                        color="#FFD700"
                        fill="#FFD700"
                      />
                      <Text
                        style={[
                          styles.ratingText,
                          isLargeScreen && styles.largeScreenSubText,
                        ]}
                      >
                        {item.rating}
                      </Text>
                    </View>
                    <View style={styles.timeContainer}>
                      <Clock size={isLargeScreen ? 16 : 14} color="#6B7280" />
                      <Text
                        style={[
                          styles.timeText,
                          isLargeScreen && styles.largeScreenSubText,
                        ]}
                      >
                        {item.deliveryTime}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyResultContainer}>
                <Text style={styles.emptyResultText}>No restaurants found</Text>
                <Text style={styles.emptyResultSubText}>
                  Try a different search term
                </Text>
              </View>
            }
          />
        ) : (
          // Show popular searches when no search query
          <View style={styles.popularContainer}>
            <Text
              style={[
                styles.popularTitle,
                isLargeScreen && styles.largeScreenSectionTitle,
              ]}
            >
              Popular Cuisines
            </Text>
            <View
              style={[
                styles.popularGrid,
                isLargeScreen && styles.largeScreenPopularGrid,
              ]}
            >
              {[
                "Pizza",
                "Burgers",
                "Sushi",
                "Mexican",
                "Chinese",
                "Indian",
              ].map((cuisine, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.popularItem,
                    isLargeScreen && styles.largeScreenPopularItem,
                  ]}
                  onPress={() => setSearchQuery(cuisine)}
                >
                  <Text
                    style={[
                      styles.popularItemText,
                      isLargeScreen && styles.largeScreenText,
                    ]}
                  >
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  contentContainer: {
    padding: 16,
    flex: 1,
  },
  largeScreenContentContainer: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#1F2937",
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  selectedFilterItem: {
    backgroundColor: "#FF5A5F",
  },
  filterText: {
    fontSize: 14,
    color: "#4B5563",
  },
  selectedFilterText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  recentSearchesContainer: {
    marginBottom: 16,
  },
  recentSearchesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  recentSearchTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  recentSearchText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
  },
  restaurantItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  gridRow: {
    justifyContent: "space-between",
  },
  gridRestaurantItem: {
    width: "48%",
    flexDirection: "column",
  },
  restaurantImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  gridRestaurantImage: {
    width: "100%",
    height: 160,
  },
  restaurantInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  restaurantCategory: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  ratingText: {
    fontSize: 14,
    color: "#1F2937",
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  emptyResultContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyResultText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyResultSubText: {
    fontSize: 14,
    color: "#6B7280",
  },
  popularContainer: {
    flex: 1,
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  popularGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  largeScreenPopularGrid: {
    justifyContent: "flex-start",
  },
  popularItem: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  largeScreenPopularItem: {
    width: "30%",
    marginRight: "3%",
  },
  popularItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    textAlign: "center",
  },
  largeScreenText: {
    fontSize: 18,
  },
  largeScreenSubText: {
    fontSize: 15,
  },
  largeScreenSectionTitle: {
    fontSize: 24,
  },
});
