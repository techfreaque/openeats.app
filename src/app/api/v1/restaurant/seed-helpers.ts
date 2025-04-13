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
    published: true,
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
    countryId: "US",
    latitude: (Math.random() * 90).toString(),
    longitude: (Math.random() * 180).toString(),
    image: "/placeholder.svg",
    delivery: true,
    pickup: true,
    dineIn: Math.random() > 0.5,
    orderCount: 0,
    rating: 0,
    priceLevel: Math.floor(Math.random() * 3 + 1).toString(),
    isAvailable: true,
    isActive: true,
    isOpen: true,
    ...overrides,
  };
}
