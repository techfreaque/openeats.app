/**
 * Core types for the data factory system
 */

/**
 * Data variation types for generating different scenarios
 */
export enum DataVariation {
  DEFAULT = "default",
  MINIMAL = "minimal",
  COMPLETE = "complete",
  INVALID = "invalid",
  EDGE_CASE = "edge_case",
}

/**
 * Base interface for all data factories
 */
export interface DataFactory<T> {
  /**
   * Create a single instance of the data
   * @param variation - The variation of data to create
   * @param overrides - Optional properties to override in the generated data
   */
  create(variation?: DataVariation, overrides?: Partial<T>): T;

  /**
   * Create multiple instances of the data
   * @param count - Number of instances to create
   * @param variation - The variation of data to create
   * @param overrides - Optional properties to override in the generated data
   */
  createMany(
    count: number,
    variation?: DataVariation,
    overrides?: Partial<T>,
  ): T[];

  /**
   * Get a specific example by ID
   * @param id - Unique identifier for the example
   */
  getById(id: string): T | undefined;
}

/**
 * Options for data factory creation
 */
export interface DataFactoryOptions<T> {
  /**
   * Named examples that can be referenced by ID
   */
  examples?: Record<string, T>;

  /**
   * Default variation to use when none is specified
   */
  defaultVariation?: DataVariation;

  /**
   * Factory functions for different variations
   */
  variations?: Partial<Record<DataVariation, (index?: number) => T>>;
}

/**
 * Repository for managing multiple data factories
 */
export interface DataRepository {
  /**
   * Register a factory for a specific entity type
   * @param entityName - Name of the entity
   * @param factory - Factory instance for the entity
   */
  register<T>(entityName: string, factory: DataFactory<T>): void;

  /**
   * Get a factory for a specific entity type
   * @param entityName - Name of the entity
   */
  getFactory<T>(entityName: string): DataFactory<T>;

  /**
   * Create data for a specific entity type
   * @param entityName - Name of the entity
   * @param variation - The variation of data to create
   * @param overrides - Optional properties to override in the generated data
   */
  create<T>(
    entityName: string,
    variation?: DataVariation,
    overrides?: Partial<T>,
  ): T;

  /**
   * Create multiple instances of data for a specific entity type
   * @param entityName - Name of the entity
   * @param count - Number of instances to create
   * @param variation - The variation of data to create
   * @param overrides - Optional properties to override in the generated data
   */
  createMany<T>(
    entityName: string,
    count: number,
    variation?: DataVariation,
    overrides?: Partial<T>,
  ): T[];
}
