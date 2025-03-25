import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  CircleHelp as HelpCircle,
  CreditCard,
  Gift,
  Heart,
  LogOut,
  MapPin,
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "(555) 123-4567",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const [addresses, setAddresses] = useState([
    { id: "1", address: "123 Main St, Anytown", default: true },
    { id: "2", address: "456 Oak St, Anytown", default: false },
  ]);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([
    { id: "1", type: "Visa", last4: "4242", default: true },
    { id: "2", type: "Mastercard", last4: "5555", default: false },
  ]);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardCVV, setNewCardCVV] = useState("");
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([
    { id: "1", name: "Burger Palace" },
    { id: "2", name: "Pizza Heaven" },
    { id: "3", name: "Sushi Express" },
  ]);
  const [favoritesModalVisible, setFavoritesModalVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          // In a real app, this would handle logout logic
          Alert.alert("Logged Out", "You have been logged out successfully");
        },
      },
    ]);
  };

  const handleSaveProfile = () => {
    setUser(editedUser);
    setEditModalVisible(false);
    Alert.alert("Success", "Profile updated successfully");
  };

  const handleAddAddress = () => {
    if (newAddress.trim() === "") {
      Alert.alert("Error", "Please enter a valid address");
      return;
    }

    const newId = (addresses.length + 1).toString();
    setAddresses([
      ...addresses,
      { id: newId, address: newAddress, default: false },
    ]);
    setNewAddress("");
    Alert.alert("Success", "Address added successfully");
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        default: addr.id === id,
      })),
    );
  };

  const handleDeleteAddress = (id) => {
    if (addresses.find((addr) => addr.id === id)?.default) {
      Alert.alert("Error", "Cannot delete default address");
      return;
    }
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleAddPaymentMethod = () => {
    if (
      newCardNumber.length < 16 ||
      newCardExpiry.trim() === "" ||
      newCardCVV.length < 3
    ) {
      Alert.alert("Error", "Please enter valid card details");
      return;
    }

    const last4 = newCardNumber.slice(-4);
    const newId = (paymentMethods.length + 1).toString();
    setPaymentMethods([
      ...paymentMethods,
      { id: newId, type: "Card", last4, default: false },
    ]);
    setNewCardNumber("");
    setNewCardExpiry("");
    setNewCardCVV("");
    Alert.alert("Success", "Payment method added successfully");
  };

  const handleSetDefaultPayment = (id) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        default: method.id === id,
      })),
    );
  };

  const handleDeletePayment = (id) => {
    if (paymentMethods.find((method) => method.id === id)?.default) {
      Alert.alert("Error", "Cannot delete default payment method");
      return;
    }
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
  };

  const handleViewFavoriteRestaurant = (id) => {
    setFavoritesModalVisible(false);
    router.push(`/restaurant/${id}`);
  };

  const menuSections = [
    {
      title: "Account",
      items: [
        {
          icon: <CreditCard size={24} color="#FF5A5F" />,
          title: "Payment Methods",
          onPress: () => setPaymentModalVisible(true),
        },
        {
          icon: <MapPin size={24} color="#FF5A5F" />,
          title: "Saved Addresses",
          onPress: () => setAddressModalVisible(true),
        },
        {
          icon: <Heart size={24} color="#FF5A5F" />,
          title: "Favorite Restaurants",
          onPress: () => setFavoritesModalVisible(true),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: <Bell size={24} color="#FF5A5F" />,
          title: "Notifications",
          toggle: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: <MapPin size={24} color="#FF5A5F" />,
          title: "Location Services",
          toggle: true,
          value: locationEnabled,
          onToggle: setLocationEnabled,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: <HelpCircle size={24} color="#FF5A5F" />,
          title: "Help Center",
          onPress: () =>
            Alert.alert("Help Center", "Our support team is available 24/7"),
        },
        {
          icon: <Gift size={24} color="#FF5A5F" />,
          title: "About OpenEats",
          onPress: () =>
            Alert.alert(
              "About OpenEats",
              "OpenEats is a free, open-source food delivery platform",
            ),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: user.image }} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.profilePhone}>{user.phone}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setEditedUser({ ...user });
              setEditModalVisible(true);
            }}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.menuItem}
                onPress={item.onPress}
                disabled={item.toggle}
              >
                <View style={styles.menuItemLeft}>
                  {item.icon}
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                </View>
                {item.toggle ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: "#D1D5DB", true: "#FF5A5F" }}
                    thumbColor={"#FFFFFF"}
                  />
                ) : (
                  <ChevronRight size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={editedUser.name}
                onChangeText={(text) =>
                  setEditedUser({ ...editedUser, name: text })
                }
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={editedUser.email}
                onChangeText={(text) =>
                  setEditedUser({ ...editedUser, email: text })
                }
                placeholder="Enter your email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                value={editedUser.phone}
                onChangeText={(text) =>
                  setEditedUser({ ...editedUser, phone: text })
                }
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Addresses Modal */}
      <Modal
        visible={addressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Saved Addresses</Text>

            {addresses.map((address) => (
              <View key={address.id} style={styles.addressItem}>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressText}>{address.address}</Text>
                  {address.default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <View style={styles.addressActions}>
                  {!address.default && (
                    <TouchableOpacity
                      style={styles.addressActionButton}
                      onPress={() => handleSetDefaultAddress(address.id)}
                    >
                      <Text style={styles.addressActionButtonText}>
                        Set Default
                      </Text>
                    </TouchableOpacity>
                  )}
                  {!address.default && (
                    <TouchableOpacity
                      style={[styles.addressActionButton, styles.deleteButton]}
                      onPress={() => handleDeleteAddress(address.id)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Add New Address</Text>
              <TextInput
                style={styles.input}
                value={newAddress}
                onChangeText={setNewAddress}
                placeholder="Enter address"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddAddress}
              >
                <Text style={styles.addButtonText}>Add Address</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setAddressModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Methods Modal */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Payment Methods</Text>

            {paymentMethods.map((method) => (
              <View key={method.id} style={styles.paymentItem}>
                <View style={styles.paymentInfo}>
                  <CreditCard size={24} color="#1F2937" />
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentType}>{method.type}</Text>
                    <Text style={styles.paymentNumber}>
                      **** **** **** {method.last4}
                    </Text>
                  </View>
                  {method.default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <View style={styles.paymentActions}>
                  {!method.default && (
                    <TouchableOpacity
                      style={styles.paymentActionButton}
                      onPress={() => handleSetDefaultPayment(method.id)}
                    >
                      <Text style={styles.paymentActionButtonText}>
                        Set Default
                      </Text>
                    </TouchableOpacity>
                  )}
                  {!method.default && (
                    <TouchableOpacity
                      style={[styles.paymentActionButton, styles.deleteButton]}
                      onPress={() => handleDeletePayment(method.id)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Add New Card</Text>
              <TextInput
                style={styles.input}
                value={newCardNumber}
                onChangeText={setNewCardNumber}
                placeholder="Card Number"
                keyboardType="number-pad"
                maxLength={16}
              />
              <View style={styles.cardDetailsRow}>
                <TextInput
                  style={[styles.input, styles.cardDetailInput]}
                  value={newCardExpiry}
                  onChangeText={setNewCardExpiry}
                  placeholder="MM/YY"
                  maxLength={5}
                />
                <TextInput
                  style={[styles.input, styles.cardDetailInput]}
                  value={newCardCVV}
                  onChangeText={setNewCardCVV}
                  placeholder="CVV"
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddPaymentMethod}
              >
                <Text style={styles.addButtonText}>Add Card</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setPaymentModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Favorites Modal */}
      <Modal
        visible={favoritesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFavoritesModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Favorite Restaurants</Text>

            {favoriteRestaurants.map((restaurant) => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.favoriteItem}
                onPress={() => handleViewFavoriteRestaurant(restaurant.id)}
              >
                <View style={styles.favoriteInfo}>
                  <Heart size={20} color="#FF5A5F" fill="#FF5A5F" />
                  <Text style={styles.favoriteName}>{restaurant.name}</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}

            {favoriteRestaurants.length === 0 && (
              <Text style={styles.emptyText}>
                You don't have any favorite restaurants yet
              </Text>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFavoritesModalVisible(false)}
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
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: "#6B7280",
  },
  editButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
  },
  menuSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemTitle: {
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 8,
  },
  versionText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  saveButton: {
    backgroundColor: "#FF5A5F",
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addressItem: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  addressInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    color: "#1F2937",
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: "#10B981",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  addressActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  addressActionButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  addressActionButtonText: {
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
  addButton: {
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  closeButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  paymentItem: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  paymentNumber: {
    fontSize: 14,
    color: "#6B7280",
  },
  paymentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  paymentActionButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  paymentActionButtonText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  cardDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardDetailInput: {
    flex: 1,
    marginRight: 8,
  },
  favoriteItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  favoriteInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteName: {
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginVertical: 24,
  },
});
