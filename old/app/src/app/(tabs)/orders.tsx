import { useRouter } from "expo-router";
import { Clock, MapPin, MessageSquare, Phone, X } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock data for orders
const mockOrders = [
  {
    id: "1",
    restaurant: "Burger Palace",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    items: [
      { name: "Double Cheeseburger", quantity: 1 },
      { name: "Fries", quantity: 1 },
    ],
    total: 12.98,
    status: "active",
    estimatedDelivery: "15-25 min",
    orderDate: "Today, 12:30  PM",
    deliveryAddress: "123 Main St, Anytown",
    deliveryPerson: {
      name: "John D.",
      phone: "555-123-4567",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60",
    },
  },
  {
    id: "2",
    restaurant: "Pizza Heaven",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    items: [
      { name: "Pepperoni Pizza", quantity: 2 },
      { name: "Garlic Bread", quantity: 1 },
    ],
    total: 29.97,
    status: "completed",
    orderDate: "Yesterday, 7:15 PM",
    deliveryAddress: "456 Oak St, Anytown",
  },
  {
    id: "3",
    restaurant: "Sushi Express",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    items: [
      { name: "California Roll", quantity: 1 },
      { name: "Salmon Nigiri", quantity: 2 },
      { name: "Miso Soup", quantity: 1 },
    ],
    total: 24.5,
    status: "completed",
    orderDate: "May 15, 6:20 PM",
    deliveryAddress: "789 Pine St, Anytown",
  },
];

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState("active");
  const [orderDetailsModalVisible, setOrderDetailsModalVisible] =
    useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const router = useRouter();

  const filteredOrders = mockOrders.filter((order) =>
    activeTab === "active"
      ? order.status === "active"
      : order.status === "completed",
  );

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOrderDetailsModalVisible(true);
  };

  const handleReorder = (order) => {
    Alert.alert(
      "Confirm Reorder",
      `Would you like to reorder from ${order.restaurant}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reorder",
          onPress: () => {
            // In a real app, this would add the items to the cart
            Alert.alert("Success", "Items added to your cart", [
              {
                text: "View Cart",
                onPress: () => router.push("/cart"),
              },
              {
                text: "Continue Shopping",
                style: "cancel",
              },
            ]);
          },
        },
      ],
    );
  };

  const handleCallDriver = (phone) => {
    Alert.alert("Call Driver", `Would you like to call ${phone}?`, [
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

  const handleMessageDriver = (name) => {
    Alert.alert("Message Driver", `Would you like to message ${name}?`, [
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

  const renderActiveOrder = (order) => (
    <View style={styles.activeOrderCard}>
      <View style={styles.orderHeader}>
        <Image source={{ uri: order.image }} style={styles.restaurantImage} />
        <View style={styles.orderHeaderInfo}>
          <Text style={styles.restaurantName}>{order.restaurant}</Text>
          <View style={styles.orderStatusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.orderStatusText}>Order in progress</Text>
          </View>
        </View>
      </View>

      <View style={styles.orderItems}>
        {order.items.map((item, index) => (
          <Text key={index} style={styles.orderItemText}>
            {item.quantity}x {item.name}
          </Text>
        ))}
      </View>

      <View style={styles.deliveryInfo}>
        <View style={styles.deliveryTimeContainer}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.deliveryTimeText}>
            Estimated delivery: {order.estimatedDelivery}
          </Text>
        </View>

        <View style={styles.deliveryAddressContainer}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.deliveryAddressText}>
            {order.deliveryAddress}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.deliveryPersonContainer}>
        <Image
          source={{ uri: order.deliveryPerson.image }}
          style={styles.deliveryPersonImage}
        />
        <View style={styles.deliveryPersonInfo}>
          <Text style={styles.deliveryPersonName}>
            {order.deliveryPerson.name} is delivering your order
          </Text>
          <Text style={styles.deliveryPersonPhone}>
            {order.deliveryPerson.phone}
          </Text>
        </View>
        <View style={styles.contactButtons}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleCallDriver(order.deliveryPerson.phone)}
          >
            <Phone size={20} color="#FF5A5F" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleMessageDriver(order.deliveryPerson.name)}
          >
            <MessageSquare size={20} color="#FF5A5F" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={() => handleViewDetails(order)}
      >
        <Text style={styles.viewDetailsButtonText}>View Order Details</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCompletedOrder = (order) => (
    <TouchableOpacity
      style={styles.completedOrderCard}
      onPress={() => handleViewDetails(order)}
    >
      <View style={styles.completedOrderHeader}>
        <Image
          source={{ uri: order.image }}
          style={styles.completedOrderImage}
        />
        <View style={styles.completedOrderInfo}>
          <Text style={styles.restaurantName}>{order.restaurant}</Text>
          <Text style={styles.orderDateText}>{order.orderDate}</Text>
          <Text style={styles.orderTotalText}>${order.total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {order.items.map((item, index) => (
          <Text key={index} style={styles.orderItemText}>
            {item.quantity}x {item.name}
          </Text>
        ))}
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity
          style={styles.reorderButton}
          onPress={() => handleReorder(order)}
        >
          <Text style={styles.reorderButtonText}>Reorder</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => handleViewDetails(order)}
        >
          <Text style={styles.viewDetailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Selector */}
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
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "completed" && styles.activeTabText,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            activeTab === "active"
              ? renderActiveOrder(item)
              : renderCompletedOrder(item)
          }
          contentContainerStyle={styles.ordersList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1594007654729-407eedc4fe24?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            }}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyTitle}>No {activeTab} orders</Text>
          <Text style={styles.emptyText}>
            {activeTab === "active"
              ? "You don't have any active orders at the moment"
              : "You haven't completed any orders yet"}
          </Text>
        </View>
      )}

      {/* Order Details Modal */}
      <Modal
        visible={orderDetailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOrderDetailsModalVisible(false)}
      >
        {selectedOrder && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Order Details</Text>
                <TouchableOpacity
                  onPress={() => setOrderDetailsModalVisible(false)}
                >
                  <X size={24} color="#1F2937" />
                </TouchableOpacity>
              </View>

              <View style={styles.orderDetailSection}>
                <View style={styles.orderDetailHeader}>
                  <Image
                    source={{ uri: selectedOrder.image }}
                    style={styles.orderDetailImage}
                  />
                  <View>
                    <Text style={styles.orderDetailRestaurantName}>
                      {selectedOrder.restaurant}
                    </Text>
                    <Text style={styles.orderDetailDate}>
                      {selectedOrder.orderDate}
                    </Text>
                    {selectedOrder.status === "active" && (
                      <View style={styles.orderStatusContainer}>
                        <View style={styles.statusDot} />
                        <Text style={styles.orderStatusText}>
                          Order in progress
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.orderDetailSection}>
                <Text style={styles.orderDetailSectionTitle}>Items</Text>
                {selectedOrder.items.map((item, index) => (
                  <View key={index} style={styles.orderDetailItem}>
                    <Text style={styles.orderDetailItemName}>
                      {item.quantity}x {item.name}
                    </Text>
                  </View>
                ))}
                <View style={styles.orderDetailTotal}>
                  <Text style={styles.orderDetailTotalLabel}>Total</Text>
                  <Text style={styles.orderDetailTotalValue}>
                    ${selectedOrder.total.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDetailSection}>
                <Text style={styles.orderDetailSectionTitle}>
                  Delivery Address
                </Text>
                <View style={styles.orderDetailAddress}>
                  <MapPin size={16} color="#6B7280" />
                  <Text style={styles.orderDetailAddressText}>
                    {selectedOrder.deliveryAddress}
                  </Text>
                </View>
              </View>

              {selectedOrder.status === "active" &&
                selectedOrder.deliveryPerson && (
                  <View style={styles.orderDetailSection}>
                    <Text style={styles.orderDetailSectionTitle}>
                      Delivery Person
                    </Text>
                    <View style={styles.deliveryPersonContainer}>
                      <Image
                        source={{ uri: selectedOrder.deliveryPerson.image }}
                        style={styles.deliveryPersonImage}
                      />
                      <View style={styles.deliveryPersonInfo}>
                        <Text style={styles.deliveryPersonName}>
                          {selectedOrder.deliveryPerson.name}
                        </Text>
                        <Text style={styles.deliveryPersonPhone}>
                          {selectedOrder.deliveryPerson.phone}
                        </Text>
                      </View>
                      <View style={styles.contactButtons}>
                        <TouchableOpacity
                          style={styles.contactButton}
                          onPress={() =>
                            handleCallDriver(selectedOrder.deliveryPerson.phone)
                          }
                        >
                          <Phone size={20} color="#FF5A5F" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.contactButton}
                          onPress={() =>
                            handleMessageDriver(
                              selectedOrder.deliveryPerson.name,
                            )
                          }
                        >
                          <MessageSquare size={20} color="#FF5A5F" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}

              {selectedOrder.status === "completed" && (
                <TouchableOpacity
                  style={styles.modalReorderButton}
                  onPress={() => {
                    setOrderDetailsModalVisible(false);
                    handleReorder(selectedOrder);
                  }}
                >
                  <Text style={styles.modalReorderButtonText}>Reorder</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setOrderDetailsModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
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
  ordersList: {
    padding: 16,
    paddingTop: 0,
  },
  activeOrderCard: {
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
  orderHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  orderHeaderInfo: {
    marginLeft: 12,
    justifyContent: "center",
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  orderStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  orderStatusText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItemText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
  },
  deliveryInfo: {
    marginBottom: 16,
  },
  deliveryTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  deliveryTimeText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
    marginLeft: 8,
  },
  deliveryAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryAddressText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  deliveryPersonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryPersonImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  deliveryPersonInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deliveryPersonName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  deliveryPersonPhone: {
    fontSize: 14,
    color: "#6B7280",
  },
  contactButtons: {
    flexDirection: "row",
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  completedOrderCard: {
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
  completedOrderHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  completedOrderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  completedOrderInfo: {
    marginLeft: 12,
    justifyContent: "center",
    flex: 1,
  },
  orderDateText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  orderTotalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  reorderButton: {
    flex: 1,
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 8,
  },
  reorderButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 8,
    marginTop: 16,
  },
  viewDetailsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  orderDetailSection: {
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  orderDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderDetailImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  orderDetailRestaurantName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  orderDetailDate: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  orderDetailSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  orderDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderDetailItemName: {
    fontSize: 14,
    color: "#4B5563",
  },
  orderDetailTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    marginTop: 8,
  },
  orderDetailTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  orderDetailTotalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  orderDetailAddress: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderDetailAddressText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
  },
  modalReorderButton: {
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  modalReorderButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalCloseButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
});
