import { db } from "next-vibe/server/db";
import { registerSeed } from "next-vibe/server/db/seed-manager";
import { debugLogger } from "next-vibe/shared/utils/logger";

import type { NewCategory } from "./db";
import { categories, insertCategorySchema } from "./db";

/**
 * Helper function to create category seed data
 */
function createCategorySeed(overrides?: Partial<NewCategory>): NewCategory {
  const baseData = {
    name: `Category ${Math.floor(Math.random() * 1000)}`,
    description: `A delicious category with amazing food options.`,
    imageUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/300/200`,
    published: true,
    ...overrides,
  };

  return insertCategorySchema.parse(baseData);
}

/**
 * Development seed function for category module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding category data for development environment");

  const devCategories = [
    createCategorySeed({
      name: "Pizza",
      description: "Delicious pizza options",
    }),
    createCategorySeed({
      name: "Burgers",
      description: "Juicy burgers and sides",
    }),
    createCategorySeed({
      name: "Sushi",
      description: "Fresh sushi and Japanese cuisine",
    }),
    createCategorySeed({
      name: "Mexican",
      description: "Authentic Mexican food",
    }),
    createCategorySeed({
      name: "Italian",
      description: "Classic Italian dishes",
    }),
    createCategorySeed({
      name: "Chinese",
      description: "Traditional Chinese cuisine",
    }),
  ];

  const insertedCategories = await db
    .insert(categories)
    .values(devCategories)
    .onConflictDoNothing()
    .returning({ id: categories.id });

  debugLogger(
    `✅ Inserted ${insertedCategories.length} development categories`,
  );
}

/**
 * Test seed function for category module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding category data for test environment");

  const testCategories = [
    createCategorySeed({
      name: "Test Category 1",
    }),
    createCategorySeed({
      name: "Test Category 2",
    }),
  ];

  await db.insert(categories).values(testCategories).onConflictDoNothing();

  debugLogger("✅ Inserted test categories");
}

/**
 * Production seed function for category module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding category data for production environment");

  const essentialCategories = [
    createCategorySeed({
      name: "Featured Category",
      description: "Our featured food category",
      published: true,
    }),
  ];

  await db.insert(categories).values(essentialCategories).onConflictDoNothing();

  debugLogger("✅ Inserted essential production categories");
}

registerSeed("category", {
  dev: devSeed,
  test: testSeed,
  prod: prodSeed,
});
