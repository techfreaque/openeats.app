import { db } from "next-vibe/server/db";
import { registerSeed } from "next-vibe/server/db/seed-manager";
import { debugLogger } from "next-vibe/shared/utils/logger";

import type { NewTemplate } from "./db";
import { templates } from "./db";

/**
 * Helper function to create template seed data
 */
function createTemplateSeed(overrides?: Partial<NewTemplate>): NewTemplate {
  return {
    someValue: `Template value ${Math.floor(Math.random() * 1000)}`,
    ...overrides,
  };
}

/**
 * Development seed function for template module
 */
async function devSeed(): Promise<void> {
  debugLogger("🌱 Seeding template data for development environment");

  // Create sample templates for development
  const devTemplates = [
    createTemplateSeed({ someValue: "Development Template 1" }),
    createTemplateSeed({ someValue: "Development Template 2" }),
    createTemplateSeed({ someValue: "Development Template 3" }),
    createTemplateSeed({ someValue: "Development Template 4" }),
  ];

  // Insert templates and get their IDs
  const insertedTemplates = await db
    .insert(templates)
    .values(devTemplates)
    .onConflictDoNothing()
    .returning({ id: templates.id });

  debugLogger(`✅ Inserted ${insertedTemplates.length} development templates`);
}

/**
 * Test seed function for template module
 */
async function testSeed(): Promise<void> {
  debugLogger("🌱 Seeding template data for test environment");

  // Create test templates with predictable values for testing
  const testTemplates = [
    createTemplateSeed({ someValue: "Test Template 1" }),
    createTemplateSeed({ someValue: "Test Template 2" }),
  ];

  await db.insert(templates).values(testTemplates).onConflictDoNothing();

  debugLogger("✅ Inserted test templates");
}

/**
 * Production seed function for template module
 */
async function prodSeed(): Promise<void> {
  debugLogger("🌱 Seeding template data for production environment");

  // For production, only seed essential templates if needed
  const essentialTemplates = [
    createTemplateSeed({
      someValue: "Essential Production Template",
    }),
  ];

  await db.insert(templates).values(essentialTemplates).onConflictDoNothing();

  debugLogger("✅ Inserted essential production templates");
}

// Register seeds with the seed manager
// Since our file ends with .seeds.ts, it will be auto-discovered
registerSeed("template-api", {
  dev: devSeed,
  test: testSeed,
  prod: prodSeed,
});
