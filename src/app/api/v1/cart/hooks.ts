import { useApiQuery } from "next-vibe/client/hooks/query";
import { useApiQueryForm } from "next-vibe/client/hooks/query-form";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";

import endpoints from "./definition";

export interface CartItemType {
  id: string;
  menuItemId: string;
  quantity: number;
  restaurantId: string;
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type CartResponseType = CartItemType[];

export type UseCartReturn = ReturnType<typeof useCart>;

/**
 * Hook for fetching cart items
 * @returns Cart items query result
 */
export function useCart(): ReturnType<
  typeof useApiQuery<UndefinedType, CartResponseType, UndefinedType>
> {
  return useApiQuery<UndefinedType, CartResponseType, UndefinedType>(
    endpoints.GET,
    undefined,
    undefined,
  );
}

export interface CartItemCreateType {
  menuItemId: string;
  quantity: number;
  restaurantId: string;
}

export type UseAddToCartReturn = ReturnType<typeof useAddToCart>;

/**
 * Hook for adding items to cart
 * @returns Add to cart mutation form
 */
export function useAddToCart(): ReturnType<
  typeof useApiQueryForm<CartItemCreateType, CartItemType, UndefinedType>
> {
  return useApiQueryForm<CartItemCreateType, CartItemType, UndefinedType>(
    endpoints.POST,
    undefined,
  );
}

export interface CartItemUpdateType {
  id: string;
  quantity: number;
}

export type UseUpdateCartItemReturn = ReturnType<typeof useUpdateCartItem>;

/**
 * Hook for updating cart items
 * @returns Update cart item mutation form
 */
export function useUpdateCartItem(): ReturnType<
  typeof useApiQueryForm<CartItemUpdateType, CartItemType, UndefinedType>
> {
  return useApiQueryForm<CartItemUpdateType, CartItemType, UndefinedType>(
    endpoints.PUT,
    undefined,
  );
}
