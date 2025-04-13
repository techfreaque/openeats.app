import { db } from "next-vibe/server/db";
import { registerSeed } from "next-vibe/server/db/seed-manager";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { partners } from "./db";
import { createRestaurantSeed } from "./seed-helpers";

/**
 * Development seed function for restaurant module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding restaurant data for development environment");

  const sampleRestaurants = [
    createRestaurantSeed({
      name: "Pizza Express",
      description: "Best pizza in town",
    }),
    createRestaurantSeed({
      name: "Burger Joint",
      description: "Juicy burgers served fresh",
    }),
    createRestaurantSeed({
      name: "Sushi Paradise",
      description: "Finest sushi in town",
    }),
  ];

  const insertedRestaurants = await db
    .insert(partners)
    .values(sampleRestaurants)
    .onConflictDoNothing()
    .returning({ id: partners.id });

  debugLogger(`✅ Inserted ${insertedRestaurants.length} development restaurants`);
}

/**
 * Test seed function for restaurant module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding restaurant data for test environment");

  const testRestaurant = createRestaurantSeed({
    name: "Test Restaurant",
    email: "test@restaurant.com",
    isActive: true,
  });

  await db.insert(partners).values(testRestaurant).onConflictDoNothing();

  debugLogger("✅ Inserted test restaurant");
}

/**
 * Production seed function for restaurant module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding restaurant data for production environment");

  const essentialRestaurant = createRestaurantSeed({
    name: "Example Restaurant",
    email: "info@example-restaurant.com",
    isActive: true,
    description: "An example restaurant for demonstration purposes",
  });

  await db.insert(partners).values(essentialRestaurant).onConflictDoNothing();

  debugLogger("✅ Inserted essential production restaurant");
}

// Register seeds with the seed manager
registerSeed("restaurant", {
  dev: devSeed,
  test: testSeed,
  prod: prodSeed,
});
