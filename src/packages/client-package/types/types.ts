import type { Prisma } from "@prisma/client";
import type { z } from "zod";

import type {
  addressCreateSchema,
  addressResponseSchema,
  addressUpdateSchema,
  cartItemsResponseSchema,
  cartItemUpdateSchema,
  categoryCreateSchema,
  categoryResponseSchema,
  categoryUpdateSchema,
  countryResponseSchema,
  countryUpdateSchema,
  deliveryCreateSchema,
  deliveryResponseSchema,
  deliveryUpdateSchema,
  driverCreateSchema,
  driverPrivateResponseSchema,
  driverPublicResponseSchema,
  driverRatingCreateSchema,
  driverUpdateSchema,
  earningCreateSchema,
  earningResponseSchema,
  earningSearchSchema,
  earningsSummarySchema,
  earningUpdateSchema,
  languageCreateSchema,
  languageResponseSchema,
  languageUpdateSchema,
  minimalCountryResponseSchema,
  orderCreateSchema,
  orderItemResponseSchema,
  orderItemSchema,
  orderResponseSchema,
  orderUpdateSchema,
} from "@/client-package/schema/schemas";

export type DriverRatingCreateType = z.infer<typeof driverRatingCreateSchema>;
export type OrderItemType = z.infer<typeof orderItemSchema>;
export type OrderCreateType = z.infer<typeof orderCreateSchema>;
export type OrderUpdateType = z.infer<typeof orderUpdateSchema>;
export type OrderItemResponseType = z.input<typeof orderItemResponseSchema>;
export type OrderResponseType = z.input<typeof orderResponseSchema>;

export type LanguageCreateType = z.infer<typeof languageCreateSchema>;
export type LanguageUpdateType = z.infer<typeof languageUpdateSchema>;
export type LanguageResponseType = z.input<typeof languageResponseSchema>;
export type CountryUpdateType = z.infer<typeof countryUpdateSchema>;
export type CountryResponseType = z.input<typeof countryResponseSchema>;
export type MinimalCountryResponseType = z.input<
  typeof minimalCountryResponseSchema
>;
export type DriverCreateType = z.infer<typeof driverCreateSchema>;
export type DriverUpdateType = z.infer<typeof driverUpdateSchema>;
export type DriverPrivateResponseType = z.input<
  typeof driverPrivateResponseSchema
>;
export type DriverPublicResponseType = z.input<
  typeof driverPublicResponseSchema
>;
export type EarningCreateType = z.infer<typeof earningCreateSchema>;
export type EarningUpdateType = z.infer<typeof earningUpdateSchema>;
export type EarningResponseType = z.input<typeof earningResponseSchema>;
export type EarningSearchType = z.infer<typeof earningSearchSchema>;
export type EarningsSummaryType = z.infer<typeof earningsSummarySchema>;
export type DeliveryCreateType = z.infer<typeof deliveryCreateSchema>;
export type DeliveryUpdateType = z.infer<typeof deliveryUpdateSchema>;
export type DeliveryResponseType = z.input<typeof deliveryResponseSchema>;
export type CategoryCreateType = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateType = z.infer<typeof categoryUpdateSchema>;
export type CategoryResponseType = z.input<typeof categoryResponseSchema>;
export type CartItemUpdateType = z.infer<typeof cartItemUpdateSchema>;
export type CartItemsResponseType = z.input<typeof cartItemsResponseSchema>;
export type AddressCreateType = z.infer<typeof addressCreateSchema>;
export type AddressUpdateType = z.infer<typeof addressUpdateSchema>;
export type AddressResponseType = z.input<typeof addressResponseSchema>;

type Empty = Record<string, never>;

// Prisma types
export type DBUser = Prisma.UserGetPayload<Empty>;
export type DBUserRole = Prisma.UserRoleGetPayload<Empty>;
export type DBAddress = Prisma.AddressGetPayload<Empty>;
export type DBDriver = Prisma.DriverGetPayload<Empty>;
export type DBEarning = Prisma.EarningGetPayload<Empty>;
export type PasswordReset = Prisma.PasswordResetGetPayload<Empty>;
export type DBRestaurant = Prisma.RestaurantGetPayload<Empty>;
export type DBCategory = Prisma.CategoryGetPayload<Empty>;
export type DBOpeningTimes = Prisma.OpeningTimesGetPayload<Empty>;
export type DBCartItem = Prisma.CartItemGetPayload<Empty>;
export type DBMenuItem = Prisma.MenuItemGetPayload<Empty>;
export type DBOrder = Prisma.OrderGetPayload<Empty>;
export type DBOrderItem = Prisma.OrderItemGetPayload<Empty>;
export type DBDelivery = Prisma.DeliveryGetPayload<Empty>;
export type DBRestaurantRating = Prisma.RestaurantRatingGetPayload<Empty>;
export type DBDriverRating = Prisma.DriverRatingGetPayload<Empty>;
export type DBCountry = Prisma.CountryGetPayload<Empty>;
export type DBLanguages = Prisma.LanguagesGetPayload<Empty>;

// Extended types
export type DBCartItemExtended = Prisma.CartItemGetPayload<{
  select: {
    id: true;
    quantity: true;
    menuItem: {
      select: {
        id: true;
        name: true;
        description: true;
        price: true;
        taxPercent: true;
        image: true;
        restaurantId: true;
        category: {
          select: {
            id: true;
            name: true;
            image: true;
          };
        };
      };
    };
    restaurant: {
      select: {
        id: true;
        name: true;
        image: true;
      };
    };
  };
}>;

export type FullUserType = Prisma.UserGetPayload<{
  select: {
    id: true;
    firstName: true;
    lastName: true;
    email: true;
    password: true;
    imageUrl: true;
    userRoles: {
      select: {
        role: true;
        id: true;
        restaurantId: true;
      };
    };
    createdAt: true;
    updatedAt: true;
    addresses: {
      select: {
        id: true;
        userId: true;
        label: true;
        name: true;
        message: true;
        street: true;
        streetNumber: true;
        zip: true;
        city: true;
        phone: true;
        isDefault: true;
        country: {
          select: {
            code: true;
            name: true;
          };
        };
      };
    };
    cartItems: {
      select: {
        id: true;
        quantity: true;
        menuItem: {
          select: {
            id: true;
            name: true;
            description: true;
            price: true;
            taxPercent: true;
            image: true;
            published: true;
            availableFrom: true;
            availableTo: true;
            createdAt: true;
            updatedAt: true;
            category: {
              select: {
                id: true;
                name: true;
                image: true;
              };
            };
          };
        };
        restaurant: {
          select: {
            id: true;
            name: true;
            image: true;
          };
        };
      };
    };
  };
}>;

// prisma enums (cloned from prisma schema)
export enum OrderStatus {
  NEW = "NEW",
  PREPARING = "PREPARING",
  READY = "READY",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum DeliveryType {
  PICKUP = "PICKUP",
  DELIVERY = "DELIVERY",
}

export enum DeliveryStatus {
  ASSIGNED = "ASSIGNED",
  PICKED_UP = "PICKED_UP",
  DELIVERED = "DELIVERED",
}

export enum PaymentMethod {
  CARD = "CARD",
  CASH = "CASH",
}

export enum DatabaseProvider {
  SQLITE = "sqlite",
  POSTGRESQL = "postgresql",
  MYSQL = "mysql",
  MONGODB = "mongodb",
}
