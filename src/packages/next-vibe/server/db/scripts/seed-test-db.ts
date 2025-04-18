import "dotenv/config";

import path from "node:path";

import { closeDatabase } from "next-vibe/server/db";
import type { EnvironmentSeeds } from "next-vibe/server/db/seed-manager";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

// Dynamically import the seeds to avoid path resolution issues
const seedsPath = path.resolve(process.cwd(), "src/app/api/generated/seeds.js");
let seeds: Record<string, EnvironmentSeeds> = {};
let setupSeeds: () => Record<string, EnvironmentSeeds>;

/**
 * Seed script for test database
 * This creates test data for testing environment
 */
export async function seedTestDatabase(): Promise<void> {
  try {
    debugLogger("🌱 Running test seeds...");

    // Dynamically import the seeds file
    const seedsModule = await import(`file://${seedsPath}`);
    seeds = seedsModule.seeds as Record<string, EnvironmentSeeds>;
    setupSeeds = seedsModule.setupSeeds as () => Record<
      string,
      EnvironmentSeeds
    >;

    // Make sure seeds are initialized
    setupSeeds();

    // Track seed statistics
    let totalSeedsRun = 0;
    let totalSeedsSkipped = 0;
    let totalSeedsFailed = 0;

    // Process each seed module
    for (const [moduleId, moduleSeed] of Object.entries(seeds)) {
      // Skip the circular reference to the generated seeds file
      if (moduleId === "generated") {
        totalSeedsSkipped++;
        continue;
      }

      const seedFn = moduleSeed.test;
      if (seedFn) {
        try {
          debugLogger(`🌱 [${moduleId}] Starting test seed...`);
          const startTime = Date.now();

          await seedFn();

          const duration = Date.now() - startTime;
          debugLogger(
            `✅ [${moduleId}] Test seed completed successfully (${duration}ms)`,
          );
          totalSeedsRun++;
        } catch (error) {
          errorLogger(`❌ [${moduleId}] Test seed failed:`, error);
          totalSeedsFailed++;
        }
      } else {
        debugLogger(`⚠️ [${moduleId}] No test seed function found, skipping`);
        totalSeedsSkipped++;
      }
    }

    // Log summary
    debugLogger(`
📊 Test Seed Summary:
  ✅ Completed: ${totalSeedsRun}
  ⚠️ Skipped: ${totalSeedsSkipped}
  ❌ Failed: ${totalSeedsFailed}
`);

    debugLogger("✅ All test seeds completed!");
  } catch (error) {
    errorLogger("❌ Error seeding database:", error);
    throw error;
  } finally {
    await closeDatabase();
  }
}
