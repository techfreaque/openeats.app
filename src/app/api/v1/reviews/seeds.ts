import { sql } from "drizzle-orm";
import { db } from "next-vibe/server/db";
import { debugLogger } from "next-vibe/shared/utils/logger";
import { v4 as uuidv4 } from "uuid";

import { reviews } from "./db";
import { users } from "../auth/me/users.db";
import { partners } from "../restaurant/db";

/**
 * Development seed function for reviews module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding reviews data for development environment");

  // First, get some user IDs and restaurant IDs to associate reviews with
  const userIds = await db.select({ id: users.id }).from(users).limit(3);
  const restaurantIds = await db.select({ id: partners.id }).from(partners).limit(3);

  // If no users or restaurants exist yet, log a warning and return
  if (userIds.length === 0 || restaurantIds.length === 0) {
    debugLogger("⚠️ No users or restaurants found to associate reviews with, skipping review seeds");
    return;
  }

  // Create sample reviews for development
  const devReviews = [
    {
      id: uuidv4(),
      userId: userIds[0]?.id,
      restaurantId: restaurantIds[0]?.id,
      restaurantRating: 5,
      restaurantComment: "Amazing food and service! Will definitely come back.",
      productReviews: JSON.stringify([
        {
          productId: uuidv4(),
          productName: "Margherita Pizza",
          rating: 5,
          comment: "Best pizza I've ever had!",
        },
        {
          productId: uuidv4(),
          productName: "Garlic Bread",
          rating: 4,
          comment: "Very tasty, but could use more garlic.",
        },
      ]),
    },
    {
      id: uuidv4(),
      userId: userIds.length > 1 ? userIds[1]?.id : userIds[0]?.id,
      restaurantId: restaurantIds[0]?.id,
      restaurantRating: 4,
      restaurantComment: "Good food, but delivery was a bit slow.",
      productReviews: JSON.stringify([
        {
          productId: uuidv4(),
          productName: "Pepperoni Pizza",
          rating: 4,
          comment: "Delicious but a bit too greasy.",
        },
      ]),
    },
    {
      id: uuidv4(),
      userId: userIds.length > 2 ? userIds[2]?.id : userIds[0]?.id,
      restaurantId: restaurantIds.length > 1 ? restaurantIds[1]?.id : restaurantIds[0]?.id,
      restaurantRating: 5,
      restaurantComment: "Excellent burgers and friendly staff!",
      productReviews: JSON.stringify([
        {
          productId: uuidv4(),
          productName: "Cheeseburger",
          rating: 5,
          comment: "Juicy and perfectly cooked.",
        },
        {
          productId: uuidv4(),
          productName: "French Fries",
          rating: 5,
          comment: "Crispy and well-seasoned.",
        },
      ]),
    },
  ].filter(review => review.userId !== undefined && review.restaurantId !== undefined) as any[];

  // Check if the reviews table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    const insertedReviews = await db
      .insert(reviews)
      .values(devReviews)
      .onConflictDoUpdate({
        target: reviews.id,
        set: {
          restaurantRating: sql`excluded."restaurantRating"`,
          restaurantComment: sql`excluded."restaurantComment"`,
          productReviews: sql`excluded."productReviews"`,
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: reviews.id });

    debugLogger(`✅ Inserted ${insertedReviews.length} development reviews`);
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if ((error as any)?.code === '42P01') { // relation does not exist
      debugLogger("⚠️ Reviews table does not exist yet, skipping review seeds");
    } else {
      // Re-throw other errors
      throw error;
    }
  }


}

/**
 * Test seed function for reviews module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding reviews data for test environment");

  // First, get some user IDs and restaurant IDs to associate reviews with
  const userIds = await db.select({ id: users.id }).from(users).limit(2);
  const restaurantIds = await db.select({ id: partners.id }).from(partners).limit(2);

  // If no users or restaurants exist yet, log a warning and return
  if (userIds.length === 0 || restaurantIds.length === 0) {
    debugLogger("⚠️ No users or restaurants found to associate reviews with, skipping review seeds");
    return;
  }

  // Create sample reviews for testing
  const testReviews = [
    {
      id: uuidv4(),
      userId: userIds[0]?.id,
      restaurantId: restaurantIds[0]?.id,
      restaurantRating: 4,
      restaurantComment: "Test review comment",
      productReviews: JSON.stringify([
        {
          productId: uuidv4(),
          productName: "Test Product 1",
          rating: 4,
          comment: "Test product review",
        },
      ]),
    },
    {
      id: uuidv4(),
      userId: userIds.length > 1 ? userIds[1]?.id : userIds[0]?.id,
      restaurantId: restaurantIds.length > 1 ? restaurantIds[1]?.id : restaurantIds[0]?.id,
      restaurantRating: 3,
      restaurantComment: "Another test review",
      productReviews: JSON.stringify([]),
    },
  ].filter(review => review.userId !== undefined && review.restaurantId !== undefined) as any[];

  // Check if the reviews table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    await db
      .insert(reviews)
      .values(testReviews)
      .onConflictDoUpdate({
        target: reviews.id,
        set: {
          restaurantRating: sql`excluded."restaurantRating"`,
          restaurantComment: sql`excluded."restaurantComment"`,
          productReviews: sql`excluded."productReviews"`,
          updatedAt: sql`now()`,
        },
      });

    debugLogger("✅ Inserted test reviews");
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if ((error as any)?.code === '42P01') { // relation does not exist
      debugLogger("⚠️ Reviews table does not exist yet, skipping review seeds");
    } else {
      // Re-throw other errors
      throw error;
    }
  }


}

/**
 * Production seed function for reviews module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding reviews data for production environment");

  // In production, we typically don't seed reviews
  // as they should be created by users themselves
  // This is just a placeholder for any essential reviews that might be needed

  // Add a dummy await to satisfy TypeScript
  await Promise.resolve();

  debugLogger("✅ No production reviews needed, skipping");
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
