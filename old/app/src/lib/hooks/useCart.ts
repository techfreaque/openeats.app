import { useCallback, useEffect, useState } from "react";

import type { CartItem } from "../../types";
import { cartApi, isApiAvailable } from "../api-client";

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCartItems = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try API first
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        const response = await cartApi.getCart();
        setCartItems(response.cartItems || response);
      } else {
        setError("API is unavailable.");
      }
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setError("Failed to load cart items");
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (item: Omit<CartItem, "id">) => {
    try {
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        // Format for API request
        await cartApi.addToCart({
          menuItemId: item.menu_item_id,
          restaurantId: item.restaurant_id,
          quantity: item.quantity,
        });
        await fetchCartItems(); // Refresh cart
      } else {
        setError("API is unavailable.");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error adding item to cart:", err);
      setError("Failed to add item to cart");
      return false;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        if (quantity <= 0) {
          await cartApi.removeCartItem(itemId);
        } else {
          await cartApi.updateCartItem(itemId, quantity);
        }
        await fetchCartItems();
      } else {
        setError("API is unavailable.");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error updating cart item quantity:", err);
      setError("Failed to update cart");
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        await cartApi.clearCart();
        setCartItems([]);
      } else {
        setError("API is unavailable.");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError("Failed to clear cart");
      return false;
    }
  };

  const getCartTotals = useCallback(
    (paymentMethod = "card") => {
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Apply fees based on payment method
      const deliveryFee = paymentMethod === "card" ? 2.99 : 0;
      const serviceFee = paymentMethod === "card" ? 1.99 : 0;
      const total = subtotal + deliveryFee + serviceFee;

      return { subtotal, deliveryFee, serviceFee, total };
    },
    [cartItems],
  );

  // Load cart items on initial render
  useEffect(() => {
    fetchCartItems();
  }, []);

  return {
    cartItems,
    isLoading,
    error,
    addItem,
    updateQuantity,
    clearCart,
    getCartTotals,
    refetch: fetchCartItems,
  };
}
