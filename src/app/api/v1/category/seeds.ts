import { sql } from "drizzle-orm";
import { db } from "next-vibe/server/db";
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

  // Check if the categories table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    const insertedCategories = await db
      .insert(categories)
      .values(devCategories)
      .onConflictDoUpdate({
        target: categories.name,
        set: {
          description: sql`excluded.description`,
          imageUrl: sql`excluded.image_url`,
          published: sql`excluded.published`,
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: categories.id });

    debugLogger(
      `✅ Inserted ${insertedCategories.length} development categories`,
    );
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if (error?.code === "42P01") {
      // relation does not exist
      debugLogger(
        "⚠️ Categories table does not exist yet, skipping category seeds",
      );
    } else {
      // Re-throw other errors
      throw error;
    }
  }
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

  // Check if the categories table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    await db
      .insert(categories)
      .values(testCategories)
      .onConflictDoUpdate({
        target: categories.name,
        set: {
          description: sql`excluded.description`,
          imageUrl: sql`excluded.image_url`,
          published: sql`excluded.published`,
          updatedAt: sql`now()`,
        },
      });

    debugLogger("✅ Inserted test categories");
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if (error?.code === "42P01") {
      // relation does not exist
      debugLogger(
        "⚠️ Categories table does not exist yet, skipping category seeds",
      );
    } else {
      // Re-throw other errors
      throw error;
    }
  }
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

  // Check if the categories table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    await db
      .insert(categories)
      .values(essentialCategories)
      .onConflictDoUpdate({
        target: categories.name,
        set: {
          description: sql`excluded.description`,
          imageUrl: sql`excluded.image_url`,
          published: sql`excluded.published`,
          updatedAt: sql`now()`,
        },
      });

    debugLogger("✅ Inserted essential production categories");
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if (error?.code === "42P01") {
      // relation does not exist
      debugLogger(
        "⚠️ Categories table does not exist yet, skipping category seeds",
      );
    } else {
      // Re-throw other errors
      throw error;
    }
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

export default seeds;
