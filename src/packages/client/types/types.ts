import type { Prisma } from "@prisma/client";

type Empty = Record<string, never>;

// Prisma types
export type DBUser = Prisma.UserGetPayload<Empty>;
export type DBUserRole = Prisma.UserRoleGetPayload<Empty>;
export type DBAddress = Prisma.AddressGetPayload<Empty>;
export type DBDriver = Prisma.DriverGetPayload<Empty>;
export type DBEarning = Prisma.EarningGetPayload<Empty>;
export type PasswordReset = Prisma.PasswordResetGetPayload<Empty>;
export type DBRestaurant = Prisma.PartnerGetPayload<Empty>;
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
