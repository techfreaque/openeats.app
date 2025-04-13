import { db } from "next-vibe/server/db";
import { registerSeed } from "next-vibe/server/db/seed-manager";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { userRole } from "../auth/roles/db";
import { partners } from "./db";
import { createRestaurantSeed } from "./seed-helpers";

// Sample restaurants with proper typing
async function devSeed(): Promise<void> {
  const sampleRestaurants = [
    createRestaurantSeed({
      name: "Pizza Express",
      description: "Best pizza in town",
      priceLevel: "2",
    }),
    createRestaurantSeed({
      name: "Burger Joint",
      description: "Juicy burgers served fresh",
      priceLevel: "1",
    }),
    createRestaurantSeed({
      name: "Sushi Paradise",
      description: "Finest sushi in town",
      priceLevel: "3",
    }),
  ];

  const insertedRestaurants = await db
    .insert(partners)
    .values(sampleRestaurants)
    .onConflictDoNothing()
    .returning({ id: partners.id });

  if (insertedRestaurants.length > 0) {
    const demoUser = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.email, "demo@example.com"),
    });

    if (demoUser) {
      const partnerAdminRoles = insertedRestaurants.map((restaurant) => ({
        userId: demoUser.id,
        partnerId: restaurant.id,
        role: UserRoleValue.PARTNER_ADMIN,
      }));

      await db.insert(userRole).values(partnerAdminRoles).onConflictDoNothing();
    }
  }
}

async function testSeed(): Promise<void> {
  const testRestaurant = createRestaurantSeed({
    name: "Test Restaurant",
    email: "test@restaurant.com",
    published: true,
  });

  await db.insert(partners).values(testRestaurant).onConflictDoNothing();
}

async function prodSeed(): Promise<void> {
  const essentialRestaurant = createRestaurantSeed({
    name: "Example Restaurant",
    email: "info@example-restaurant.com",
    published: true,
    description: "An example restaurant for demonstration purposes",
  });

  await db.insert(partners).values(essentialRestaurant).onConflictDoNothing();
}

// Register seeds with the seed manager
registerSeed("restaurants", {
  dev: devSeed,
  test: testSeed,
  prod: prodSeed,
});
