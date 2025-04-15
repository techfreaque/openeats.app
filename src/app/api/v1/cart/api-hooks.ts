"use client";

/**
 * Cart API hooks for client-side usage
 * These hooks provide a convenient way to interact with the cart API
 */

import { useApiForm } from "next-vibe/client/hooks/mutation-form";
import { useApiQueryForm } from "next-vibe/client/hooks/query-form";
import type {
  ApiFormOptions,
  ApiQueryFormOptions,
} from "next-vibe/client/hooks/types";

import cartEndpoints from "./definition";
import type { CartItemCreateType, CartItemUpdateType } from "./schema";

/**
 * Hook for retrieving cart items
 * @param options - API query options
 * @returns API query result with cart items
 */
export const useGetCart = (options?: ApiQueryFormOptions<undefined>) => {
  return useApiQueryForm(cartEndpoints.GET, undefined, options);
};

/**
 * Hook for adding an item to the cart
 * @param options - API form options
 * @returns API form result for adding cart items
 */
export const useAddCartItem = (
  options?: ApiFormOptions<CartItemCreateType>,
) => {
  return useApiForm(cartEndpoints.POST, options);
};

/**
 * Hook for updating a cart item
 * @param options - API form options
 * @returns API form result for updating cart items
 */
export const useUpdateCartItem = (
  options?: ApiFormOptions<CartItemUpdateType>,
) => {
  return useApiForm(cartEndpoints.PUT, options);
};

/**
 * Hook for removing a cart item
 * @param options - API form options
 * @returns API form result for removing cart items
 */
export const useRemoveCartItem = (options?: ApiFormOptions<undefined>) => {
  return useApiForm(cartEndpoints.DELETE, options);
};
