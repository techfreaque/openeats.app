import fs from "fs";
import path from "path";

import { debugLogger, errorLogger } from "../../shared/utils/logger";
import { closeDatabase } from ".";

export type SeedFn = () => Promise<void>;
export interface EnvironmentSeeds {
  dev?: SeedFn;
  test?: SeedFn;
  prod?: SeedFn;
}

// Registry for all seed functions
const seedRegistry: Record<string, EnvironmentSeeds> = {};

/**
 * Registers seed functions for a module
 * This can still be used for manual registration if needed
 */
export function registerSeed(moduleId: string, seeds: EnvironmentSeeds): void {
  seedRegistry[moduleId] = seeds;
}

/**
 * Find all seed files in the project
 * Looks for files named *.seeds.ts or *.seed.ts
 */
async function discoverSeedFiles(): Promise<void> {
  debugLogger("🔍 Discovering seed files...");

  // Start from the project root
  const projectRoot = process.cwd();
  const apiRoot = path.join(projectRoot, "src", "app", "api");

  // Find all seed files
  const seedFiles = findSeedFiles(apiRoot);

  debugLogger(`Found ${seedFiles.length} seed files`);

  // Import and register each seed file
  for (const seedFile of seedFiles) {
    try {
      // Convert to module path format
      const modulePath = seedFile
        .replace(projectRoot, "")
        .replace(/\\/g, "/")
        .replace(/^\//, "")
        .replace(/\.(ts|js)$/, "");

      // Dynamic import of the seed file
      const fullPath = path.join(projectRoot, modulePath);

      debugLogger(`Importing seed file: ${fullPath}`);

      // This will execute the file which should call registerSeed
      await import(fullPath);
    } catch (error) {
      errorLogger(`Error importing seed file ${seedFile}:`, error);
    }
  }
}

/**
 * Find all seed files in a directory and its subdirectories
 */
function findSeedFiles(dir: string): string[] {
  const seedFiles: string[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively search subdirectories
      seedFiles.push(...findSeedFiles(fullPath));
    } else if (
      (entry.name.endsWith(".seed.ts") || entry.name.endsWith(".seeds.ts")) &&
      !entry.name.includes(".test.") &&
      !entry.name.includes(".spec.")
    ) {
      seedFiles.push(fullPath);
    }
  }

  return seedFiles;
}

/**
 * Run all registered seed functions for the specified environment
 */
export async function runSeeds(
  environment: keyof EnvironmentSeeds,
): Promise<void> {
  // First discover and load seed files
  await discoverSeedFiles();

  debugLogger(`🌱 Running ${environment} seeds...`);

  for (const [moduleId, seeds] of Object.entries(seedRegistry)) {
    const seedFn = seeds[environment];
    if (seedFn) {
      debugLogger(`Seeding ${moduleId}...`);
      try {
        await seedFn();
      } catch (error) {
        errorLogger(`Error seeding ${moduleId}:`, error);
        throw error;
      }
    }
  }

  debugLogger(`✅ ${environment} seeds completed successfully!`);
}

/**
 * Main seed execution function
 */
export async function seedDatabase(
  environment: keyof EnvironmentSeeds = "dev",
): Promise<void> {
  try {
    await runSeeds(environment);
  } catch (error) {
    errorLogger("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}
