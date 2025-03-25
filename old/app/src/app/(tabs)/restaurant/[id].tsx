import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Clock, Minus, Plus, Star } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddressSelector from "../../../components/AddressSelector";
import DesktopHeader from "../../../components/DesktopHeader";
import { useCart } from "../../../lib/hooks/useCart";
import { useRestaurant } from "../../../lib/hooks/useRestaurant";

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    {},
  );
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const { restaurant, menuItems, isLoading, error } = useRestaurant(
    id as string,
  );
  const { addItem, cartItems } = useCart();
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;
  const isExtraLargeScreen = dimensions.width >= 1200;

  const handleAddItem = (item: any) => {
    setSelectedItems((prev) => {
      const currentQuantity = prev[item.id] || 0;
      return {
        ...prev,
        [item.id]: currentQuantity + 1,
      };
    });
  };

  const handleRemoveItem = (item: any) => {
    setSelectedItems((prev) => {
      const currentQuantity = prev[item.id] || 0;
      if (currentQuantity <= 1) {
        const newItems = { ...prev };
        delete newItems[item.id];
        return newItems;
      }
      return {
        ...prev,
        [item.id]: currentQuantity - 1,
      };
    });
  };

  const getTotalItems = () => {
    return Object.values(selectedItems).reduce(
      (sum, quantity) => sum + quantity,
      0,
    );
  };

  const getTotalPrice = () => {
    if (!menuItems) {
      return 0;
    }

    return menuItems.reduce((sum, item) => {
      const quantity = selectedItems[item.id] || 0;
      return sum + item.price * quantity;
    }, 0);
  };

  const handleAddToCart = async () => {
    if (getTotalItems() === 0) {
      return;
    }

    const cartItems = menuItems
      .filter((item) => selectedItems[item.id])
      .map((item) => ({
        id: item.id,
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: selectedItems[item.id],
        image: item.image,
      }));

    let allSuccess = true;

    for (const item of cartItems) {
      const success = await addItem(item);
      if (!success) {
        allSuccess = false;
      }
    }

    if (allSuccess) {
      Alert.alert(
        "Success",
        `Added ${getTotalItems()} items to cart for ${formatCurrency(getTotalPrice())}`,
        [
          {
            text: "View Cart",
            onPress: () => router.push("/cart"),
          },
          {
            text: "Continue Shopping",
            style: "cancel",
          },
        ],
      );

      // Reset selected items
      setSelectedItems({});
    } else {
      Alert.alert(
        "Error",
        "There was a problem adding items to your cart. Please try again.",
      );
    }
  };

  const handleAddressChange = (address: string) => {
    setDeliveryAddress(address);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {isLargeScreen && (
          <DesktopHeader
            currentAddress={deliveryAddress}
            onAddressChange={handleAddressChange}
            cartItemCount={cartItems?.length || 0}
          />
        )}
        <View style={styles.loadingContainer}>
          <Text>Loading restaurant details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        {isLargeScreen && (
          <DesktopHeader
            currentAddress={deliveryAddress}
            onAddressChange={handleAddressChange}
            cartItemCount={cartItems?.length || 0}
          />
        )}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || "Restaurant not found"}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isLargeScreen && (
        <DesktopHeader
          currentAddress={deliveryAddress}
          onAddressChange={handleAddressChange}
          cartItemCount={cartItems?.length || 0}
        />
      )}
      <ScrollView>
        {/* Header Image */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: restaurant.image }}
            style={styles.headerImage}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.contentContainer,
            isLargeScreen && styles.largeScreenContentContainer,
          ]}
        >
          {/* Restaurant Info */}
          <View style={styles.infoContainer}>
            <Text
              style={[
                styles.restaurantName,
                isLargeScreen && styles.largeScreenTitle,
              ]}
            >
              {restaurant.name}
            </Text>
            <Text
              style={[
                styles.restaurantCategory,
                isLargeScreen && styles.largeScreenSubtitle,
              ]}
            >
              {restaurant.category}
            </Text>

            <View style={styles.restaurantMeta}>
              <View style={styles.ratingContainer}>
                <Star
                  size={isLargeScreen ? 18 : 16}
                  color="#FFD700"
                  fill="#FFD700"
                />
                <Text
                  style={[
                    styles.ratingText,
                    isLargeScreen && styles.largeScreenText,
                  ]}
                >
                  {restaurant.rating}
                </Text>
              </View>
              <View style={styles.timeContainer}>
                <Clock size={isLargeScreen ? 18 : 16} color="#6B7280" />
                <Text
                  style={[
                    styles.timeText,
                    isLargeScreen && styles.largeScreenText,
                  ]}
                >
                  {restaurant.deliveryTime}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.restaurantAddress,
                isLargeScreen && styles.largeScreenText,
              ]}
            >
              {restaurant.address}
            </Text>
            <Text
              style={[
                styles.restaurantDescription,
                isLargeScreen && styles.largeScreenText,
              ]}
            >
              {restaurant.description}
            </Text>
          </View>

          {/* Delivery Address */}
          <View style={styles.deliveryAddressContainer}>
            <AddressSelector
              onSelectAddress={handleAddressChange}
              currentAddress={deliveryAddress}
              showLabel={true}
              compact={true}
            />
          </View>

          {/* Menu */}
          <View style={styles.menuContainer}>
            <Text
              style={[
                styles.menuTitle,
                isLargeScreen && styles.largeScreenSectionTitle,
              ]}
            >
              Menu
            </Text>

            <View style={isLargeScreen && styles.menuGrid}>
              {menuItems.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.menuItem,
                    isLargeScreen && styles.gridMenuItem,
                  ]}
                >
                  <View style={styles.menuItemInfo}>
                    <Text
                      style={[
                        styles.menuItemName,
                        isLargeScreen && styles.largeScreenText,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.menuItemDescription,
                        isLargeScreen && styles.largeScreenSubText,
                      ]}
                    >
                      {item.description}
                    </Text>
                    <Text
                      style={[
                        styles.menuItemPrice,
                        isLargeScreen && styles.largeScreenText,
                      ]}
                    >
                      {formatCurrency(item.price)}
                    </Text>
                  </View>

                  <View style={styles.menuItemRight}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.menuItemImage}
                    />

                    <View style={styles.quantityControls}>
                      {selectedItems[item.id] ? (
                        <>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleRemoveItem(item)}
                          >
                            <Minus size={16} color="#FF5A5F" />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>
                            {selectedItems[item.id]}
                          </Text>
                        </>
                      ) : null}

                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleAddItem(item)}
                      >
                        <Plus size={16} color="#FF5A5F" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Cart Button */}
      {getTotalItems() > 0 && (
        <View
          style={[
            styles.cartButtonContainer,
            isLargeScreen && styles.largeScreenCartButtonContainer,
          ]}
        >
          <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
            <View style={styles.cartButtonLeft}>
              <View style={styles.cartItemCount}>
                <Text style={styles.cartItemCountText}>{getTotalItems()}</Text>
              </View>
              <Text style={styles.cartButtonText}>Add to Cart</Text>
            </View>
            <Text style={styles.cartButtonPrice}>
              {formatCurrency(getTotalPrice())}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    marginBottom: 20,
    textAlign: "center",
  },
  headerContainer: {
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: 200,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  contentContainer: {
    padding: 16,
  },
  largeScreenContentContainer: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 24,
  },
  infoContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  largeScreenTitle: {
    fontSize: 32,
  },
  restaurantCategory: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  largeScreenSubtitle: {
    fontSize: 18,
  },
  restaurantMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
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
  restaurantAddress: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  restaurantDescription: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  deliveryAddressContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginTop: 8,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  largeScreenSectionTitle: {
    fontSize: 24,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuItem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 16,
  },
  gridMenuItem: {
    width: "48%",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 16,
    marginBottom: 16,
  },
  menuItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  menuItemRight: {
    alignItems: "center",
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  cartButtonContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  largeScreenCartButtonContainer: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  cartButton: {
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cartButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartItemCount: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  cartItemCountText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF5A5F",
  },
  cartButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cartButtonPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  largeScreenText: {
    fontSize: 16,
  },
  largeScreenSubText: {
    fontSize: 15,
  },
});
