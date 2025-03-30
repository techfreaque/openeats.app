import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import type { PaymentMethod } from "../../types";
import { generateId } from "../utils";

// Similar to useAddresses, we'll use AsyncStorage for payment methods
// In a full implementation, this would use API endpoints for user payment methods

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const paymentMethodsString = await AsyncStorage.getItem(
        "user_payment_methods",
      );
      if (paymentMethodsString) {
        const savedPaymentMethods = JSON.parse(
          paymentMethodsString,
        ) as PaymentMethod[];
        setPaymentMethods(savedPaymentMethods);
      } else {
        setPaymentMethods([]);
      }
    } catch (err) {
      console.error("Error fetching payment methods:", err);
      setError("Failed to load payment methods. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const addPaymentMethod = async (
    paymentMethod: Omit<PaymentMethod, "id" | "synced">,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const newPaymentMethod = {
        ...paymentMethod,
        id: generateId(),
        synced: false,
      };
      const updatedPaymentMethods = [...paymentMethods, newPaymentMethod];
      await AsyncStorage.setItem(
        "user_payment_methods",
        JSON.stringify(updatedPaymentMethods),
      );
      setPaymentMethods(updatedPaymentMethods);
      return true;
    } catch (err) {
      console.error("Error adding payment method:", err);
      setError("Failed to add payment method. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    try {
      const updatedPaymentMethods = paymentMethods.map((method) => ({
        ...method,
        is_default: method.id === id,
      }));
      await AsyncStorage.setItem(
        "user_payment_methods",
        JSON.stringify(updatedPaymentMethods),
      );
      setPaymentMethods(updatedPaymentMethods);
      return true;
    } catch (err) {
      console.error("Error setting default payment method:", err);
      setError("Failed to set default payment method. Please try again.");
      return false;
    }
  };

  const removePaymentMethod = async (id: string) => {
    try {
      const updatedPaymentMethods = paymentMethods.filter(
        (method) => method.id !== id,
      );
      await AsyncStorage.setItem(
        "user_payment_methods",
        JSON.stringify(updatedPaymentMethods),
      );
      setPaymentMethods(updatedPaymentMethods);
      return true;
    } catch (err) {
      console.error("Error deleting payment method:", err);
      setError("Failed to delete payment method. Please try again.");
      return false;
    }
  };

  return {
    paymentMethods,
    defaultPaymentMethod: paymentMethods.find((method) => method.is_default),
    isLoading,
    error,
    addPaymentMethod,
    setDefault: setDefaultPaymentMethod,
    removePaymentMethod,
    fetchPaymentMethods,
  };
}
