import { useRouter } from "expo-router";
import {
  Chrome as Home,
  MapPin,
  Search,
  ShoppingBag,
  User,
} from "lucide-react-native";
import { useEffect } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DesktopHeader from "../../components/DesktopHeader";
import { useUserType } from "../context/UserTypeContext";

// Mock data for restaurant dashboard
const restaurantData = {
  name: "Burger Palace",
  image:
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  stats: {
    ordersToday: 24,
    revenue: 856.42,
    averageRating: 4.7,
    activeOrders: 3,
  },
  recentOrders: [
    {
      id: "ord-001",
      customerName: "John Smith",
      items: [
        { name: "Double Cheeseburger", quantity: 1 },
        { name: "Fries", quantity: 1 },
        { name: "Soda", quantity: 1 },
      ],
      total: 15.97,
      status: "preparing",
      time: "10 minutes ago",
    },
    {
      id: "ord-002",
      customerName: "Sarah Johnson",
      items: [
        { name: "Veggie Burger", quantity: 1 },
        { name: "Sweet Potato Fries", quantity: 1 },
      ],
      total: 12.48,
      status: "ready",
      time: "15 minutes ago",
    },
    {
      id: "ord-003",
      customerName: "Mike Davis",
      items: [
        { name: "Bacon Burger", quantity: 2 },
        { name: "Onion Rings", quantity: 1 },
        { name: "Milkshake", quantity: 2 },
      ],
      total: 28.95,
      status: "out for delivery",
      time: "20 minutes ago",
    },
  ],
  popularItems: [
    {
      id: "item-001",
      name: "Double Cheeseburger",
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      orderCount: 156,
      rating: 4.8,
    },
    {
      id: "item-002",
      name: "Bacon Burger",
      image:
        "https://images.unsplash.com/photo-1553979459-d2229ba7433b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      orderCount: 132,
      rating: 4.7,
    },
    {
      id: "item-003",
      name: "Veggie Burger",
      image:
        "https://images.unsplash.com/photo-1520072959219-c595dc870360?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      orderCount: 89,
      rating: 4.5,
    },
  ],
};

export default function RestaurantDashboardScreen() {
  const router = useRouter();
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;
  const { userType } = useUserType();

  // Redirect if not a restaurant user
  useEffect(() => {
    if (userType !== "restaurant") {
      router.replace("/");
    }
  }, [userType, router]);

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "#EF4444"; // Red
      case "preparing":
        return "#F59E0B"; // Amber
      case "ready":
        return "#10B981"; // Green
      case "out for delivery":
        return "#3B82F6"; // Blue
      case "delivered":
        return "#6B7280"; // Gray
      case "cancelled":
        return "#9CA3AF"; // Gray
      default:
        return "#6B7280"; // Gray
    }
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLargeScreen && (
        <DesktopHeader
          currentAddress={restaurantData.name}
          onAddressChange={() => {}}
          cartItemCount={0}
        />
      )}
      <ScrollView>
        <View
          style={[
            styles.contentContainer,
            isLargeScreen && styles.largeScreenContentContainer,
          ]}
        >
          {/* Restaurant Header */}
          <View style={styles.restaurantHeader}>
            <Image
              source={{ uri: restaurantData.image }}
              style={styles.restaurantImage}
            />
            <View style={styles.restaurantInfo}>
              <Text
                style={[
                  styles.restaurantName,
                  isLargeScreen && styles.largeScreenTitle,
                ]}
              >
                {restaurantData.name}
              </Text>
              <Text style={styles.welcomeText}>
                Welcome back! Here's your restaurant overview.
              </Text>
            </View>
          </View>

          {/* Stats Cards */}
          <View
            style={[
              styles.statsContainer,
              isLargeScreen && styles.largeScreenStatsContainer,
            ]}
          >
            <View
              style={[
                styles.statCard,
                isLargeScreen && styles.largeScreenStatCard,
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#FEE2E2" },
                ]}
              >
                <ShoppingBag size={24} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>
                {restaurantData.stats.ordersToday}
              </Text>
              <Text style={styles.statLabel}>Orders Today</Text>
            </View>

            <View
              style={[
                styles.statCard,
                isLargeScreen && styles.largeScreenStatCard,
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#E0F2FE" },
                ]}
              >
                <Home size={24} color="#0EA5E9" />
              </View>
              <Text style={styles.statValue}>
                ${restaurantData.stats.revenue}
              </Text>
              <Text style={styles.statLabel}>Today's Revenue</Text>
            </View>

            <View
              style={[
                styles.statCard,
                isLargeScreen && styles.largeScreenStatCard,
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#FEF3C7" },
                ]}
              >
                <User size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>
                {restaurantData.stats.averageRating}
              </Text>
              <Text style={styles.statLabel}>Average Rating</Text>
            </View>

            <View
              style={[
                styles.statCard,
                isLargeScreen && styles.largeScreenStatCard,
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#DCFCE7" },
                ]}
              >
                <MapPin size={24} color="#10B981" />
              </View>
              <Text style={styles.statValue}>
                {restaurantData.stats.activeOrders}
              </Text>
              <Text style={styles.statLabel}>Active Orders</Text>
            </View>
          </View>

          {/* Active Orders */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  isLargeScreen && styles.largeScreenSectionTitle,
                ]}
              >
                Active Orders
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/restaurant-orders")}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {restaurantData.recentOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderCustomer}>
                      {order.customerName}
                    </Text>
                    <Text style={styles.orderTime}>{order.time}</Text>
                  </View>
                  <View
                    style={[
                      styles.orderStatusBadge,
                      { backgroundColor: `${getStatusColor(order.status)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.orderStatusText,
                        { color: getStatusColor(order.status) },
                      ]}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderItems}>
                  {order.items.map((item, index) => (
                    <Text key={index} style={styles.orderItemText}>
                      {item.quantity}x {item.name}
                    </Text>
                  ))}
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>
                    Total: {formatCurrency(order.total)}
                  </Text>
                  <TouchableOpacity
                    style={styles.orderActionButton}
                    onPress={() =>
                      router.push(`/restaurant-orders?id=${order.id}`)
                    }
                  >
                    <Text style={styles.orderActionButtonText}>Manage</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Popular Items */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  isLargeScreen && styles.largeScreenSectionTitle,
                ]}
              >
                Popular Items
              </Text>
              <TouchableOpacity onPress={() => router.push("/restaurant-menu")}>
                <Text style={styles.seeAllText}>Manage Menu</Text>
              </TouchableOpacity>
            </View>

            <View style={isLargeScreen && styles.popularItemsGrid}>
              {restaurantData.popularItems.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.popularItemCard,
                    isLargeScreen && styles.largeScreenPopularItemCard,
                  ]}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.popularItemImage}
                  />
                  <View style={styles.popularItemInfo}>
                    <Text style={styles.popularItemName}>{item.name}</Text>
                    <View style={styles.popularItemStats}>
                      <View style={styles.popularItemStat}>
                        <ShoppingBag size={16} color="#6B7280" />
                        <Text style={styles.popularItemStatText}>
                          {item.orderCount} orders
                        </Text>
                      </View>
                      <View style={styles.popularItemStat}>
                        <User size={16} color="#F59E0B" />
                        <Text style={styles.popularItemStatText}>
                          {item.rating}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: "#FEE2E2" }]}
              onPress={() => router.push("/restaurant-orders")}
            >
              <ShoppingBag size={24} color="#EF4444" />
              <Text style={[styles.quickActionText, { color: "#EF4444" }]}>
                Manage Orders
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: "#E0F2FE" }]}
              onPress={() => router.push("/restaurant-menu")}
            >
              <Search size={24} color="#0EA5E9" />
              <Text style={[styles.quickActionText, { color: "#0EA5E9" }]}>
                Update Menu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: "#DCFCE7" }]}
              onPress={() => router.push("/profile")}
            >
              <User size={24} color="#10B981" />
              <Text style={[styles.quickActionText, { color: "#10B981" }]}>
                Profile Settings
              </Text>
            </TouchableOpacity>
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
  restaurantHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  restaurantInfo: {
    marginLeft: 16,
    flex: 1,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  largeScreenTitle: {
    fontSize: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: "#6B7280",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  largeScreenStatsContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  largeScreenStatCard: {
    width: "24%",
    marginRight: 16,
    marginBottom: 0,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  sectionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    fontSize: 20,
  },
  seeAllText: {
    fontSize: 14,
    color: "#FF5A5F",
    fontWeight: "600",
  },
  orderCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderCustomer: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 14,
    color: "#6B7280",
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItemText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  orderActionButton: {
    backgroundColor: "#FF5A5F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  orderActionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  popularItemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  popularItemCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  largeScreenPopularItemCard: {
    width: "32%",
    flexDirection: "column",
  },
  popularItemImage: {
    width: 80,
    height: 80,
    resizeMode: "cover",
  },
  popularItemInfo: {
    flex: 1,
    padding: 12,
  },
  popularItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  popularItemStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  popularItemStat: {
    flexDirection: "row",
    alignItems: "center",
  },
  popularItemStatText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
});
