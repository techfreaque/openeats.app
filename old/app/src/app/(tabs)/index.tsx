import { useRouter } from "expo-router";
import { Clock, Star } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddressSelector from "../../components/AddressSelector";
import DesktopHeader from "../../components/DesktopHeader";
import { useCart } from "../../lib/hooks/useCart";

// Mock data for featured restaurants
const featuredRestaurants = [
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
];

// Mock data for food categories
const categories = [
  {
    id: "1",
    name: "Pizza",
    icon: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60",
  },
  {
    id: "2",
    name: "Burgers",
    icon: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60",
  },
  {
    id: "3",
    name: "Sushi",
    icon: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60",
  },
  {
    id: "4",
    name: "Mexican",
    icon: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60",
  },
  {
    id: "5",
    name: "Chinese",
    icon: "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60",
  },
];

// Mock data for popular restaurants
const popularRestaurants = [
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
];

export default function HomeScreen() {
  const [address, setAddress] = useState("123 Main St, Anytown");
  const router = useRouter();
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;
  const isExtraLargeScreen = dimensions.width >= 1200;
  const { cartItems } = useCart();

  const handleRestaurantPress = (id) => {
    router.push(`/restaurant/${id}`);
  };

  const handleCategoryPress = (category) => {
    router.push({
      pathname: "/search",
      params: { category },
    });
  };

  const handleSeeAllPress = (section) => {
    router.push({
      pathname: "/search",
      params: { section },
    });
  };

  const handleAddressChange = (newAddress) => {
    setAddress(newAddress);
  };

  const getCardWidth = () => {
    if (isExtraLargeScreen) {
      return 320;
    }
    if (isLargeScreen) {
      return 280;
    }
    return 240;
  };

  const getGridColumns = () => {
    if (isExtraLargeScreen) {
      return 3;
    }
    if (isLargeScreen) {
      return 2;
    }
    return 1;
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Location Header - Only show on mobile */}
        {!isLargeScreen && (
          <AddressSelector
            onSelectAddress={handleAddressChange}
            currentAddress={address}
          />
        )}

        <View
          style={[
            styles.contentContainer,
            isLargeScreen && styles.largeScreenContentContainer,
          ]}
        >
          {/* Featured Restaurants */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  isLargeScreen && styles.largeScreenSectionTitle,
                ]}
              >
                Featured Restaurants
              </Text>
              <TouchableOpacity
                onPress={() => handleSeeAllPress("Featured Restaurants")}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScrollView}
            >
              {featuredRestaurants.map((restaurant) => (
                <TouchableOpacity
                  key={restaurant.id}
                  style={[styles.restaurantCard, { width: getCardWidth() }]}
                  onPress={() => handleRestaurantPress(restaurant.id)}
                >
                  <Image
                    source={{ uri: restaurant.image }}
                    style={styles.restaurantImage}
                  />
                  <View style={styles.restaurantInfo}>
                    <Text
                      style={[
                        styles.restaurantName,
                        isLargeScreen && styles.largeScreenText,
                      ]}
                    >
                      {restaurant.name}
                    </Text>
                    <Text
                      style={[
                        styles.restaurantCategory,
                        isLargeScreen && styles.largeScreenSubText,
                      ]}
                    >
                      {restaurant.category}
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
                          {restaurant.rating}
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
                          {restaurant.deliveryTime}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Categories */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  isLargeScreen && styles.largeScreenSectionTitle,
                ]}
              >
                Categories
              </Text>
            </View>
            <FlatList
              data={categories}
              horizontal={!isLargeScreen}
              numColumns={isLargeScreen ? 5 : 1}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    isLargeScreen && styles.largeScreenCategoryItem,
                  ]}
                  onPress={() => handleCategoryPress(item.name)}
                >
                  <Image
                    source={{ uri: item.icon }}
                    style={[
                      styles.categoryIcon,
                      isLargeScreen && styles.largeScreenCategoryIcon,
                    ]}
                  />
                  <Text
                    style={[
                      styles.categoryName,
                      isLargeScreen && styles.largeScreenCategoryName,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={isLargeScreen && styles.categoriesGrid}
            />
          </View>

          {/* Popular Restaurants */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  isLargeScreen && styles.largeScreenSectionTitle,
                ]}
              >
                Popular Near You
              </Text>
              <TouchableOpacity
                onPress={() => handleSeeAllPress("Popular Restaurants")}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {isLargeScreen ? (
              <View style={styles.popularGrid}>
                {popularRestaurants.map((restaurant) => (
                  <TouchableOpacity
                    key={restaurant.id}
                    style={[styles.popularRestaurantCard, styles.gridCard]}
                    onPress={() => handleRestaurantPress(restaurant.id)}
                  >
                    <Image
                      source={{ uri: restaurant.image }}
                      style={styles.gridCardImage}
                    />
                    <View style={styles.popularRestaurantInfo}>
                      <Text
                        style={[
                          styles.restaurantName,
                          isLargeScreen && styles.largeScreenText,
                        ]}
                      >
                        {restaurant.name}
                      </Text>
                      <Text
                        style={[
                          styles.restaurantCategory,
                          isLargeScreen && styles.largeScreenSubText,
                        ]}
                      >
                        {restaurant.category}
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
                            {restaurant.rating}
                          </Text>
                        </View>
                        <View style={styles.timeContainer}>
                          <Clock
                            size={isLargeScreen ? 16 : 14}
                            color="#6B7280"
                          />
                          <Text
                            style={[
                              styles.timeText,
                              isLargeScreen && styles.largeScreenSubText,
                            ]}
                          >
                            {restaurant.deliveryTime}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              popularRestaurants.map((restaurant) => (
                <TouchableOpacity
                  key={restaurant.id}
                  style={styles.popularRestaurantCard}
                  onPress={() => handleRestaurantPress(restaurant.id)}
                >
                  <Image
                    source={{ uri: restaurant.image }}
                    style={styles.popularRestaurantImage}
                  />
                  <View style={styles.popularRestaurantInfo}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    <Text style={styles.restaurantCategory}>
                      {restaurant.category}
                    </Text>
                    <View style={styles.restaurantMeta}>
                      <View style={styles.ratingContainer}>
                        <Star size={14} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.ratingText}>
                          {restaurant.rating}
                        </Text>
                      </View>
                      <View style={styles.timeContainer}>
                        <Clock size={14} color="#6B7280" />
                        <Text style={styles.timeText}>
                          {restaurant.deliveryTime}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
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
  },
  largeScreenContentContainer: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  largeScreenSectionTitle: {
    fontSize: 24,
  },
  seeAllText: {
    fontSize: 14,
    color: "#FF5A5F",
    fontWeight: "600",
  },
  horizontalScrollView: {
    marginLeft: -8,
  },
  restaurantCard: {
    width: 240,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  restaurantImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  restaurantInfo: {
    padding: 12,
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
  categoryItem: {
    alignItems: "center",
    marginRight: 24,
    width: 70,
  },
  largeScreenCategoryItem: {
    width: "20%",
    marginRight: 0,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  largeScreenCategoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  categoryName: {
    fontSize: 14,
    color: "#1F2937",
    textAlign: "center",
  },
  largeScreenCategoryName: {
    fontSize: 16,
    marginTop: 8,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  popularRestaurantCard: {
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
  popularRestaurantImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  popularRestaurantInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  popularGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    flexDirection: "column",
    width: "48%",
    marginBottom: 16,
  },
  gridCardImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  largeScreenText: {
    fontSize: 18,
  },
  largeScreenSubText: {
    fontSize: 15,
  },
});
