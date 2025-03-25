import * as Location from "expo-location";
import {
  Check,
  ChevronRight,
  CircleAlert as AlertCircle,
  MapPin,
  Navigation,
  Plus,
  Search,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { useAddresses } from "../lib/hooks/useAddresses";

// Replace with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

// Function to get address from coordinates using Google Maps API
const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number,
) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`,
    );
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      // Fallback to coordinates if geocoding fails
      return `Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
    }
  } catch (error) {
    console.error("Error geocoding:", error);
    // Fallback to coordinates
    return `Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
  }
};

export default function AddressSelector({
  onSelectAddress,
  currentAddress,
  showLabel = true,
  compact = false,
}: AddressSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [customAddressMode, setCustomAddressMode] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [animation] = useState(new Animated.Value(0));
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);

  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;

  const {
    addresses,
    addAddress,
    setDefaultAddress,
    deleteAddress,
    isLoading,
    error,
  } = useAddresses();

  // Set initial selected address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((addr) => addr.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        if (!currentAddress) {
          onSelectAddress(defaultAddr.address);
        }
      }
    }
  }, [addresses, selectedAddressId, currentAddress, onSelectAddress]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Animation for location button
  useEffect(() => {
    if (locationLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [locationLoading, animation]);

  const spin = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleGetCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    setLocationPermissionDenied(false);

    try {
      // Check if location services are enabled
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationPermissionDenied(true);
        setLocationError(
          "Location permission denied. Please enable location services in your device settings.",
        );
        setLocationLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      try {
        // Try to get address from coordinates
        const address = await getAddressFromCoordinates(latitude, longitude);
        setCurrentLocation(address);
        onSelectAddress(address);
        setModalVisible(false);

        // Ask if they want to save this address
        Alert.alert(
          "Save Address",
          "Would you like to save this address for future use?",
          [
            {
              text: "No",
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: async () => {
                const success = await addAddress(
                  address,
                  addresses.length === 0,
                );
                if (success) {
                  Alert.alert("Success", "Address saved successfully");
                } else {
                  Alert.alert(
                    "Error",
                    "Failed to save address. Please try again.",
                  );
                }
              },
            },
          ],
        );
      } catch (geocodeError) {
        // If geocoding fails, offer to enter address manually
        console.error("Error geocoding:", geocodeError);
        const coordsText = `Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;

        Alert.alert(
          "Address Detection Failed",
          "We couldn't translate your location to an address. Would you like to use the coordinates, or enter your address manually?",
          [
            {
              text: "Use Coordinates",
              onPress: () => {
                onSelectAddress(coordsText);
                setModalVisible(false);
              },
            },
            {
              text: "Enter Manually",
              onPress: () => {
                setNewAddress(coordsText);
                setCustomAddressMode(true);
              },
            },
          ],
        );
      }
    } catch (locationError) {
      console.error("Error getting location:", locationError);
      setLocationError(
        "Error getting your location. Please try entering your address manually.",
      );
      setCustomAddressMode(true);
    } finally {
      setLocationLoading(false);
    }
  };

  const formatGeocodedAddress = (
    geocode: Location.LocationGeocodedAddress,
  ): string => {
    const components = [
      geocode.name,
      geocode.street,
      geocode.streetNumber,
      geocode.city,
      geocode.region,
      geocode.postalCode,
      geocode.country,
    ].filter(Boolean);

    return components.join(", ");
  };

  const handleAddressSelect = (id: string, addressText: string) => {
    setSelectedAddressId(id);
    onSelectAddress(addressText);
    setModalVisible(false);
  };

  const handleAddNewAddress = async () => {
    if (newAddress.trim() === "") {
      Alert.alert("Error", "Please enter a valid address");
      return;
    }

    const success = await addAddress(newAddress, addresses.length === 0);

    if (success) {
      setNewAddress("");
      setCustomAddressMode(false);
      Alert.alert("Success", "New delivery address added");
    } else {
      Alert.alert("Error", "Failed to add address. Please try again.");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteAddress(id);
          },
        },
      ],
    );
  };

  const filteredAddresses = searchQuery
    ? addresses.filter((addr) =>
        addr.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : addresses;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          compact && styles.compactContainer,
          isLargeScreen && styles.largeScreenContainer,
        ]}
        onPress={() => setModalVisible(true)}
      >
        {showLabel && <Text style={styles.label}>Delivering to</Text>}
        <View style={styles.addressRow}>
          <MapPin size={16} color="#FF5A5F" style={styles.icon} />
          <Text
            style={[
              styles.addressText,
              compact && styles.compactAddressText,
              isLargeScreen && styles.largeScreenAddressText,
            ]}
            numberOfLines={1}
          >
            {currentAddress || "Select delivery address"}
          </Text>
          <ChevronRight size={16} color="#6B7280" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              keyboardVisible && styles.modalContainerWithKeyboard,
              isLargeScreen && styles.largeScreenModalContainer,
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery Address</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  setCustomAddressMode(false);
                  setSearchQuery("");
                  setLocationError(null);
                  setLocationPermissionDenied(false);
                }}
              >
                <X size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            {!customAddressMode ? (
              <>
                <View style={styles.searchContainer}>
                  <Search size={20} color="#6B7280" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search saved addresses"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <X size={18} color="#6B7280" />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={styles.currentLocationButton}
                  onPress={handleGetCurrentLocation}
                  disabled={locationLoading}
                >
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Navigation size={20} color="#FF5A5F" />
                  </Animated.View>
                  <Text style={styles.currentLocationText}>
                    {locationLoading
                      ? "Getting your location..."
                      : "Use current location"}
                  </Text>
                </TouchableOpacity>

                {locationError ? (
                  <View style={styles.errorContainer}>
                    <AlertCircle
                      size={20}
                      color="#EF4444"
                      style={styles.errorIcon}
                    />
                    <Text style={styles.errorText}>{locationError}</Text>
                  </View>
                ) : null}

                {locationPermissionDenied && (
                  <View style={styles.permissionInstructions}>
                    <Text style={styles.permissionTitle}>
                      Enable Location Access
                    </Text>
                    <Text style={styles.permissionText}>
                      To use your current location, please enable location
                      access in your browser settings:
                    </Text>
                    <View style={styles.permissionSteps}>
                      <Text style={styles.permissionStep}>
                        1. Click the lock/info icon in your browser's address
                        bar
                      </Text>
                      <Text style={styles.permissionStep}>
                        2. Select "Site settings" or "Permissions"
                      </Text>
                      <Text style={styles.permissionStep}>
                        3. Enable "Location" permission
                      </Text>
                      <Text style={styles.permissionStep}>
                        4. Refresh the page and try again
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Saved Addresses</Text>

                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FF5A5F" />
                    <Text style={styles.loadingText}>Loading addresses...</Text>
                  </View>
                ) : error ? (
                  <View style={styles.errorContainer}>
                    <AlertCircle
                      size={20}
                      color="#EF4444"
                      style={styles.errorIcon}
                    />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : (
                  <FlatList
                    data={filteredAddresses}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.addressItem,
                          selectedAddressId === item.id &&
                            styles.selectedAddressItem,
                          isLargeScreen && styles.largeScreenAddressItem,
                        ]}
                        onPress={() =>
                          handleAddressSelect(item.id, item.address)
                        }
                      >
                        <View style={styles.addressItemContent}>
                          <MapPin
                            size={20}
                            color={
                              selectedAddressId === item.id
                                ? "#FFFFFF"
                                : "#FF5A5F"
                            }
                          />
                          <View style={styles.addressItemText}>
                            <Text
                              style={[
                                styles.addressItemLabel,
                                selectedAddressId === item.id &&
                                  styles.selectedAddressItemText,
                              ]}
                            >
                              {item.address}
                            </Text>
                            {item.is_default && (
                              <View style={styles.defaultBadge}>
                                <Text style={styles.defaultBadgeText}>
                                  Default
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <View style={styles.addressActions}>
                          {!item.is_default && (
                            <TouchableOpacity
                              style={styles.addressActionButton}
                              onPress={() => setDefaultAddress(item.id)}
                            >
                              <Check size={16} color="#4B5563" />
                              <Text style={styles.addressActionText}>
                                Set Default
                              </Text>
                            </TouchableOpacity>
                          )}
                          {!item.is_default && (
                            <TouchableOpacity
                              style={[
                                styles.addressActionButton,
                                styles.deleteButton,
                              ]}
                              onPress={() => handleDeleteAddress(item.id)}
                            >
                              <X size={16} color="#EF4444" />
                              <Text style={styles.deleteButtonText}>
                                Delete
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                          {searchQuery
                            ? "No addresses match your search"
                            : "No saved addresses yet"}
                        </Text>
                        <Text style={styles.emptySubText}>
                          Add a new address below or use your current location
                        </Text>
                      </View>
                    }
                    style={[
                      styles.addressList,
                      isLargeScreen && styles.largeScreenAddressList,
                    ]}
                  />
                )}

                <TouchableOpacity
                  style={styles.addAddressButton}
                  onPress={() => {
                    setCustomAddressMode(true);
                    setSearchQuery("");
                  }}
                >
                  <Plus size={20} color="#FF5A5F" />
                  <Text style={styles.addAddressButtonText}>
                    Add New Address
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Enter New Address</Text>
                <TextInput
                  style={[
                    styles.addressInput,
                    isLargeScreen && styles.largeScreenAddressInput,
                  ]}
                  placeholder="Enter your full address"
                  value={newAddress}
                  onChangeText={setNewAddress}
                  multiline
                  autoFocus
                />
                <Text style={styles.addressInputHelp}>
                  Please enter your complete address including street, city, and
                  postal code
                </Text>
                <View style={styles.addressButtonsRow}>
                  <TouchableOpacity
                    style={[styles.addressActionButton, styles.cancelButton]}
                    onPress={() => setCustomAddressMode(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.addressActionButton, styles.saveButton]}
                    onPress={handleAddNewAddress}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  compactContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderBottomWidth: 1,
  },
  largeScreenContainer: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginVertical: 8,
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  addressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  compactAddressText: {
    fontSize: 13,
  },
  largeScreenAddressText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalContainerWithKeyboard: {
    maxHeight: "50%",
  },
  largeScreenModalContainer: {
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: "#1F2937",
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  currentLocationText: {
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 12,
  },
  addressList: {
    maxHeight: 300,
  },
  largeScreenAddressList: {
    maxHeight: 400,
  },
  addressItem: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  largeScreenAddressItem: {
    padding: 20,
  },
  selectedAddressItem: {
    backgroundColor: "#FF5A5F",
  },
  addressItemContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressItemText: {
    marginLeft: 12,
    flex: 1,
  },
  addressItemLabel: {
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 4,
  },
  selectedAddressItemText: {
    color: "#FFFFFF",
  },
  defaultBadge: {
    backgroundColor: "#10B981",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  defaultBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  addressActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  addressActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  addressActionText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
  },
  deleteButtonText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
    marginLeft: 4,
  },
  addAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  addAddressButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5A5F",
    marginLeft: 8,
  },
  addressInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  addressInputHelp: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  largeScreenAddressInput: {
    minHeight: 150,
  },
  addressButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    flex: 1,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  saveButton: {
    backgroundColor: "#FF5A5F",
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    color: "#6B7280",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  errorIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubText: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
  },
  permissionInstructions: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D4ED8",
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 12,
  },
  permissionSteps: {
    marginLeft: 8,
  },
  permissionStep: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 6,
  },
});
