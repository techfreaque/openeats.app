/**
 * Restaurant seeds
 * Provides seed data for restaurant-related tables
 */

import { db } from "next-vibe/server/db";
import { debugLogger } from "next-vibe/shared/utils/logger";

import type { NewPartner } from "./db";
import { partners } from "./db";

/**
 * Helper function to create restaurant seed data
 */
function createRestaurantSeed(overrides?: Partial<NewPartner>): NewPartner {
  return {
    name: `Restaurant ${Math.floor(Math.random() * 1000)}`,
    description: `A delicious restaurant with amazing food and great service.`,
    email: `restaurant${Math.floor(Math.random() * 1000)}@example.com`,
    phone: `+1${Math.floor(Math.random() * 10_000_000_000)}`,
    street: "Main Street",
    streetNumber: `${Math.floor(Math.random() * 100)}`,
    zip: "10001",
    city: "New York",
    country: "DE",
    latitude: "40.7128",
    longitude: "-74.0060",
    currency: "EUR",
    isActive: true,
    isOpen: true,
    imageUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/300/200`,
    rating: "4.5",
    ratingRecent: "4.7",
    ratingCount: "120",
    deliveryRadius: "5",
    deliveryFee: "2.99",
    minimumOrderAmount: "10",
    ...overrides,
  };
}

/**
 * Development seed function for restaurant module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding restaurant data for development environment");
  debugLogger("Creating development restaurants...");

  const devRestaurants = [
    createRestaurantSeed({
      name: "Pizza Palace",
      description: "Best pizza in town",
      rating: "4.8",
      minimumOrderAmount: "15",
      email: "pizza@example.com",
    }),
    createRestaurantSeed({
      name: "Burger Heaven",
      description: "Juicy burgers and crispy fries",
      rating: "4.6",
      minimumOrderAmount: "12",
      email: "burgers@example.com",
    }),
    createRestaurantSeed({
      name: "Sushi World",
      description: "Fresh sushi and Japanese cuisine",
      rating: "4.9",
      minimumOrderAmount: "20",
      email: "sushi@example.com",
    }),
    createRestaurantSeed({
      name: "Taco Time",
      description: "Authentic Mexican tacos",
      rating: "4.5",
      minimumOrderAmount: "10",
      email: "tacos@example.com",
    }),
    // Additional restaurants from restaurant.seed.ts
    createRestaurantSeed({
      name: "Pizza Express",
      description: "Best pizza in town",
      email: "express@example.com",
    }),
    createRestaurantSeed({
      name: "Burger Joint",
      description: "Juicy burgers served fresh",
      email: "joint@example.com",
    }),
    createRestaurantSeed({
      name: "Sushi Paradise",
      description: "Finest sushi in town",
      email: "paradise@example.com",
    }),
  ];

  try {
    // Use insert with onConflictDoNothing since there's no unique constraint for upsert
    const insertedRestaurants = await db
      .insert(partners)
      .values(devRestaurants)
      .onConflictDoNothing()
      .returning({ id: partners.id });

    debugLogger(
      `✅ Inserted ${insertedRestaurants.length} development restaurants`,
    );

    // Log each restaurant that was inserted
    insertedRestaurants.forEach((restaurant, index) => {
      debugLogger(`Restaurant ${index + 1}: ID ${restaurant.id}`);
    });
  } catch (error) {
    debugLogger(
      `❌ Error inserting development restaurants: ${(error as Error).message}`,
    );
    throw error;
  }
}

/**
 * Test seed function for restaurant module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding restaurant data for test environment");

  const testRestaurants = [
    createRestaurantSeed({
      name: "Test Restaurant 1",
      rating: "4.0",
      minimumOrderAmount: "10",
      email: "test1@restaurant.com",
    }),
    createRestaurantSeed({
      name: "Test Restaurant 2",
      rating: "4.5",
      minimumOrderAmount: "15",
      email: "test2@restaurant.com",
    }),
    // Additional test restaurant from restaurant.seed.ts
    createRestaurantSeed({
      name: "Test Restaurant",
      email: "test@restaurant.com",
      isActive: true,
    }),
  ];

  try {
    // Use insert with onConflictDoNothing since there's no unique constraint for upsert
    const insertedTestRestaurants = await db
      .insert(partners)
      .values(testRestaurants)
      .onConflictDoNothing()
      .returning({ id: partners.id });

    debugLogger(
      `✅ Inserted ${insertedTestRestaurants.length} test restaurants`,
    );

    // Log each restaurant that was inserted
    insertedTestRestaurants.forEach((restaurant, index) => {
      debugLogger(`Test restaurant ${index + 1}: ID ${restaurant.id}`);
    });
  } catch (error) {
    debugLogger(
      `❌ Error inserting test restaurants: ${(error as Error).message}`,
    );
    throw error;
  }
}

/**
 * Production seed function for restaurant module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding restaurant data for production environment");

  const essentialRestaurants = [
    createRestaurantSeed({
      name: "Featured Restaurant",
      description: "Our featured restaurant partner",
      rating: "5.0",
      minimumOrderAmount: "10",
      isActive: true,
      email: "featured@restaurant.com",
    }),
    // Additional production restaurant from restaurant.seed.ts
    createRestaurantSeed({
      name: "Example Restaurant",
      email: "info@example-restaurant.com",
      isActive: true,
      description: "An example restaurant for demonstration purposes",
    }),
  ];

  try {
    // Use insert with onConflictDoNothing since there's no unique constraint for upsert
    const insertedProdRestaurants = await db
      .insert(partners)
      .values(essentialRestaurants)
      .onConflictDoNothing()
      .returning({ id: partners.id });

    debugLogger(
      `✅ Inserted ${insertedProdRestaurants.length} essential production restaurants`,
    );

    // Log each restaurant that was inserted
    insertedProdRestaurants.forEach((restaurant, index) => {
      debugLogger(`Production restaurant ${index + 1}: ID ${restaurant.id}`);
    });
  } catch (error) {
    debugLogger(
      `❌ Error inserting production restaurants: ${(error as Error).message}`,
    );
    throw error;
  }
}

// Export the seed functions directly
export const dev = devSeed;
export const test = testSeed;
export const prod = prodSeed;

// Also export as default for compatibility
const seeds = {
  dev,
  test,
  prod,
};

// Initialize seeds in development automatically
debugLogger("🌱 Restaurant seeds ready for initialization");

export default seeds;
