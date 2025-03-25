import { useRouter } from "expo-router";
import {
  CircleCheck as CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
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

import DesktopHeader from "../../components/DesktopHeader";
import { useUserType } from "../context/UserTypeContext";

// Mock data for active deliveries
const activeDeliveries = [
  {
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
    orderTime: "12:30 PM",
  },
];

// Mock data for available deliveries
const availableDeliveries = [
  {
    id: "del-002",
    restaurant: {
      name: "Pizza Heaven",
      address: "789 Pizza Ave, Foodville",
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    customer: {
      address: "101 Pine St, Anytown",
    },
    total: 24.99,
    distance: "3.1 miles",
    estimatedTime: "15-25 min",
  },
  {
    id: "del-003",
    restaurant: {
      name: "Sushi Express",
      address: "456 Sushi Blvd, Foodville",
      image:
        "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    customer: {
      address: "202 Maple St, Anytown",
    },
    total: 32.5,
    distance: "1.8 miles",
    estimatedTime: "10-20 min",
  },
];

export default function DriverDeliveriesScreen() {
  const router = useRouter();
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;
  const { userType } = useUserType();

  const [activeTab, setActiveTab] = useState("active");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [deliveryDetailsVisible, setDeliveryDetailsVisible] = useState(false);

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

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setDeliveryDetailsVisible(true);
  };

  const handleAcceptDelivery = (delivery) => {
    Alert.alert(
      "Accept Delivery",
      `Are you sure you want to accept this delivery from ${delivery.restaurant.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Accept",
          onPress: () => {
            // In a real app, this would update the delivery status in the database
            Alert.alert(
              "Success",
              "Delivery accepted! Head to the restaurant to pick up the order.",
            );
          },
        },
      ],
    );
  };

  const handleUpdateStatus = (delivery, newStatus) => {
    Alert.alert(
      "Update Status",
      `Are you sure you want to mark this delivery as ${newStatus}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Update",
          onPress: () => {
            // In a real app, this would update the delivery status in the database
            Alert.alert("Success", `Delivery status updated to ${newStatus}!`);
            setDeliveryDetailsVisible(false);
          },
        },
      ],
    );
  };

  const handleCallCustomer = (phone) => {
    Alert.alert("Call Customer", `Would you like to call ${phone}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Call",
        onPress: () => {
          // In a real app, this would initiate a phone call
          Alert.alert("Calling", `Calling ${phone}`);
        },
      },
    ]);
  };

  const handleMessageCustomer = (name) => {
    Alert.alert("Message Customer", `Would you like to message ${name}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Message",
        onPress: () => {
          // In a real app, this would open a messaging interface
          Alert.alert("Messaging", `Opening chat with ${name}`);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLargeScreen && (
        <DesktopHeader
          currentAddress="Active Deliveries"
          onAddressChange={() => {}}
          cartItemCount={0}
        />
      )}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.activeTabText,
            ]}
          >
            Active Deliveries
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "available" && styles.activeTab]}
          onPress={() => setActiveTab("available")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "available" && styles.activeTabText,
            ]}
          >
            Available Deliveries
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View
          style={[
            styles.contentContainer,
            isLargeScreen && styles.largeScreenContentContainer,
          ]}
        >
          {activeTab === "active" ? (
            // Active Deliveries
            activeDeliveries.length > 0 ? (
              activeDeliveries.map((delivery) => (
                <View key={delivery.id} style={styles.deliveryCard}>
                  <View style={styles.deliveryHeader}>
                    <View style={styles.restaurantInfo}>
                      <Image
                        source={{ uri: delivery.restaurant.image }}
                        style={styles.restaurantImage}
                      />
                      <View>
                        <Text style={styles.restaurantName}>
                          {delivery.restaurant.name}
                        </Text>
                        <Text style={styles.orderTime}>
                          Order time: {delivery.orderTime}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: `${getStatusColor(delivery.status)}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(delivery.status) },
                        ]}
                      >
                        {delivery.status.charAt(0).toUpperCase() +
                          delivery.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.deliveryInfo}>
                    <View style={styles.infoItem}>
                      <MapPin size={16} color="#6B7280" />
                      <Text style={styles.infoText}>
                        {delivery.customer.address}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Clock size={16} color="#6B7280" />
                      <Text style={styles.infoText}>
                        ETA: {delivery.estimatedDelivery}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Distance:</Text>
                      <Text style={styles.infoText}>{delivery.distance}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Total:</Text>
                      <Text style={styles.infoText}>
                        {formatCurrency(delivery.total)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.deliveryActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.navigateButton]}
                      onPress={() =>
                        Alert.alert(
                          "Navigation",
                          "Opening navigation to customer's address...",
                        )
                      }
                    >
                      <Navigation size={20} color="#FFFFFF" />
                      <Text style={styles.navigateButtonText}>Navigate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.detailsButton]}
                      onPress={() => handleViewDetails(delivery)}
                    >
                      <Text style={styles.detailsButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Active Deliveries</Text>
                <Text style={styles.emptyText}>
                  You don't have any active deliveries at the moment.
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => setActiveTab("available")}
                >
                  <Text style={styles.emptyButtonText}>
                    Find Available Deliveries
                  </Text>
                </TouchableOpacity>
              </View>
            )
          ) : // Available Deliveries
          availableDeliveries.length > 0 ? (
            availableDeliveries.map((delivery) => (
              <View key={delivery.id} style={styles.availableDeliveryCard}>
                <View style={styles.availableDeliveryHeader}>
                  <Image
                    source={{ uri: delivery.restaurant.image }}
                    style={styles.availableRestaurantImage}
                  />
                  <View style={styles.availableDeliveryInfo}>
                    <Text style={styles.availableRestaurantName}>
                      {delivery.restaurant.name}
                    </Text>
                    <View style={styles.availableDeliveryMeta}>
                      <View style={styles.availableDeliveryMetaItem}>
                        <MapPin size={14} color="#6B7280" />
                        <Text style={styles.availableDeliveryMetaText}>
                          {delivery.distance}
                        </Text>
                      </View>
                      <View style={styles.availableDeliveryMetaItem}>
                        <Clock size={14} color="#6B7280" />
                        <Text style={styles.availableDeliveryMetaText}>
                          {delivery.estimatedTime}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.availableDeliveryTotal}>
                    {formatCurrency(delivery.total)}
                  </Text>
                </View>

                <View style={styles.availableDeliveryDetails}>
                  <View style={styles.availableDeliveryDetail}>
                    <Text style={styles.availableDeliveryDetailLabel}>
                      Pickup:
                    </Text>
                    <Text style={styles.availableDeliveryDetailValue}>
                      {delivery.restaurant.address}
                    </Text>
                  </View>
                  <View style={styles.availableDeliveryDetail}>
                    <Text style={styles.availableDeliveryDetailLabel}>
                      Dropoff:
                    </Text>
                    <Text style={styles.availableDeliveryDetailValue}>
                      {delivery.customer.address}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAcceptDelivery(delivery)}
                >
                  <Text style={styles.acceptButtonText}>Accept Delivery</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Available Deliveries</Text>
              <Text style={styles.emptyText}>
                There are no available deliveries in your area at the moment.
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setActiveTab("active")}
              >
                <Text style={styles.emptyButtonText}>
                  Check Active Deliveries
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Delivery Details Modal */}
      {selectedDelivery && deliveryDetailsVisible && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              isLargeScreen && styles.largeScreenModalContainer,
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery Details</Text>
              <TouchableOpacity
                onPress={() => setDeliveryDetailsVisible(false)}
              >
                <X size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Status</Text>
                <View
                  style={[
                    styles.modalStatusBadge,
                    {
                      backgroundColor: `${getStatusColor(selectedDelivery.status)}20`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalStatusText,
                      { color: getStatusColor(selectedDelivery.status) },
                    ]}
                  >
                    {selectedDelivery.status.charAt(0).toUpperCase() +
                      selectedDelivery.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Restaurant</Text>
                <View style={styles.modalRestaurantInfo}>
                  <Image
                    source={{ uri: selectedDelivery.restaurant.image }}
                    style={styles.modalRestaurantImage}
                  />
                  <View>
                    <Text style={styles.modalRestaurantName}>
                      {selectedDelivery.restaurant.name}
                    </Text>
                    <Text style={styles.modalRestaurantAddress}>
                      {selectedDelivery.restaurant.address}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Customer</Text>
                <Text style={styles.modalCustomerName}>
                  {selectedDelivery.customer.name}
                </Text>
                <Text style={styles.modalCustomerAddress}>
                  {selectedDelivery.customer.address}
                </Text>
                <View style={styles.modalCustomerActions}>
                  <TouchableOpacity
                    style={styles.modalCustomerAction}
                    onPress={() =>
                      handleCallCustomer(selectedDelivery.customer.phone)
                    }
                  >
                    <Phone size={20} color="#3B82F6" />
                    <Text style={styles.modalCustomerActionText}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCustomerAction}
                    onPress={() =>
                      handleMessageCustomer(selectedDelivery.customer.name)
                    }
                  >
                    <MessageSquare size={20} color="#3B82F6" />
                    <Text style={styles.modalCustomerActionText}>Message</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Order Details</Text>
                {selectedDelivery.items.map((item, index) => (
                  <Text key={index} style={styles.modalOrderItem}>
                    {item.quantity}x {item.name}
                  </Text>
                ))}
                <View style={styles.modalOrderTotal}>
                  <Text style={styles.modalOrderTotalLabel}>Total:</Text>
                  <Text style={styles.modalOrderTotalValue}>
                    {formatCurrency(selectedDelivery.total)}
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Delivery Info</Text>
                <View style={styles.modalDeliveryInfo}>
                  <View style={styles.modalDeliveryInfoItem}>
                    <Text style={styles.modalDeliveryInfoLabel}>Distance:</Text>
                    <Text style={styles.modalDeliveryInfoValue}>
                      {selectedDelivery.distance}
                    </Text>
                  </View>
                  <View style={styles.modalDeliveryInfoItem}>
                    <Text style={styles.modalDeliveryInfoLabel}>
                      Estimated Time:
                    </Text>
                    <Text style={styles.modalDeliveryInfoValue}>
                      {selectedDelivery.estimatedDelivery}
                    </Text>
                  </View>
                  <View style={styles.modalDeliveryInfoItem}>
                    <Text style={styles.modalDeliveryInfoLabel}>
                      Order Time:
                    </Text>
                    <Text style={styles.modalDeliveryInfoValue}>
                      {selectedDelivery.orderTime}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalNavigateButton]}
                  onPress={() =>
                    Alert.alert(
                      "Navigation",
                      "Opening navigation to customer's address...",
                    )
                  }
                >
                  <Navigation size={20} color="#FFFFFF" />
                  <Text style={styles.modalNavigateButtonText}>Navigate</Text>
                </TouchableOpacity>

                {selectedDelivery.status === "picked up" && (
                  <TouchableOpacity
                    style={[
                      styles.modalActionButton,
                      styles.modalCompleteButton,
                    ]}
                    onPress={() =>
                      handleUpdateStatus(selectedDelivery, "delivered")
                    }
                  >
                    <CheckCircle size={20} color="#FFFFFF" />
                    <Text style={styles.modalCompleteButtonText}>
                      Mark as Delivered
                    </Text>
                  </TouchableOpacity>
                )}

                {selectedDelivery.status === "assigned" && (
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalPickupButton]}
                    onPress={() =>
                      handleUpdateStatus(selectedDelivery, "picked up")
                    }
                  >
                    <CheckCircle size={20} color="#FFFFFF" />
                    <Text style={styles.modalPickupButtonText}>
                      Mark as Picked Up
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 4,
    margin: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#FF5A5F",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#FFFFFF",
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
  deliveryCard: {
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
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  restaurantInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 14,
    color: "#6B7280",
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
  deliveryInfo: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    width: 70,
  },
  infoText: {
    fontSize: 14,
    color: "#1F2937",
    marginLeft: 8,
  },
  deliveryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  navigateButton: {
    backgroundColor: "#3B82F6",
    marginRight: 8,
    flexDirection: "row",
  },
  navigateButtonText: {
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  availableDeliveryCard: {
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
  availableDeliveryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  availableRestaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  availableDeliveryInfo: {
    flex: 1,
  },
  availableRestaurantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  availableDeliveryMeta: {
    flexDirection: "row",
  },
  availableDeliveryMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  availableDeliveryMetaText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  availableDeliveryTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  availableDeliveryDetails: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  availableDeliveryDetail: {
    flexDirection: "row",
    marginBottom: 8,
  },
  availableDeliveryDetailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    width: 70,
  },
  availableDeliveryDetailValue: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
  },
  acceptButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    padding: 20,
  },
  largeScreenModalContainer: {
    width: "60%",
    maxWidth: 600,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  modalContent: {
    flex: 1,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 12,
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalRestaurantInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalRestaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  modalRestaurantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  modalRestaurantAddress: {
    fontSize: 14,
    color: "#6B7280",
  },
  modalCustomerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  modalCustomerAddress: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  modalCustomerActions: {
    flexDirection: "row",
  },
  modalCustomerAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  modalCustomerActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3B82F6",
    marginLeft: 8,
  },
  modalOrderItem: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 8,
  },
  modalOrderTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    marginTop: 8,
  },
  modalOrderTotalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalOrderTotalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalDeliveryInfo: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  modalDeliveryInfoItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  modalDeliveryInfoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    width: 120,
  },
  modalDeliveryInfoValue: {
    fontSize: 14,
    color: "#1F2937",
  },
  modalActions: {
    marginTop: 20,
  },
  modalActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  modalNavigateButton: {
    backgroundColor: "#3B82F6",
  },
  modalNavigateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  modalCompleteButton: {
    backgroundColor: "#10B981",
  },
  modalCompleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  modalPickupButton: {
    backgroundColor: "#F59E0B",
  },
  modalPickupButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
});
