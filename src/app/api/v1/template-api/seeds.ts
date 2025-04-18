import { sql } from "drizzle-orm";
import { db } from "next-vibe/server/db";
import { debugLogger } from "next-vibe/shared/utils/logger";
import { v4 as uuidv4 } from "uuid";

import type { NewTemplate } from "./db";
import { templates } from "./db";



/**
 * Development seed function for template module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding template data for development environment");

  // Create sample templates for development
  const devTemplates = [
    {
      id: uuidv4(),
      someValue: "Development Template 1",
    },
    {
      id: uuidv4(),
      someValue: "Development Template 2",
    },
    {
      id: uuidv4(),
      someValue: "Development Template 3",
    },
    {
      id: uuidv4(),
      someValue: "Development Template 4",
    },
  ];

  // Check if the templates table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    const insertedTemplates = await db
      .insert(templates)
      .values(devTemplates)
      .onConflictDoUpdate({
        target: templates.someValue,
        set: {
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: templates.id });

    debugLogger(`✅ Inserted ${insertedTemplates.length} development templates`);
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if ((error as any)?.code === '42P01') { // relation does not exist
      debugLogger("⚠️ Templates table does not exist yet, skipping template seeds");
    } else {
      // Re-throw other errors
      throw error;
    }
  }
}

/**
 * Test seed function for template module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding template data for test environment");

  // Create test templates with predictable values for testing
  const testTemplates = [
    {
      id: uuidv4(),
      someValue: "Test Template 1",
    },
    {
      id: uuidv4(),
      someValue: "Test Template 2",
    },
  ];

  // Check if the templates table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    await db
      .insert(templates)
      .values(testTemplates)
      .onConflictDoUpdate({
        target: templates.someValue,
        set: {
          updatedAt: sql`now()`,
        },
      });

    debugLogger("✅ Inserted test templates");
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if ((error as any)?.code === '42P01') { // relation does not exist
      debugLogger("⚠️ Templates table does not exist yet, skipping template seeds");
    } else {
      // Re-throw other errors
      throw error;
    }
  }
}

/**
 * Production seed function for template module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding template data for production environment");

  // For production, only seed essential templates if needed
  const essentialTemplates = [
    {
      id: uuidv4(),
      someValue: "Essential Production Template",
    },
  ];

  // Check if the templates table exists before trying to insert
  try {
    // Use upsert operation (insert or update)
    await db
      .insert(templates)
      .values(essentialTemplates)
      .onConflictDoUpdate({
        target: templates.someValue,
        set: {
          updatedAt: sql`now()`,
        },
      });

    debugLogger("✅ Inserted essential production templates");
  } catch (error) {
    // If the table doesn't exist, log a warning and continue
    if ((error as any)?.code === '42P01') { // relation does not exist
      debugLogger("⚠️ Templates table does not exist yet, skipping template seeds");
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
