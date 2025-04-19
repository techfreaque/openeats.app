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
 * Seed script for development database
 * This creates sample data for development purposes
 */
async function seedDevDatabase(): Promise<void> {
  try {
    debugLogger("🌱 Running dev seeds...");

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

      // Check if the seed module has a dev function
      // It could be either a direct property or a default export with a dev property
      const seedFn =
        moduleSeed.dev ??
        (moduleSeed.default && typeof moduleSeed.default === "object"
          ? moduleSeed.default.dev
          : undefined);
      if (seedFn) {
        try {
          debugLogger(`🌱 [${moduleId}] Starting seed...`);
          const startTime = Date.now();

          await seedFn();

          const duration = Date.now() - startTime;
          debugLogger(
            `✅ [${moduleId}] Seed completed successfully (${duration}ms)`,
          );
          totalSeedsRun++;
        } catch (error) {
          errorLogger(`❌ [${moduleId}] Seed failed:`, error);
          totalSeedsFailed++;
        }
      } else {
        debugLogger(`⚠️ [${moduleId}] No dev seed function found, skipping`);
        totalSeedsSkipped++;
      }
    }

    // Log summary
    debugLogger(`
📊 Seed Summary:
  ✅ Completed: ${totalSeedsRun}
  ⚠️ Skipped: ${totalSeedsSkipped}
  ❌ Failed: ${totalSeedsFailed}
`);

    debugLogger("✅ All dev seeds completed!");
  } catch (error) {
    errorLogger("❌ Error in seed process:", error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

void seedDevDatabase();
