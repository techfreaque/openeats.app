import { db } from "next-vibe/server/db";
import { registerSeed } from "next-vibe/server/db/seed-manager";
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
    phone: `+1${Math.floor(Math.random() * 10000000000)}`,
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

  const devRestaurants = [
    createRestaurantSeed({ 
      name: "Pizza Palace", 
      description: "Best pizza in town",
      rating: "4.8",
      minimumOrderAmount: "15"
    }),
    createRestaurantSeed({ 
      name: "Burger Heaven", 
      description: "Juicy burgers and crispy fries",
      rating: "4.6",
      minimumOrderAmount: "12"
    }),
    createRestaurantSeed({ 
      name: "Sushi World", 
      description: "Fresh sushi and Japanese cuisine",
      rating: "4.9",
      minimumOrderAmount: "20"
    }),
    createRestaurantSeed({ 
      name: "Taco Time", 
      description: "Authentic Mexican tacos",
      rating: "4.5",
      minimumOrderAmount: "10"
    }),
  ];

  const insertedRestaurants = await db
    .insert(partners)
    .values(devRestaurants)
    .onConflictDoNothing()
    .returning({ id: partners.id });

  debugLogger(`✅ Inserted ${insertedRestaurants.length} development restaurants`);
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
      minimumOrderAmount: "10" 
    }),
    createRestaurantSeed({ 
      name: "Test Restaurant 2",
      rating: "4.5",
      minimumOrderAmount: "15" 
    }),
  ];

  await db.insert(partners).values(testRestaurants).onConflictDoNothing();

  debugLogger("✅ Inserted test restaurants");
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
    }),
  ];

  await db.insert(partners).values(essentialRestaurants).onConflictDoNothing();

  debugLogger("✅ Inserted essential production restaurants");
}

registerSeed("restaurant", {
  dev: devSeed,
  test: testSeed,
  prod: prodSeed,
});
