import type { DataFactory, DataRepository, DataVariation } from "./types";

/**
 * Implementation of the data repository
 * Manages multiple data factories and provides a unified interface
 */
export class DataRepositoryImpl implements DataRepository {
  private factories: Record<string, DataFactory<unknown>> = {};

  /**
   * Register a factory for a specific entity type
   * @param entityName - Name of the entity
   * @param factory - Factory instance for the entity
   */
  register<T>(entityName: string, factory: DataFactory<T>): void {
    this.factories[entityName] = factory;
  }

  /**
   * Get a factory for a specific entity type
   * @param entityName - Name of the entity
   */
  getFactory<T>(entityName: string): DataFactory<T> {
    const factory = this.factories[entityName];

    if (!factory) {
      throw new Error(`No factory registered for entity "${entityName}"`);
    }

    return factory as DataFactory<T>;
  }

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
  ): T {
    return this.getFactory<T>(entityName).create(variation, overrides);
  }

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
  ): T[] {
    return this.getFactory<T>(entityName).createMany(
      count,
      variation,
      overrides,
    );
  }
}

// Singleton instance of the data repository
export const dataRepository = new DataRepositoryImpl();
