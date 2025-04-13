import type { DataFactory, DataFactoryOptions } from "./types";
import { DataVariation } from "./types";

/**
 * Generic data factory implementation
 * Creates consistent test data for examples, seeds, and tests
 */
export class GenericDataFactory<T> implements DataFactory<T> {
  private examples: Record<string, T>;
  private defaultVariation: DataVariation;
  private variations: Partial<Record<DataVariation, (index?: number) => T>>;

  /**
   * Create a new data factory
   * @param options - Factory configuration options
   */
  constructor(options: DataFactoryOptions<T>) {
    this.examples = options.examples ?? {};
    this.defaultVariation = options.defaultVariation ?? DataVariation.DEFAULT;
    this.variations = options.variations ?? {};

    // Ensure we have at least one variation
    if (!this.variations[this.defaultVariation]) {
      throw new Error(
        `Default variation "${this.defaultVariation}" not provided in factory`,
      );
    }
  }

  /**
   * Create a single instance of the data
   * @param variation - The variation of data to create
   * @param overrides - Optional properties to override in the generated data
   */
  create(
    variation: DataVariation = this.defaultVariation,
    overrides: Partial<T> = {},
  ): T {
    const factory =
      this.variations[variation] ?? this.variations[this.defaultVariation];

    if (!factory) {
      throw new Error(`No factory found for variation "${variation}"`);
    }

    const data = factory();
    return { ...data, ...overrides };
  }

  /**
   * Create multiple instances of the data
   * @param count - Number of instances to create
   * @param variation - The variation of data to create
   * @param overrides - Optional properties to override in the generated data
   */
  createMany(
    count: number,
    variation: DataVariation = this.defaultVariation,
    overrides: Partial<T> = {},
  ): T[] {
    return Array.from({ length: count }, (_, index) => {
      const factory =
        this.variations[variation] ?? this.variations[this.defaultVariation];

      if (!factory) {
        throw new Error(`No factory found for variation "${variation}"`);
      }

      const data = factory(index);
      return { ...data, ...overrides };
    });
  }

  /**
   * Get a specific example by ID
   * @param id - Unique identifier for the example
   */
  getById(id: string): T | undefined {
    return this.examples[id];
  }
}

/**
 * Create a new data factory
 * @param options - Factory configuration options
 */
export function createFactory<T>(
  options: DataFactoryOptions<T>,
): DataFactory<T> {
  return new GenericDataFactory<T>(options);
}
