/**
 * Base repository pattern for database access
 * This file provides a generic repository pattern for database operations
 */

import type { PgTable } from "drizzle-orm/pg-core";
import type { z } from "zod";

import type { DbClient, DbId } from "./types";

/**
 * Base repository interface
 * @template TTable - The table schema
 * @template TSelect - The select model
 * @template TInsert - The insert model
 * @template TSchema - The Zod schema for validation
 */
export interface BaseRepository<
  TTable extends PgTable,
  TSelect,
  TInsert,
  TSchema extends z.ZodType<any, any, any>,
> {
  /**
   * Find all records
   */
  findAll(): Promise<TSelect[]>;

  /**
   * Find a record by ID
   * @param id - The record ID
   */
  findById(id: DbId): Promise<TSelect | undefined>;

  /**
   * Create a new record
   * @param data - The record data
   */
  create(data: TInsert): Promise<TSelect>;

  /**
   * Update a record
   * @param id - The record ID
   * @param data - The record data
   */
  update(id: DbId, data: Partial<TInsert>): Promise<TSelect | undefined>;

  /**
   * Delete a record
   * @param id - The record ID
   */
  delete(id: DbId): Promise<boolean>;

  /**
   * Validate data against the schema
   * @param data - The data to validate
   */
  validate(data: unknown): z.infer<TSchema>;
}

/**
 * Base repository implementation
 * @template TTable - The table schema
 * @template TSelect - The select model
 * @template TInsert - The insert model
 * @template TSchema - The Zod schema for validation
 */
export abstract class BaseRepositoryImpl<
  TTable extends PgTable,
  TSelect,
  TInsert,
  TSchema extends z.ZodType<any, any, any>,
> implements BaseRepository<TTable, TSelect, TInsert, TSchema>
{
  /**
   * Constructor
   * @param db - The database client
   * @param table - The table schema
   * @param schema - The Zod schema for validation
   * @param idField - The ID field name
   */
  constructor(
    protected readonly db: DbClient,
    protected readonly table: TTable,
    protected readonly schema: TSchema,
    protected readonly idField = "id",
  ) {}

  /**
   * Find all records
   */
  async findAll(): Promise<TSelect[]> {
    const results = await this.db.select().from(this.table);
    return results as unknown as TSelect[];
  }

  /**
   * Find a record by ID
   * @param id - The record ID
   */
  async findById(id: DbId): Promise<TSelect | undefined> {
    // Create a dynamic where condition using the ID field
    const whereCondition = sql`${this.table}.${sql.identifier(this.idField)} = ${id}`;

    const results = await this.db
      .select()
      .from(this.table)
      .where(whereCondition);

    if (!results || results.length === 0) {
      return undefined;
    }

    return results[0] as unknown as TSelect;
  }

  /**
   * Create a new record
   * @param data - The record data
   */
  async create(data: TInsert): Promise<TSelect> {
    const validatedData = this.validate(data);

    // Type assertion needed because Drizzle's types are very strict
    const results = await this.db
      .insert(this.table)
      .values(validatedData as any)
      .returning();

    if (!results || !Array.isArray(results) || results.length === 0) {
      throw new Error("Failed to create record");
    }

    return results[0] as unknown as TSelect;
  }

  /**
   * Update a record
   * @param id - The record ID
   * @param data - The record data
   */
  async update(id: DbId, data: Partial<TInsert>): Promise<TSelect | undefined> {
    // First check if the record exists
    const exists = await this.findById(id);
    if (!exists) {
      return undefined;
    }

    // Validate the data using a type assertion since partial() may not exist on all schemas
    const validatedData = (this.schema as any).partial
      ? (this.schema as any).partial().parse(data)
      : this.schema.parse(data);

    // Create a dynamic where condition using the ID field
    const whereCondition = sql`${this.table}.${sql.identifier(this.idField)} = ${id}`;

    // Update the record
    const results = await this.db
      .update(this.table)
      .set(validatedData)
      .where(whereCondition)
      .returning();

    if (!results || !Array.isArray(results) || results.length === 0) {
      return undefined;
    }

    return results[0] as unknown as TSelect;
  }

  /**
   * Delete a record
   * @param id - The record ID
   */
  async delete(id: DbId): Promise<boolean> {
    // Create a dynamic where condition using the ID field
    const whereCondition = sql`${this.table}.${sql.identifier(this.idField)} = ${id}`;

    const results = await this.db
      .delete(this.table)
      .where(whereCondition)
      .returning();

    return Array.isArray(results) && results.length > 0;
  }

  /**
   * Validate data against the schema
   * @param data - The data to validate
   */
  validate(data: unknown): z.infer<TSchema> {
    return this.schema.parse(data);
  }
}
