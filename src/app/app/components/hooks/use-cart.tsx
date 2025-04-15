"use client";

import { useEffect } from "react";

import { useCart as useApiCart } from "@/app/api/v1/cart/hooks";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "@/translations";

/**
 * Re-export the cart hook from the API implementation
 * This maintains backward compatibility with existing code
 * while using the new zustand-based implementation
 */
export type { CartItem } from "@/app/api/v1/cart/hooks";

/**
 * Hook for using the cart
 * This is a wrapper around the API cart hook to maintain backward compatibility
 */
export function useCart() {
  const { t } = useTranslation();
  const {
    items,
    restaurantId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isLoading,
  } = useApiCart();

  useEffect(() => {
    if (items.length === 0 && restaurantId === null) {
      const savedCart = localStorage.getItem("openeats-cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart.items && parsedCart.items.length > 0) {
          toast({
            title: t("cart.cleared", "Cart cleared"),
            description: t(
              "cart.clearedDescription",
              "Your cart has been cleared",
            ),
          });
        }
      }
    }
  }, [items.length, restaurantId, t]);

  const getSubtotal = (): number => {
    return items.reduce(
      (sum, item) => sum + (item.menuItem.price || 0) * item.quantity,
      0,
    );
  };

  const getDeliveryFee = (): number => {
    // Mock delivery fee calculation
    return items.length > 0 ? 2.99 : 0;
  };

  const getServiceFee = (): number => {
    // Mock service fee calculation
    const subtotal = getSubtotal();
    return subtotal > 0 ? 1.99 : 0;
  };

  const getTax = (): number => {
    // Mock tax calculation (8.25%)
    return getSubtotal() * 0.0825;
  };

  const getTotal = (): number => {
    return getSubtotal() + getDeliveryFee() + getServiceFee() + getTax();
  };

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return {
    items,
    restaurantId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getTotal,
    getDeliveryFee,
    getServiceFee,
    getTax,
    itemCount,
    isLoading,
  };
}
