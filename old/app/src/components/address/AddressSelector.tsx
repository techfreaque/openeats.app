import * as Location from "expo-location";
import {
  ChevronRight,
  CircleAlert as AlertCircle,
  MapPin,
  Plus,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

import { useAddresses } from "../../lib/hooks/useAddresses";
import type { Address } from "../../types";
import AddressItem from "./AddressItem";
import AddressSearchBar from "./AddressSearchBar";
import { getAddressFromCoordinates } from "./addressUtils";
import CurrentLocationButton from "./CurrentLocationButton";

type AddressSelectorProps = {
  onSelectAddress: (address: string) => void;
  currentAddress?: string;
  showLabel?: boolean;
  compact?: boolean;
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
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);

  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;

  const {
    addresses,
    defaultAddress,
    isLoading: isLoadingAddresses,
    error: addressesError,
    addAddress,
    setDefault,
    removeAddress,
    fetchAddresses,
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
      () => {},
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {},
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleGetCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    setLocationPermissionDenied(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationPermissionDenied(true);
        setLocationError("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const address = await getAddressFromCoordinates(
        location.coords.latitude,
        location.coords.longitude,
      );

      setCurrentLocation(address);
      setNewAddress(address);

      // Auto-select the current location without adding it to saved addresses
      onSelectAddress(address);
      setModalVisible(false);
    } catch (locationError) {
      console.error("Error getting location:", locationError);
      setLocationError("Could not determine your location");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      Alert.alert("Error", "Please enter an address");
      return;
    }

    try {
      const success = await addAddress({
        address: newAddress,
        is_default: addresses.length === 0, // Make default if it's the first address
      });

      if (success) {
        setNewAddress("");
        setCustomAddressMode(false);

        // Refresh the address list
        await fetchAddresses();

        // Auto-select the newly added address
        const newAddressEntry = addresses.find((a) => a.address === newAddress);
        if (newAddressEntry) {
          setSelectedAddressId(newAddressEntry.id);
          onSelectAddress(newAddressEntry.address);
        }
      }
    } catch (error) {
      console.error("Error adding address:", error);
      Alert.alert("Error", "Failed to add address");
    }
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    onSelectAddress(address.address);
    setModalVisible(false);
  };

  const handleSetDefault = async (addressId: string) => {
    await setDefault(addressId);

    // Update the selected address if we set a new default
    const updatedDefaultAddress = addresses.find(
      (addr) => addr.id === addressId,
    );
    if (updatedDefaultAddress) {
      setSelectedAddressId(updatedDefaultAddress.id);
      onSelectAddress(updatedDefaultAddress.address);
    }

    // Refresh addresses to get updated default status
    await fetchAddresses();
  };

  const handleRemoveAddress = async (addressId: string) => {
    await removeAddress(addressId);

    // If we removed the selected address, select the new default address
    if (addressId === selectedAddressId) {
      await fetchAddresses();
      const newDefault = addresses.find((addr) => addr.is_default);

      if (newDefault) {
        setSelectedAddressId(newDefault.id);
        onSelectAddress(newDefault.address);
      } else if (addresses.length > 0) {
        // If no default, select the first address
        setSelectedAddressId(addresses[0].id);
        onSelectAddress(addresses[0].address);
      } else {
        // If no addresses left, clear the selection
        setSelectedAddressId(null);
        onSelectAddress("");
      }
    }
  };

  // Filter addresses based on search query
  const filteredAddresses = addresses.filter((address) =>
    address.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Get the display address (either the selected address or the current location)
  const displayAddress =
    currentAddress ||
    addresses.find((addr) => addr.id === selectedAddressId)?.address ||
    currentLocation ||
    "Select an address";

  const renderAddressList = () => {
    if (isLoadingAddresses) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5A5F" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      );
    }

    if (addressesError) {
      return (
        <View style={styles.errorContainer}>
          <AlertCircle size={24} color="#EF4444" />
          <Text style={styles.errorText}>{addressesError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAddresses}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredAddresses.length === 0 && !searchQuery) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No saved addresses yet</Text>
          <Text style={styles.emptySubtext}>Add an address to get started</Text>
        </View>
      );
    }

    if (filteredAddresses.length === 0 && searchQuery) {
      return (
        <View style={styles.emptySearchContainer}>
          <Text style={styles.emptyText}>No matching addresses found</Text>
          <TouchableOpacity
            style={styles.addNewAddressButton}
            onPress={() => {
              setNewAddress(searchQuery);
              setCustomAddressMode(true);
            }}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addNewAddressButtonText}>
              Add "{searchQuery}" as a new address
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredAddresses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AddressItem
            address={item}
            selected={item.id === selectedAddressId}
            onSelect={() => handleSelectAddress(item)}
            onSetDefault={() => handleSetDefault(item.id)}
            onRemove={() => handleRemoveAddress(item.id)}
          />
        )}
        style={styles.addressList}
      />
    );
  };

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {showLabel && <Text style={styles.label}>Delivery Address</Text>}

      <TouchableOpacity
        style={[styles.addressButton, compact && styles.compactAddressButton]}
        onPress={() => setModalVisible(true)}
      >
        <MapPin size={compact ? 20 : 24} color="#FF5A5F" />
        <Text
          style={[styles.addressText, compact && styles.compactAddressText]}
          numberOfLines={1}
        >
          {displayAddress}
        </Text>
        <ChevronRight size={compact ? 18 : 20} color="#9CA3AF" />
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
              isLargeScreen && styles.largeScreenModalContainer,
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery Address</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <AddressSearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onClear={() => setSearchQuery("")}
            />

            <CurrentLocationButton
              loading={locationLoading}
              error={locationError}
              permissionDenied={locationPermissionDenied}
              onPress={handleGetCurrentLocation}
            />

            {customAddressMode ? (
              <View style={styles.customAddressContainer}>
                <TextInput
                  style={styles.customAddressInput}
                  value={newAddress}
                  onChangeText={setNewAddress}
                  placeholder="Enter your address"
                  autoFocus
                />
                <View style={styles.customAddressButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setCustomAddressMode(false);
                      setNewAddress("");
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleAddAddress}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Saved Addresses</Text>
                {renderAddressList()}

                <TouchableOpacity
                  style={styles.addAddressButton}
                  onPress={() => setCustomAddressMode(true)}
                >
                  <Plus size={20} color="#FF5A5F" />
                  <Text style={styles.addAddressButtonText}>
                    Add New Address
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  compactContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 8,
  },
  addressButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  compactAddressButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    marginBottom: 0,
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 8,
  },
  compactAddressText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: "80%",
  },
  largeScreenModalContainer: {
    bottom: "auto",
    width: 500,
    maxWidth: "90%",
    borderRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 16,
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  errorText: {
    marginVertical: 8,
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
  },
  addressList: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginVertical: 8,
  },
  emptySearchContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
  },
  addNewAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF5A5F",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  addNewAddressButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  customAddressContainer: {
    marginTop: 16,
  },
  customAddressInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 16,
  },
  customAddressButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  saveButton: {
    backgroundColor: "#FF5A5F",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginTop: 16,
  },
  addAddressButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF5A5F",
    marginLeft: 8,
  },
});
