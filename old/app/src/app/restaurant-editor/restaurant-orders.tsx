import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DesktopHeader from "../../components/DesktopHeader";
import { useUserType } from "../context/UserTypeContext";

// Mock data for restaurant orders
const mockOrders = [
  {
    id: "ord-001",
    customerName: "John Smith",
    customerPhone: "(555) 123-4567",
    customerAddress: "123 Main St, Anytown",
    items: [
      { name: "Double Cheeseburger", quantity: 1, price: 8.99 },
      { name: "Fries", quantity: 1, price: 3.99 },
      { name: "Soda", quantity: 1, price: 2.99 },
    ],
    total: 15.97,
    status: "new",
    time: "10 minutes ago",
    paymentMethod: "card",
  },
  {
    id: "ord-002",
    customerName: "Sarah Johnson",
    customerPhone: "(555) 987-6543",
    customerAddress: "456 Oak St, Anytown",
    items: [
      { name: "Veggie Burger", quantity: 1, price: 7.99 },
      { name: "Sweet Potato Fries", quantity: 1, price: 4.49 },
    ],
    total: 12.48,
    status: "preparing",
    time: "15 minutes ago",
    paymentMethod: "cash",
  },
  {
    id: "ord-003",
    customerName: "Mike Davis",
    customerPhone: "(555) 456-7890",
    customerAddress: "789 Pine St, Anytown",
    items: [
      { name: "Bacon Burger", quantity: 2, price: 9.99 },
      { name: "Onion Rings", quantity: 1, price: 4.49 },
      { name: "Milkshake", quantity: 2, price: 4.99 },
    ],
    total: 28.95,
    status: "ready",
    time: "20 minutes ago",
    paymentMethod: "card",
  },
  {
    id: "ord-004",
    customerName: "Emily Wilson",
    customerPhone: "(555) 789-0123",
    customerAddress: "321 Elm St, Anytown",
    items: [
      { name: "Chicken Sandwich", quantity: 1, price: 8.49 },
      { name: "Caesar Salad", quantity: 1, price: 6.99 },
      { name: "Iced Tea", quantity: 1, price: 2.49 },
    ],
    total: 17.97,
    status: "out for delivery",
    time: "25 minutes ago",
    paymentMethod: "card",
  },
  {
    id: "ord-005",
    customerName: "David Brown",
    customerPhone: "(555) 234-5678",
    customerAddress: "654 Maple St, Anytown",
    items: [
      { name: "Double Cheeseburger", quantity: 2, price: 8.99 },
      { name: "Chicken Nuggets", quantity: 1, price: 5.99 },
      { name: "Fries", quantity: 2, price: 3.99 },
      { name: "Soda", quantity: 2, price: 2.99 },
    ],
    total: 37.93,
    status: "delivered",
    time: "35 minutes ago",
    paymentMethod: "cash",
  },
];

export default function RestaurantOrdersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;
  const { userType } = useUserType();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsModalVisible, setOrderDetailsModalVisible] =
    useState(false);
  const [updateStatusModalVisible, setUpdateStatusModalVisible] =
    useState(false);

  // Redirect if not a restaurant user
  useEffect(() => {
    if (userType !== "restaurant") {
      router.replace("/");
    }
  }, [userType, router]);

  // If an order ID is passed in params, show that order's details
  useEffect(() => {
    if (params.id) {
      const order = mockOrders.find((o) => o.id === params.id);
      if (order) {
        setSelectedOrder(order);
        setOrderDetailsModalVisible(true);
      }
    }
  }, [params.id]);

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

  const filteredOrders = mockOrders.filter((order) => {
    // Filter by search query
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by status
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderDetailsModalVisible(true);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setUpdateStatusModalVisible(true);
  };

  const handleStatusChange = (newStatus) => {
    // In a real app, this would update the order status in the database
    // For this demo, we'll just close the modal
    setUpdateStatusModalVisible(false);

    // Show confirmation
    alert(`Order ${selectedOrder.id} status updated to ${newStatus}`);
  };

  const handleCallCustomer = (phone) => {
    alert(`Calling customer at ${phone}`);
  };

  const handleMessageCustomer = (name) => {
    alert(`Messaging customer ${name}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLargeScreen && (
        <DesktopHeader
          currentAddress="Restaurant Orders"
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
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[
                styles.headerTitle,
                isLargeScreen && styles.largeScreenHeaderTitle,
              ]}
            >
              Manage Orders
            </Text>
            <Text style={styles.headerSubtitle}>
              View and manage all your restaurant orders
            </Text>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchFilterContainer}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search orders by name or ID"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery ? (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={styles.clearButton}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filter by status:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  "all",
                  "new",
                  "preparing",
                  "ready",
                  "out for delivery",
                  "delivered",
                  "cancelled",
                ].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterButton,
                      filterStatus === status && styles.activeFilterButton,
                      filterStatus === status && {
                        backgroundColor: `${getStatusColor(status)}20`,
                      },
                    ]}
                    onPress={() => setFilterStatus(status)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        filterStatus === status &&
                          styles.activeFilterButtonText,
                        filterStatus === status && {
                          color: getStatusColor(status),
                        },
                      ]}
                    >
                      {status === "all"
                        ? "All Orders"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Orders List */}
          <View style={styles.ordersContainer}>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderId}>Order #{order.id}</Text>
                      <Text style={styles.orderCustomer}>
                        {order.customerName}
                      </Text>
                      <Text style={styles.orderTime}>{order.time}</Text>
                    </View>
                    <View
                      style={[
                        styles.orderStatusBadge,
                        {
                          backgroundColor: `${getStatusColor(order.status)}20`,
                        },
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
                    {order.items.slice(0, 2).map((item, index) => (
                      <Text key={index} style={styles.orderItemText}>
                        {item.quantity}x {item.name}
                      </Text>
                    ))}
                    {order.items.length > 2 && (
                      <Text style={styles.orderItemText}>
                        +{order.items.length - 2} more items
                      </Text>
                    )}
                  </View>

                  <View style={styles.orderFooter}>
                    <Text style={styles.orderTotal}>
                      Total: {formatCurrency(order.total)}
                    </Text>
                    <View style={styles.orderActions}>
                      <TouchableOpacity
                        style={[styles.orderActionButton, styles.viewButton]}
                        onPress={() => handleViewOrderDetails(order)}
                      >
                        <Text style={styles.viewButtonText}>View Details</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.orderActionButton, styles.updateButton]}
                        onPress={() => handleUpdateStatus(order)}
                      >
                        <Text style={styles.updateButtonText}>
                          Update Status
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <AlertCircle size={48} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No Orders Found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? "No orders match your search criteria"
                    : "You don't have any orders with this status"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        visible={orderDetailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOrderDetailsModalVisible(false)}
      >
        {selectedOrder && (
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                isLargeScreen && styles.largeScreenModalContent,
              ]}
            >
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
                  <View>
                    <Text style={styles.orderDetailId}>
                      Order #{selectedOrder.id}
                    </Text>
                    <Text style={styles.orderDetailTime}>
                      {selectedOrder.time}
                    </Text>
                    <View
                      style={[
                        styles.orderStatusBadge,
                        {
                          backgroundColor: `${getStatusColor(selectedOrder.status)}20`,
                          alignSelf: "flex-start",
                          marginTop: 8,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.orderStatusText,
                          { color: getStatusColor(selectedOrder.status) },
                        ]}
                      >
                        {selectedOrder.status.charAt(0).toUpperCase() +
                          selectedOrder.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.updateStatusButton}
                    onPress={() => {
                      setOrderDetailsModalVisible(false);
                      setUpdateStatusModalVisible(true);
                    }}
                  >
                    <Text style={styles.updateStatusButtonText}>
                      Update Status
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.orderDetailSection}>
                <Text style={styles.orderDetailSectionTitle}>
                  Customer Information
                </Text>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>
                    {selectedOrder.customerName}
                  </Text>
                  <View style={styles.customerContact}>
                    <View style={styles.customerContactItem}>
                      <Phone size={16} color="#6B7280" />
                      <Text style={styles.customerContactText}>
                        {selectedOrder.customerPhone}
                      </Text>
                    </View>
                    <View style={styles.customerContactActions}>
                      <TouchableOpacity
                        style={styles.contactButton}
                        onPress={() =>
                          handleCallCustomer(selectedOrder.customerPhone)
                        }
                      >
                        <Phone size={16} color="#FF5A5F" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.contactButton}
                        onPress={() =>
                          handleMessageCustomer(selectedOrder.customerName)
                        }
                      >
                        <MessageSquare size={16} color="#FF5A5F" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.orderDetailSection}>
                <Text style={styles.orderDetailSectionTitle}>
                  Delivery Address
                </Text>
                <View style={styles.deliveryAddressContainer}>
                  <MapPin size={16} color="#6B7280" />
                  <Text style={styles.deliveryAddressText}>
                    {selectedOrder.customerAddress}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDetailSection}>
                <Text style={styles.orderDetailSectionTitle}>Order Items</Text>
                {selectedOrder.items.map((item, index) => (
                  <View key={index} style={styles.orderDetailItem}>
                    <View style={styles.orderDetailItemInfo}>
                      <Text style={styles.orderDetailItemName}>
                        {item.quantity}x {item.name}
                      </Text>
                    </View>
                    <Text style={styles.orderDetailItemPrice}>
                      {formatCurrency(item.price * item.quantity)}
                    </Text>
                  </View>
                ))}
                <View style={styles.orderDetailTotal}>
                  <Text style={styles.orderDetailTotalLabel}>Total</Text>
                  <Text style={styles.orderDetailTotalValue}>
                    {formatCurrency(selectedOrder.total)}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDetailSection}>
                <Text style={styles.orderDetailSectionTitle}>
                  Payment Information
                </Text>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentMethod}>
                    Payment Method:{" "}
                    {selectedOrder.paymentMethod === "card"
                      ? "Credit Card"
                      : "Cash on Delivery"}
                  </Text>
                  <Text style={styles.paymentStatus}>
                    Payment Status:{" "}
                    {selectedOrder.paymentMethod === "card"
                      ? "Paid"
                      : "To be collected"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setOrderDetailsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        visible={updateStatusModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUpdateStatusModalVisible(false)}
      >
        {selectedOrder && (
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                isLargeScreen && styles.largeScreenModalContent,
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Order Status</Text>
                <TouchableOpacity
                  onPress={() => setUpdateStatusModalVisible(false)}
                >
                  <X size={24} color="#1F2937" />
                </TouchableOpacity>
              </View>

              <Text style={styles.updateStatusText}>
                Current Status:
                <Text
                  style={{
                    color: getStatusColor(selectedOrder.status),
                    fontWeight: "bold",
                  }}
                >
                  {` ${selectedOrder.status
                    .charAt(0)
                    .toUpperCase()}${selectedOrder.status.slice(1)}`}
                </Text>
              </Text>

              <Text style={styles.updateStatusSubtext}>
                Select a new status for this order:
              </Text>

              <View style={styles.statusButtonsContainer}>
                {[
                  "new",
                  "preparing",
                  "ready",
                  "out for delivery",
                  "delivered",
                  "cancelled",
                ].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      { backgroundColor: `${getStatusColor(status)}20` },
                    ]}
                    onPress={() => handleStatusChange(status)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        { color: getStatusColor(status) },
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setUpdateStatusModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  largeScreenHeaderTitle: {
    fontSize: 28,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  searchFilterContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: "#FF5A5F20",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#6B7280",
  },
  activeFilterButtonText: {
    color: "#FF5A5F",
    fontWeight: "600",
  },
  ordersContainer: {
    marginBottom: 24,
  },
  orderCard: {
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
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
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
  orderActions: {
    flexDirection: "row",
  },
  orderActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  viewButton: {
    backgroundColor: "#F3F4F6",
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  updateButton: {
    backgroundColor: "#FF5A5F",
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
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
  largeScreenModalContent: {
    maxWidth: 600,
    alignSelf: "center",
    marginTop: 100,
    marginBottom: 100,
    borderRadius: 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderDetailId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  orderDetailTime: {
    fontSize: 14,
    color: "#6B7280",
  },
  updateStatusButton: {
    backgroundColor: "#FF5A5F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  updateStatusButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  orderDetailSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  customerInfo: {
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  customerContact: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerContactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerContactText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
  },
  customerContactActions: {
    flexDirection: "row",
  },
  contactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  deliveryAddressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  deliveryAddressText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
    flex: 1,
  },
  orderDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderDetailItemInfo: {
    flex: 1,
  },
  orderDetailItemName: {
    fontSize: 14,
    color: "#1F2937",
  },
  orderDetailItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
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
  paymentInfo: {
    marginBottom: 8,
  },
  paymentMethod: {
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 4,
  },
  paymentStatus: {
    fontSize: 14,
    color: "#1F2937",
  },
  closeButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  updateStatusText: {
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 8,
  },
  updateStatusSubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  statusButtonsContainer: {
    marginBottom: 24,
  },
  statusButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
});
