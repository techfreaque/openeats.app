import { useRouter } from "expo-router";
import {
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  MapPin,
  Star,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



// Mock data for delivery history
const deliveryHistory = [
  {
    id: "del-101",
    date: "Today",
    deliveries: [
      {
        id: "del-001",
        restaurant: {
          name: "Burger Palace",
          image:
            "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        },
        customer: {
          name: "John Smith",
          address: "456 Oak St, Anytown",
        },
        time: "2:30 PM",
        total: 15.97,
        tip: 3.0,
        distance: "2.3 miles",
        rating: 5,
      },
      {
        id: "del-002",
        restaurant: {
          name: "Pizza Heaven",
          image:
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        },
        customer: {
          name: "Sarah Johnson",
          address: "789 Pine St, Anytown",
        },
        time: "12:45 PM",
        total: 24.99,
        tip: 5.0,
        distance: "3.1 miles",
        rating: 4,
      },
    ],
  },
  {
    id: "del-102",
    date: "Yesterday",
    deliveries: [
      {
        id: "del-003",
        restaurant: {
          name: "Sushi Express",
          image:
            "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        },
        customer: {
          name: "Mike Davis",
          address: "101 Elm St, Anytown",
        },
        time: "7:15 PM",
        total: 32.5,
        tip: 7.5,
        distance: "1.8 miles",
        rating: 5,
      },
      {
        id: "del-004",
        restaurant: {
          name: "Taco Fiesta",
          image:
            "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        },
        customer: {
          name: "Emily Wilson",
          address: "202 Maple St, Anytown",
        },
        time: "1:30 PM",
        total: 18.75,
        tip: 4.0,
        distance: "2.5 miles",
        rating: 4,
      },
    ],
  },
  {
    id: "del-103",
    date: "May 15, 2025",
    deliveries: [
      {
        id: "del-005",
        restaurant: {
          name: "Noodle House",
          image:
            "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        },
        customer: {
          name: "David Brown",
          address: "303 Cedar St, Anytown",
        },
        time: "6:45 PM",
        total: 22.99,
        tip: 4.5,
        distance: "3.2 miles",
        rating: 5,
      },
    ],
  },
];

export default function DriverHistoryScreen() {
  const router = useRouter();
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;
  const { userType } = useUserType();

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [earningsData, setEarningsData] = useState({
    today: 0,
    week: 0,
    month: 0,
  });

  // Redirect if not a driver user
  useEffect(() => {
    if (userType !== "driver") {
      router.replace("/");
    }
  }, [userType, router]);

  // Calculate earnings
  useEffect(() => {
    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;

    deliveryHistory.forEach((day) => {
      const isToday = day.date === "Today";
      const isYesterday = day.date === "Yesterday";

      day.deliveries.forEach((delivery) => {
        const amount = delivery.total + delivery.tip;

        if (isToday) {
          todayEarnings += amount;
          weekEarnings += amount;
          monthEarnings += amount;
        } else if (isYesterday) {
          weekEarnings += amount;
          monthEarnings += amount;
        } else {
          monthEarnings += amount;
        }
      });
    });

    setEarningsData({
      today: todayEarnings,
      week: weekEarnings,
      month: monthEarnings,
    });
  }, []);

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setDetailsModalVisible(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          color={i < rating ? "#F59E0B" : "#E5E7EB"}
          fill={i < rating ? "#F59E0B" : "none"}
        />,
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLargeScreen && (
        <DesktopHeader
          currentAddress="Delivery History"
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
          {/* Earnings Summary */}
          <View style={styles.earningsSummary}>
            <Text
              style={[
                styles.sectionTitle,
                isLargeScreen && styles.largeScreenSectionTitle,
              ]}
            >
              Earnings Summary
            </Text>
            <View
              style={[
                styles.earningsCards,
                isLargeScreen && styles.largeScreenEarningsCards,
              ]}
            >
              <View
                style={[
                  styles.earningCard,
                  isLargeScreen && styles.largeScreenEarningCard,
                ]}
              >
                <View
                  style={[
                    styles.earningIconContainer,
                    { backgroundColor: "#FEE2E2" },
                  ]}
                >
                  <DollarSign size={24} color="#EF4444" />
                </View>
                <Text style={styles.earningAmount}>
                  {formatCurrency(earningsData.today)}
                </Text>
                <Text style={styles.earningPeriod}>Today</Text>
              </View>

              <View
                style={[
                  styles.earningCard,
                  isLargeScreen && styles.largeScreenEarningCard,
                ]}
              >
                <View
                  style={[
                    styles.earningIconContainer,
                    { backgroundColor: "#E0F2FE" },
                  ]}
                >
                  <DollarSign size={24} color="#0EA5E9" />
                </View>
                <Text style={styles.earningAmount}>
                  {formatCurrency(earningsData.week)}
                </Text>
                <Text style={styles.earningPeriod}>This Week</Text>
              </View>

              <View
                style={[
                  styles.earningCard,
                  isLargeScreen && styles.largeScreenEarningCard,
                ]}
              >
                <View
                  style={[
                    styles.earningIconContainer,
                    { backgroundColor: "#DCFCE7" },
                  ]}
                >
                  <DollarSign size={24} color="#10B981" />
                </View>
                <Text style={styles.earningAmount}>
                  {formatCurrency(earningsData.month)}
                </Text>
                <Text style={styles.earningPeriod}>This Month</Text>
              </View>
            </View>
          </View>

          {/* Delivery History */}
          <Text
            style={[
              styles.sectionTitle,
              isLargeScreen && styles.largeScreenSectionTitle,
            ]}
          >
            Delivery History
          </Text>

          {deliveryHistory.map((day) => (
            <View key={day.id} style={styles.dayContainer}>
              <View style={styles.dayHeader}>
                <View style={styles.dayTitleContainer}>
                  <Calendar size={20} color="#4B5563" />
                  <Text style={styles.dayTitle}>{day.date}</Text>
                </View>
                <Text style={styles.deliveryCount}>
                  {day.deliveries.length}{" "}
                  {day.deliveries.length === 1 ? "delivery" : "deliveries"}
                </Text>
              </View>

              {day.deliveries.map((delivery) => (
                <TouchableOpacity
                  key={delivery.id}
                  style={styles.deliveryCard}
                  onPress={() => handleViewDetails(delivery)}
                >
                  <View style={styles.deliveryHeader}>
                    <Image
                      source={{ uri: delivery.restaurant.image }}
                      style={styles.restaurantImage}
                    />
                    <View style={styles.deliveryInfo}>
                      <Text style={styles.restaurantName}>
                        {delivery.restaurant.name}
                      </Text>
                      <View style={styles.deliveryMeta}>
                        <View style={styles.deliveryMetaItem}>
                          <Clock size={14} color="#6B7280" />
                          <Text style={styles.deliveryMetaText}>
                            {delivery.time}
                          </Text>
                        </View>
                        <View style={styles.deliveryMetaItem}>
                          <MapPin size={14} color="#6B7280" />
                          <Text style={styles.deliveryMetaText}>
                            {delivery.distance}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.deliveryAmount}>
                      <Text style={styles.deliveryTotal}>
                        {formatCurrency(delivery.total)}
                      </Text>
                      <Text style={styles.deliveryTip}>
                        +{formatCurrency(delivery.tip)} tip
                      </Text>
                    </View>
                  </View>

                  <View style={styles.deliveryFooter}>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingLabel}>Rating:</Text>
                      <View style={styles.stars}>
                        {renderStars(delivery.rating)}
                      </View>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Delivery Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              isLargeScreen && styles.largeScreenModalContainer,
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <X size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            {selectedDelivery && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Restaurant</Text>
                  <View style={styles.modalRestaurantInfo}>
                    <Image
                      source={{ uri: selectedDelivery.restaurant.image }}
                      style={styles.modalRestaurantImage}
                    />
                    <Text style={styles.modalRestaurantName}>
                      {selectedDelivery.restaurant.name}
                    </Text>
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
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Delivery Details</Text>
                  <View style={styles.modalDetailItem}>
                    <Text style={styles.modalDetailLabel}>Time:</Text>
                    <Text style={styles.modalDetailValue}>
                      {selectedDelivery.time}
                    </Text>
                  </View>
                  <View style={styles.modalDetailItem}>
                    <Text style={styles.modalDetailLabel}>Distance:</Text>
                    <Text style={styles.modalDetailValue}>
                      {selectedDelivery.distance}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Payment</Text>
                  <View style={styles.modalDetailItem}>
                    <Text style={styles.modalDetailLabel}>Delivery Fee:</Text>
                    <Text style={styles.modalDetailValue}>
                      {formatCurrency(
                        selectedDelivery.total - selectedDelivery.tip,
                      )}
                    </Text>
                  </View>
                  <View style={styles.modalDetailItem}>
                    <Text style={styles.modalDetailLabel}>Tip:</Text>
                    <Text style={styles.modalDetailValue}>
                      {formatCurrency(selectedDelivery.tip)}
                    </Text>
                  </View>
                  <View style={[styles.modalDetailItem, styles.modalTotalItem]}>
                    <Text style={styles.modalTotalLabel}>Total Earnings:</Text>
                    <Text style={styles.modalTotalValue}>
                      {formatCurrency(selectedDelivery.total)}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Rating</Text>
                  <View style={styles.modalRating}>
                    <View style={styles.modalStars}>
                      {renderStars(selectedDelivery.rating)}
                    </View>
                    <Text style={styles.modalRatingText}>
                      {selectedDelivery.rating}/5
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDetailsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  earningsSummary: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  largeScreenSectionTitle: {
    fontSize: 20,
  },
  earningsCards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  largeScreenEarningsCards: {
    flexDirection: "row",
    flexWrap: "nowrap",
  },
  earningCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    width: "31%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  largeScreenEarningCard: {
    width: "32%",
    marginRight: 16,
  },
  earningIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  earningAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  earningPeriod: {
    fontSize: 14,
    color: "#6B7280",
  },
  dayContainer: {
    marginBottom: 24,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dayTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginLeft: 8,
  },
  deliveryCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  deliveryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  deliveryMeta: {
    flexDirection: "row",
  },
  deliveryMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  deliveryMetaText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  deliveryAmount: {
    alignItems: "flex-end",
  },
  deliveryTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  deliveryTip: {
    fontSize: 14,
    color: "#10B981",
  },
  deliveryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingLabel: {
    fontSize: 14,
    color: "#4B5563",
    marginRight: 8,
  },
  stars: {
    flexDirection: "row",
  },
  modalOverlay: {
    flex: 1,
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
    marginBottom: 16,
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
  },
  modalDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalDetailLabel: {
    fontSize: 14,
    color: "#4B5563",
  },
  modalDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  modalTotalItem: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
    marginTop: 8,
  },
  modalTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalTotalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalStars: {
    flexDirection: "row",
    marginRight: 8,
  },
  modalRatingText: {
    fontSize: 16,
    fontWeight: "600",
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
});
