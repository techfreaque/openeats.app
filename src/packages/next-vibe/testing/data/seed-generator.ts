/**
 * Seed data generator
 *
 * This module provides utilities for generating seed data for the database
 * using the data factory system.
 */

import { dataRepository } from "./repository";
import { DataVariation } from "./types";

/**
 * Options for seed data generation
 */
export interface SeedOptions {
  /**
   * Variation of data to generate
   * @default DataVariation.DEFAULT
   */
  variation?: DataVariation;

  /**
   * Number of instances to create
   * @default 1
   */
  count?: number;

  /**
   * Whether to include related entities
   * @default true
   */
  includeRelated?: boolean;

  /**
   * Custom overrides for generated data
   */
  overrides?: Record<string, unknown>;
}

/**
 * Default seed options
 */
const defaultSeedOptions: SeedOptions = {
  variation: DataVariation.DEFAULT,
  count: 1,
  includeRelated: true,
  overrides: {},
};

/**
 * Generate seed data for a specific entity
 * @param entityName - Name of the entity in the data repository
 * @param options - Seed options
 * @returns Generated seed data
 */
export function generateSeedData<T>(
  entityName: string,
  options: SeedOptions = {},
): T[] {
  const mergedOptions = { ...defaultSeedOptions, ...options };

  // Generate data using the data factory
  return dataRepository.createMany<T>(
    entityName,
    mergedOptions.count!,
    mergedOptions.variation,
    mergedOptions.overrides as Partial<T>,
  );
}

/**
 * Generate seed data for multiple entities
 * @param entities - Map of entity names to seed options
 * @returns Generated seed data for each entity
 */
export function generateMultipleSeedData(
  entities: Record<string, SeedOptions>,
): Record<string, unknown[]> {
  const result: Record<string, unknown[]> = {};

  // Generate data for each entity
  Object.entries(entities).forEach(([entityName, options]) => {
    result[entityName] = generateSeedData(entityName, options);
  });

  return result;
}

/**
 * Register a seed data generator for a specific entity
 * @param entityName - Name of the entity
 * @param generator - Function that generates seed data
 */
export function registerSeedGenerator<T>(
  entityName: string,
  generator: (options: SeedOptions) => T[],
): void {
  // Store the generator in a registry
  seedGeneratorRegistry[entityName] = generator;
}

/**
 * Registry of seed data generators
 */
const seedGeneratorRegistry: Record<
  string,
  (options: SeedOptions) => unknown[]
> = {};

/**
 * Generate seed data using a registered generator
 * @param entityName - Name of the entity
 * @param options - Seed options
 * @returns Generated seed data
 */
export function generateSeedDataWithGenerator<T>(
  entityName: string,
  options: SeedOptions = {},
): T[] {
  const generator = seedGeneratorRegistry[entityName];

  if (!generator) {
    throw new Error(`No seed generator registered for entity "${entityName}"`);
  }

  return generator(options) as T[];
}
