import type { ApiHandlerCallBackFunctionType } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";

import { db } from "../../db";
import type { CartResponseType, CartUpdateType } from "./schema";

export const getCart: ApiHandlerCallBackFunctionType<
  UndefinedType,
  CartResponseType,
  UndefinedType
> = async ({ user }) => {
  const cart = await db.cartItem.findMany({
    where: { userId: user.id },
    select: cartItemSelect,
  });
  return {
    success: true,
    data: cart as CartResponseType,
  };
};

export const updateCart: ApiHandlerCallBackFunctionType<
  CartUpdateType,
  CartResponseType,
  UndefinedType
> = async ({ data, user }) => {
  const cartItems: CartResponseType = [];
  await Promise.all(
    data.map(async (item) => {
      if (item.quantity <= 0) {
        if (!item.id) {
          throw new Error("Item ID is required to remove from cart");
        }
        await db.cartItem.delete({
          where: { id: item.id },
        });
        return;
      }
      if (!item.id) {
        cartItems.push(
          await db.cartItem.create({
            data: {
              menuItemId: item.menuItemId,
              restaurantId: item.restaurantId,
              userId: user.id,
              quantity: item.quantity,
            },
            select: cartItemSelect,
          }),
        );
        return;
      }
      cartItems.push(
        await db.cartItem.update({
          where: {
            id: item.id,
            menuItem: {
              published: true,
            },
          },
          data: {
            quantity: item.quantity,
          },
          select: cartItemSelect,
        }),
      );
    }),
  );

  return {
    success: true,
    data: cartItems,
  };
};

const cartItemSelect = {
  id: true,
  quantity: true,
  menuItem: {
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      taxPercent: true,
      image: true,
      restaurantId: true,
      published: true,
      availableFrom: true,
      availableTo: true,
      isAvailable: true,
      updatedAt: true,
      createdAt: true,
      category: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  },
  restaurant: {
    select: {
      id: true,
      name: true,
      image: true,
    },
  },
  createdAt: true,
  updatedAt: true,
};
