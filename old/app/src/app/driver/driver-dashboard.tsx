import { useRouter } from "expo-router";
import {
  Clock,
  DollarSign,
  MapPin,
  Navigation,
  Star,
  TrendingUp,
  Truck,
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
import { useAppModeType } from "../../lib/context/UserTypeContext";

// Mock data for driver dashboard
const driverData = {
  name: "Sam Driver",
  image:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  stats: {
    deliveriesToday: 8,
    earnings: 124.5,
    averageRating: 4.9,
    activeDeliveries: 1,
  },
  activeDelivery: {
    id: "del-001",
    restaurant: {
      name: "Burger Palace",
      address: "123 Burger St, Foodville",
      image:
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    customer: {
      name: "John Smith",
      address: "456 Oak St, Anytown",
      phone: "(555) 123-4567",
    },
    items: [
      { name: "Double Cheeseburger", quantity: 1 },
      { name: "Fries", quantity: 1 },
      { name: "Soda", quantity: 1 },
    ],
    total: 15.97,
    status: "picked up",
    estimatedDelivery: "10 minutes",
    distance: "2.3 miles",
  },
  recentDeliveries: [
    {
      id: "del-002",
      restaurant: "Pizza Heaven",
      customer: "Sarah Johnson",
      total: 24.99,
      time: "1 hour ago",
      tip: 5.0,
    },
    {
      id: "del-003",
      restaurant: "Sushi Express",
      customer: "Mike Davis",
      total: 32.5,
      time: "2 hours ago",
      tip: 7.5,
    },
    {
      id: "del-004",
      restaurant: "Taco Fiesta",
      customer: "Emily Wilson",
      total: 18.75,
      time: "3 hours ago",
      tip: 4.0,
    },
  ],
};

export default function DriverDashboardScreen() {
  const router = useRouter();
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;
  const { appMode: userType } = useAppModeType();

  // Redirect if not a driver user
  useEffect(() => {
    if (userType !== "driver") {
      router.replace("/");
    }
  }, [userType, router]);

  const getStatusColor = (status) => {
    switch (status) {
      case "assigned":
        return "#F59E0B"; // Amber
      case "picked up":
        return "#3B82F6"; // Blue
      case "delivered":
        return "#10B981"; // Green
      default:
        return "#6B7280"; // Gray
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLargeScreen && (
        <DesktopHeader
          currentAddress="Driver Dashboard"
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
          {/* Driver Header */}
          <View style={styles.driverHeader}>
            <Image
              source={{ uri: driverData.image }}
              style={styles.driverImage}
            />
            <View style={styles.driverInfo}>
              <Text
                style={[
                  styles.driverName,
                  isLargeScreen && styles.largeScreenTitle,
                ]}
              >
                {driverData.name}
              </Text>
              <Text style={styles.welcomeText}>
                Welcome back! Here's your delivery overview.
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
                <Truck size={24} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>
                {driverData.stats.deliveriesToday}
              </Text>
              <Text style={styles.statLabel}>Deliveries Today</Text>
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
                <DollarSign size={24} color="#0EA5E9" />
              </View>
              <Text style={styles.statValue}>${driverData.stats.earnings}</Text>
              <Text style={styles.statLabel}>Today's Earnings</Text>
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
                <Star size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>
                {driverData.stats.averageRating}
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
                <Clock size={24} color="#10B981" />
              </View>
              <Text style={styles.statValue}>
                {driverData.stats.activeDeliveries}
              </Text>
              <Text style={styles.statLabel}>Active Deliveries</Text>
            </View>
          </View>

          {/* Active Delivery */}
          {driverData.activeDelivery && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text
                  style={[
                    styles.sectionTitle,
                    isLargeScreen && styles.largeScreenSectionTitle,
                  ]}
                >
                  Active Delivery
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: `${getStatusColor(driverData.activeDelivery.status)}20`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: getStatusColor(driverData.activeDelivery.status),
                      },
                    ]}
                  >
                    {driverData.activeDelivery.status.charAt(0).toUpperCase() +
                      driverData.activeDelivery.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.activeDeliveryCard}>
                <View style={styles.deliveryRestaurant}>
                  <Image
                    source={{ uri: driverData.activeDelivery.restaurant.image }}
                    style={styles.restaurantImage}
                  />
                  <View style={styles.restaurantInfo}>
                    <Text style={styles.restaurantName}>
                      {driverData.activeDelivery.restaurant.name}
                    </Text>
                    <View style={styles.addressContainer}>
                      <MapPin size={16} color="#6B7280" />
                      <Text style={styles.addressText}>
                        {driverData.activeDelivery.restaurant.address}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.deliveryDetails}>
                  <View style={styles.deliveryDetail}>
                    <Text style={styles.deliveryDetailLabel}>Customer:</Text>
                    <Text style={styles.deliveryDetailValue}>
                      {driverData.activeDelivery.customer.name}
                    </Text>
                  </View>
                  <View style={styles.deliveryDetail}>
                    <Text style={styles.deliveryDetailLabel}>
                      Delivery Address:
                    </Text>
                    <Text style={styles.deliveryDetailValue}>
                      {driverData.activeDelivery.customer.address}
                    </Text>
                  </View>
                  <View style={styles.deliveryDetail}>
                    <Text style={styles.deliveryDetailLabel}>Distance:</Text>
                    <Text style={styles.deliveryDetailValue}>
                      {driverData.activeDelivery.distance}
                    </Text>
                  </View>
                  <View style={styles.deliveryDetail}>
                    <Text style={styles.deliveryDetailLabel}>
                      Estimated Time:
                    </Text>
                    <Text style={styles.deliveryDetailValue}>
                      {driverData.activeDelivery.estimatedDelivery}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderSummary}>
                  <Text style={styles.orderSummaryTitle}>Order Summary</Text>
                  {driverData.activeDelivery.items.map((item, index) => (
                    <Text key={index} style={styles.orderItem}>
                      {item.quantity}x {item.name}
                    </Text>
                  ))}
                  <View style={styles.orderTotal}>
                    <Text style={styles.orderTotalLabel}>Total:</Text>
                    <Text style={styles.orderTotalValue}>
                      {formatCurrency(driverData.activeDelivery.total)}
                    </Text>
                  </View>
                </View>

                <View style={styles.deliveryActions}>
                  <TouchableOpacity
                    style={[
                      styles.deliveryActionButton,
                      styles.navigationButton,
                    ]}
                    onPress={() => router.push("/driver-deliveries")}
                  >
                    <Navigation size={20} color="#FFFFFF" />
                    <Text style={styles.navigationButtonText}>Navigate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deliveryActionButton, styles.detailsButton]}
                    onPress={() => router.push("/driver-deliveries")}
                  >
                    <Text style={styles.detailsButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Recent Deliveries */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  isLargeScreen && styles.largeScreenSectionTitle,
                ]}
              >
                Recent Deliveries
              </Text>
              <TouchableOpacity onPress={() => router.push("/driver-history")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {driverData.recentDeliveries.map((delivery) => (
              <View key={delivery.id} style={styles.recentDeliveryCard}>
                <View style={styles.recentDeliveryHeader}>
                  <Text style={styles.recentDeliveryRestaurant}>
                    {delivery.restaurant}
                  </Text>
                  <Text style={styles.recentDeliveryTime}>{delivery.time}</Text>
                </View>
                <View style={styles.recentDeliveryDetails}>
                  <Text style={styles.recentDeliveryCustomer}>
                    Customer: {delivery.customer}
                  </Text>
                  <View style={styles.recentDeliveryAmounts}>
                    <Text style={styles.recentDeliveryTotal}>
                      Total: {formatCurrency(delivery.total)}
                    </Text>
                    <Text style={styles.recentDeliveryTip}>
                      Tip: {formatCurrency(delivery.tip)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: "#FEE2E2" }]}
              onPress={() => router.push("/driver-deliveries")}
            >
              <Truck size={24} color="#EF4444" />
              <Text style={[styles.quickActionText, { color: "#EF4444" }]}>
                Active Deliveries
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: "#E0F2FE" }]}
              onPress={() => router.push("/driver-history")}
            >
              <TrendingUp size={24} color="#0EA5E9" />
              <Text style={[styles.quickActionText, { color: "#0EA5E9" }]}>
                Delivery History
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: "#DCFCE7" }]}
              onPress={() => router.push("/profile")}
            >
              <MapPin size={24} color="#10B981" />
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
  driverHeader: {
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
  driverImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  driverInfo: {
    marginLeft: 16,
    flex: 1,
  },
  driverName: {
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  activeDeliveryCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 16,
  },
  deliveryRestaurant: {
    flexDirection: "row",
    marginBottom: 16,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  restaurantInfo: {
    marginLeft: 12,
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    flex: 1,
  },
  deliveryDetails: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  deliveryDetail: {
    flexDirection: "row",
    marginBottom: 8,
  },
  deliveryDetailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    width: 120,
  },
  deliveryDetailValue: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
  },
  orderSummary: {
    marginBottom: 16,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  orderItem: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
  },
  orderTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
    marginTop: 8,
  },
  orderTotalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  orderTotalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  deliveryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deliveryActionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  navigationButton: {
    backgroundColor: "#3B82F6",
    marginRight: 8,
    flexDirection: "row",
  },
  navigationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  detailsButton: {
    backgroundColor: "#F3F4F6",
    marginLeft: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  recentDeliveryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  recentDeliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  recentDeliveryRestaurant: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  recentDeliveryTime: {
    fontSize: 14,
    color: "#6B7280",
  },
  recentDeliveryDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentDeliveryCustomer: {
    fontSize: 14,
    color: "#4B5563",
  },
  recentDeliveryAmounts: {
    alignItems: "flex-end",
  },
  recentDeliveryTotal: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 2,
  },
  recentDeliveryTip: {
    fontSize: 14,
    fontWeight: "500",
    color: "#10B981",
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
