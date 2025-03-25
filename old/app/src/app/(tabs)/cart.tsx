import { useRouter } from "expo-router";
import {
  Banknote,
  ChevronRight,
  CreditCard,
  Minus,
  Plus,
  Trash2,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
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

import AddressSelector from "../../components/AddressSelector";
import DesktopHeader from "../../components/DesktopHeader";
import { useAddresses } from "../../lib/hooks/useAddresses";
import { useCart } from "../../lib/hooks/useCart";
import { useOrders } from "../../lib/hooks/useOrders";
import { usePaymentMethods } from "../../lib/hooks/usePaymentMethods";
import { formatCurrency } from "../../lib/utils";

export default function CartScreen() {
  const router = useRouter();
  const {
    cartItems,
    isLoading,
    error,
    getCartTotals,
    updateQuantity,
    refetch,
  } = useCart();
  const { addresses, addAddress, setDefaultAddress, deleteAddress } =
    useAddresses();
  const { paymentMethods, setDefaultPaymentMethod, deletePaymentMethod } =
    usePaymentMethods();
  const { placeOrder } = useOrders();

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [orderPlacedModalVisible, setOrderPlacedModalVisible] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedCardId, setSelectedCardId] = useState("");

  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;
  const isExtraLargeScreen = dimensions.width >= 1200;

  // Set initial values when data is loaded
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((addr) => addr.is_default);
      if (defaultAddr) {
        setDeliveryAddress(defaultAddr.address);
      } else {
        setDeliveryAddress(addresses[0].address);
      }
    }

    if (paymentMethods.length > 0) {
      const defaultMethod = paymentMethods.find((method) => method.is_default);
      if (defaultMethod) {
        setSelectedCardId(defaultMethod.id);
      }
    }
  }, [addresses, paymentMethods]);

  // Refresh cart when screen is focused
  useEffect(() => {
    refetch();
  }, []);

  const updateItemQuantity = (id: string, change: number) => {
    const item = cartItems.find((item) => item.id === id);
    if (item) {
      const newQuantity = item.quantity + change;
      updateQuantity(id, newQuantity);
    }
  };

  const removeItem = (id: string) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => updateQuantity(id, 0),
        },
      ],
    );
  };

  const { subtotal, deliveryFee, serviceFee, total } =
    getCartTotals(paymentMethod);

  const handleAddressChange = (address: string) => {
    setDeliveryAddress(address);
  };

  const handleSelectPaymentMethod = (
    method: string,
    cardId: string | null = null,
  ) => {
    setPaymentMethod(method);
    if (method === "card" && cardId) {
      setSelectedCardId(cardId);
    }
    setPaymentModalVisible(false);
  };

  const handleCheckout = () => {
    // Validate that we have a delivery address
    if (!deliveryAddress) {
      Alert.alert("Missing Information", "Please select a delivery address");
      return;
    }

    // Validate payment method
    if (paymentMethod === "card" && !selectedCardId) {
      Alert.alert("Missing Information", "Please select a payment card");
      return;
    }

    Alert.alert(
      "Confirm Order",
      `Your order will be placed with ${paymentMethod === "cash" ? "cash" : "card"} payment.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Place Order",
          onPress: async () => {
            // Get restaurant info from first cart item (assuming all items are from same restaurant)
            if (cartItems.length === 0) {
              return;
            }

            const restaurantId = cartItems[0].restaurant_id;
            const restaurantName = cartItems[0].restaurant_name;

            // Create order object
            const orderData = {
              restaurant_id: restaurantId,
              restaurant_name: restaurantName,
              total: total,
              delivery_address: deliveryAddress,
              payment_method: paymentMethod === "card" ? "card" : "cash",
              items: cartItems.map((item) => ({
                menu_item_id: item.menu_item_id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),
            };

            // Place order
            const orderId = await placeOrder(orderData);

            if (orderId) {
              // Show order placed modal
              setOrderPlacedModalVisible(true);
            } else {
              Alert.alert(
                "Error",
                "There was a problem placing your order. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const handleOrderComplete = () => {
    setOrderPlacedModalVisible(false);
    router.push("/orders");
  };

  const handleRestaurantPress = (restaurantId: string) => {
    router.push(`/restaurant/${restaurantId}`);
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
          <Text>Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
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
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.push("/")}
          >
            <Text style={styles.retryButtonText}>Go to Home</Text>
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
      {cartItems.length > 0 ? (
        <>
          <ScrollView
            style={[
              styles.scrollView,
              isLargeScreen && styles.largeScreenScrollView,
            ]}
          >
            <View
              style={[
                styles.cartContentContainer,
                isLargeScreen && styles.largeScreenCartContentContainer,
              ]}
            >
              {/* Cart Items */}
              <View style={styles.cartItemsContainer}>
                <Text
                  style={[
                    styles.sectionTitle,
                    isLargeScreen && styles.largeScreenSectionTitle,
                  ]}
                >
                  Your Cart
                </Text>
                {cartItems.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.cartItem,
                      isLargeScreen && styles.largeScreenCartItem,
                    ]}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.itemImage}
                    />
                    <View style={styles.itemDetails}>
                      <Text
                        style={[
                          styles.itemName,
                          isLargeScreen && styles.largeScreenItemName,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          handleRestaurantPress(item.restaurant_id)
                        }
                      >
                        <Text style={styles.restaurantName}>
                          {item.restaurant_name}
                        </Text>
                      </TouchableOpacity>
                      <Text style={styles.itemPrice}>
                        {formatCurrency(item.price)}
                      </Text>
                    </View>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateItemQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus
                          size={16}
                          color={item.quantity <= 1 ? "#D1D5DB" : "#1F2937"}
                        />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateItemQuantity(item.id, 1)}
                      >
                        <Plus size={16} color="#1F2937" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeItem(item.id)}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* Delivery Address */}
              <View style={styles.deliveryAddressContainer}>
                <View style={styles.deliveryAddressHeader}>
                  <Text style={styles.sectionTitle}>Delivery Address</Text>
                </View>
                <AddressSelector
                  onSelectAddress={handleAddressChange}
                  currentAddress={deliveryAddress}
                  showLabel={false}
                  compact={true}
                />
              </View>

              {/* Payment Method */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentOptions}>
                  <TouchableOpacity
                    style={[
                      styles.paymentOption,
                      paymentMethod === "cash" && styles.selectedPaymentOption,
                    ]}
                    onPress={() => setPaymentMethod("cash")}
                  >
                    <Banknote
                      size={24}
                      color={paymentMethod === "cash" ? "#FFFFFF" : "#1F2937"}
                    />
                    <Text
                      style={[
                        styles.paymentOptionText,
                        paymentMethod === "cash" &&
                          styles.selectedPaymentOptionText,
                      ]}
                    >
                      Cash (Free)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.paymentOption,
                      paymentMethod === "card" && styles.selectedPaymentOption,
                    ]}
                    onPress={() => setPaymentModalVisible(true)}
                  >
                    <CreditCard
                      size={24}
                      color={paymentMethod === "card" ? "#FFFFFF" : "#1F2937"}
                    />
                    <Text
                      style={[
                        styles.paymentOptionText,
                        paymentMethod === "card" &&
                          styles.selectedPaymentOptionText,
                      ]}
                    >
                      Card
                    </Text>
                  </TouchableOpacity>
                </View>
                {paymentMethod === "card" && (
                  <TouchableOpacity
                    style={styles.selectedCardContainer}
                    onPress={() => setPaymentModalVisible(true)}
                  >
                    <View style={styles.selectedCardInfo}>
                      <CreditCard size={16} color="#6B7280" />
                      <Text style={styles.selectedCardText}>
                        {paymentMethods.find(
                          (card) => card.id === selectedCardId,
                        )?.type || "Select a card"}
                        {paymentMethods.find(
                          (card) => card.id === selectedCardId,
                        )?.last4
                          ? ` ending in ${paymentMethods.find((card) => card.id === selectedCardId)?.last4}`
                          : ""}
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Order Summary */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(subtotal)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Delivery Fee</Text>
                  <Text style={styles.summaryValue}>
                    {paymentMethod === "cash"
                      ? "FREE"
                      : formatCurrency(deliveryFee)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Service Fee</Text>
                  <Text style={styles.summaryValue}>
                    {paymentMethod === "cash"
                      ? "FREE"
                      : formatCurrency(serviceFee)}
                  </Text>
                </View>
                <View style={[styles.summaryItem, styles.totalItem]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Checkout Button */}
          <View
            style={[
              styles.checkoutContainer,
              isLargeScreen && styles.largeScreenCheckoutContainer,
            ]}
          >
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyCartContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1586074299757-dc655f18518c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            }}
            style={styles.emptyCartImage}
          />
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartText}>
            Add items from restaurants to start an order
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push("/")}
          >
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Method Modal */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              isLargeScreen && styles.largeScreenModalContent,
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Method</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <X size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.paymentMethodItem,
                paymentMethod === "cash" && styles.selectedPaymentMethodItem,
              ]}
              onPress={() => handleSelectPaymentMethod("cash")}
            >
              <View style={styles.paymentMethodContent}>
                <Banknote
                  size={24}
                  color={paymentMethod === "cash" ? "#FFFFFF" : "#1F2937"}
                />
                <View style={styles.paymentMethodInfo}>
                  <Text
                    style={[
                      styles.paymentMethodName,
                      paymentMethod === "cash" &&
                        styles.selectedPaymentMethodText,
                    ]}
                  >
                    Cash on Delivery
                  </Text>
                  <Text
                    style={[
                      styles.paymentMethodDescription,
                      paymentMethod === "cash" &&
                        styles.selectedPaymentMethodText,
                    ]}
                  >
                    Pay when your order arrives
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <Text style={styles.modalSubtitle}>Saved Cards</Text>
            {paymentMethods.length > 0 ? (
              paymentMethods.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.paymentMethodItem,
                    paymentMethod === "card" &&
                      selectedCardId === card.id &&
                      styles.selectedPaymentMethodItem,
                  ]}
                  onPress={() => handleSelectPaymentMethod("card", card.id)}
                >
                  <View style={styles.paymentMethodContent}>
                    <CreditCard
                      size={24}
                      color={
                        paymentMethod === "card" && selectedCardId === card.id
                          ? "#FFFFFF"
                          : "#1F2937"
                      }
                    />
                    <View style={styles.paymentMethodInfo}>
                      <Text
                        style={[
                          styles.paymentMethodName,
                          paymentMethod === "card" &&
                            selectedCardId === card.id &&
                            styles.selectedPaymentMethodText,
                        ]}
                      >
                        {card.type} ending in {card.last4}
                      </Text>
                      {card.is_default && (
                        <Text
                          style={[
                            styles.defaultText,
                            paymentMethod === "card" &&
                              selectedCardId === card.id &&
                              styles.selectedPaymentMethodText,
                          ]}
                        >
                          Default
                        </Text>
                      )}
                    </View>
                  </View>
                  {!card.is_default && (
                    <View style={styles.paymentActions}>
                      <TouchableOpacity
                        style={styles.paymentActionButton}
                        onPress={() => setDefaultPaymentMethod(card.id)}
                      >
                        <Text style={styles.paymentActionText}>
                          Set Default
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.paymentActionButton,
                          styles.deleteButton,
                        ]}
                        onPress={() => deletePaymentMethod(card.id)}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noCardsText}>
                No saved cards. Add a new card below.
              </Text>
            )}

            <TouchableOpacity
              style={styles.addCardButton}
              onPress={() => {
                setPaymentModalVisible(false);
                router.push("/profile");
                Alert.alert(
                  "Add Card",
                  "You can add a new card in your profile settings",
                );
              }}
            >
              <Text style={styles.addCardButtonText}>Add New Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Order Placed Modal */}
      <Modal
        visible={orderPlacedModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOrderPlacedModalVisible(false)}
      >
        {orderPlacedModalVisible && (
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                isLargeScreen && styles.largeScreenModalContent,
              ]}
            >
              <View style={styles.orderSuccessContainer}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1576867757603-05b134ebc379?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                  }}
                  style={styles.orderSuccessImage}
                />
                <Text style={styles.orderSuccessTitle}>Order Placed!</Text>
                <Text style={styles.orderSuccessText}>
                  Your order has been successfully placed and will be delivered
                  to you soon.
                </Text>
                <TouchableOpacity
                  style={styles.orderSuccessButton}
                  onPress={handleOrderComplete}
                >
                  <Text style={styles.orderSuccessButtonText}>
                    Track Your Order
                  </Text>
                </TouchableOpacity>
              </View>
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
  retryButton: {
    backgroundColor: "#FF5A5F",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  largeScreenScrollView: {
    paddingTop: 24,
  },
  cartContentContainer: {
    padding: 16,
  },
  largeScreenCartContentContainer: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 24,
  },
  cartItemsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 16,
  },
  largeScreenCartItem: {
    paddingVertical: 20,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  largeScreenItemName: {
    fontSize: 18,
  },
  restaurantName: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
    textDecorationLine: "underline",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginLeft: 8,
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
    marginHorizontal: 8,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  deliveryAddressContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    paddingBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deliveryAddressHeader: {
    padding: 16,
    paddingBottom: 8,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  largeScreenSectionTitle: {
    fontSize: 20,
  },
  paymentOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 8,
  },
  selectedPaymentOption: {
    backgroundColor: "#FF5A5F",
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginLeft: 8,
  },
  selectedPaymentOptionText: {
    color: "#FFFFFF",
  },
  selectedCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  selectedCardInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedCardText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#4B5563",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  totalItem: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  checkoutContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  largeScreenCheckoutContainer: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  checkoutButton: {
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyCartContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyCartImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
    borderRadius: 100,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyCartText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
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
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 12,
    marginTop: 16,
  },
  paymentMethodItem: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedPaymentMethodItem: {
    backgroundColor: "#FF5A5F",
  },
  paymentMethodContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodInfo: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  selectedPaymentMethodText: {
    color: "#FFFFFF",
  },
  defaultText: {
    fontSize: 12,
    color: "#6B7280",
  },
  paymentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  paymentActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginLeft: 8,
  },
  paymentActionText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
  },
  deleteButtonText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
  },
  noCardsText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  addCardButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  addCardButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5A5F",
  },
  orderSuccessContainer: {
    alignItems: "center",
    padding: 16,
  },
  orderSuccessImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 24,
  },
  orderSuccessTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  orderSuccessText: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
  },
  orderSuccessButton: {
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  orderSuccessButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
