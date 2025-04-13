import type { NewPartner } from "./db";

/**
 * Creates a type-safe restaurant seed based on the schema
 */
export function createRestaurantSeed(
  overrides?: Partial<NewPartner>,
): NewPartner {
  return {
    name: `Restaurant ${Math.floor(Math.random() * 1000)}`,
    description: "A delicious restaurant with great food",
    email: `info@restaurant${Math.floor(Math.random() * 1000)}.com`,
    phone: `+1${Math.floor(Math.random() * 1000000000)
      .toString()
      .padStart(10, "0")}`,
    street: "Main Street",
    streetNumber: Math.floor(Math.random() * 100).toString(),
    city: "New York",
    zip: Math.floor(Math.random() * 10000)
      .toString()
      .padStart(5, "0"),
    country: "DE",
    latitude: (Math.random() * 90).toString(),
    longitude: (Math.random() * 180).toString(),
    currency: "EUR",
    isActive: true,
    isOpen: true,
    rating: "0",
    ratingRecent: "0",
    ratingCount: "0",
    deliveryRadius: "5",
    deliveryFee: "2.99",
    minimumOrderAmount: "10",
    imageUrl: `/placeholder-${Math.floor(Math.random() * 10)}.jpg`,
    ...overrides,
  };
}
