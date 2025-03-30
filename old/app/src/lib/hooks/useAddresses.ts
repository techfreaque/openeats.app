import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import type { Address } from "../../types";
import { generateId } from "../utils";

// For simplicity, we'll use AsyncStorage for addresses
// In a full implementation, this would use the API endpoints for user addresses

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const addressesString = await AsyncStorage.getItem("user_addresses");
      if (addressesString) {
        const savedAddresses = JSON.parse(addressesString) as Address[];
        setAddresses(savedAddresses);
      } else {
        setAddresses([]);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError("Failed to load addresses. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const addAddress = async (address: Omit<Address, "id" | "synced">) => {
    setIsLoading(true);
    setError(null);

    try {
      const newAddress = { ...address, id: generateId(), synced: false };
      const updatedAddresses = [...addresses, newAddress];
      await AsyncStorage.setItem(
        "user_addresses",
        JSON.stringify(updatedAddresses),
      );
      setAddresses(updatedAddresses);
      return true;
    } catch (err) {
      console.error("Error adding address:", err);
      setError("Failed to add address. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const makeDefaultAddress = async (id: string) => {
    try {
      const updatedAddresses = addresses.map((addr) => ({
        ...addr,
        is_default: addr.id === id,
      }));
      await AsyncStorage.setItem(
        "user_addresses",
        JSON.stringify(updatedAddresses),
      );
      setAddresses(updatedAddresses);
      return true;
    } catch (err) {
      console.error("Error setting default address:", err);
      setError("Failed to set default address. Please try again.");
      return false;
    }
  };

  const removeAddress = async (id: string) => {
    try {
      const updatedAddresses = addresses.filter((addr) => addr.id !== id);
      await AsyncStorage.setItem(
        "user_addresses",
        JSON.stringify(updatedAddresses),
      );
      setAddresses(updatedAddresses);
      return true;
    } catch (err) {
      console.error("Error deleting address:", err);
      setError("Failed to delete address. Please try again.");
      return false;
    }
  };

  return {
    addresses,
    isLoading,
    error,
    addAddress,
    setDefaultAddress: makeDefaultAddress,
    deleteAddress: removeAddress,
    refetch: fetchAddresses,
  };
}
