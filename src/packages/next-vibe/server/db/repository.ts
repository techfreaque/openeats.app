/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/**
 * Base repository pattern for database access
 * This file provides a generic repository pattern for database operations
 *
 * Note: This file uses 'any' type assertions in several places to work around
 * Drizzle ORM's strict typing system. These are necessary to make the generic
 * repository pattern work with Drizzle's complex type system.
 */

import { sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { z } from "zod";

import type { DbClient, DbId } from "./types";

/**
 * Base repository interface
 * @template TSelect - The select model
 * @template TInsert - The insert model
 * @template TSchema - The Zod schema for validation
 */
export interface BaseRepository<
  TSelect,
  TInsert,
  TSchema extends z.ZodType<unknown, z.ZodTypeDef, unknown>,
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
  TSchema extends z.ZodType<unknown>,
> implements BaseRepository<TSelect, TInsert, TSchema>
{
  /**
   * The database client
   */
  protected db!: DbClient;

  /**
   * The table schema
   */
  protected table!: TTable;

  /**
   * The Zod schema for validation
   */
  protected schema!: TSchema;

  /**
   * The ID field name
   */
  protected idField!: string;
  /**
   * Constructor
   * @param dbOrTable - The database client or table schema
   * @param tableOrSchema - The table schema or Zod schema for validation
   * @param schemaOrIdField - The Zod schema for validation or ID field name
   * @param idField - The ID field name
   */
  constructor(
    dbOrTable: DbClient | TTable,
    tableOrSchema: TTable | TSchema,
    schemaOrIdField: TSchema | string = "id",
    idFieldParam = "id",
  ) {
    // Handle different constructor signatures
    if (this.isDbClient(dbOrTable)) {
      // First signature: (db, table, schema, idField)
      this.db = dbOrTable;
      this.table = tableOrSchema as TTable;
      this.schema = schemaOrIdField as TSchema;
      this.idField = idFieldParam;
      return;
    }

    // Second signature: (table, schema, idField)
    // This is used by ApiRepositoryImpl which provides the db client
    this.table = dbOrTable;
    this.schema = tableOrSchema as TSchema;
    this.idField = typeof schemaOrIdField === "string" ? schemaOrIdField : "id";

    // The db client should be provided by the subclass
    if (!this.db) {
      throw new Error("Database client not provided");
    }
  }

  /**
   * Check if an object is a database client
   * @param obj - The object to check
   */
  private isDbClient(obj: unknown): obj is DbClient {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "select" in obj &&
      typeof obj.select === "function"
    );
  }

  /**
   * Find all records
   */
  async findAll(): Promise<TSelect[]> {
    // Use type assertion to handle Drizzle's strict typing
    const results = await this.db.select().from(this.table as any);
    return results as unknown as TSelect[];
  }

  /**
   * Find a record by ID
   * @param id - The record ID
   */
  async findById(id: DbId): Promise<TSelect | undefined> {
    // Create a dynamic where condition using the ID field
    const whereCondition = sql`${this.table}.${sql.identifier(this.idField)} = ${id}`;

    // Use type assertion to handle Drizzle's strict typing
    const results = await this.db
      .select()
      .from(this.table as any)
      .where(whereCondition);

    if (!results || results.length === 0) {
      return undefined;
    }

    return results[0] as TSelect;
  }

  /**
   * Create a new record
   * @param data - The record data
   */
  async create(data: TInsert): Promise<TSelect> {
    const validatedData = this.validate(data);

    // Use type assertion to handle Drizzle's strict typing
    const results = await this.db
      .insert(this.table)
      .values(validatedData as any)
      .returning();

    if (!results || !Array.isArray(results) || results.length === 0) {
      throw new Error("Failed to create record");
    }

    return results[0] as TSelect;
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

    // Validate the data
    // We need to use a type assertion here because Zod's types are very strict
    const validatedData = this.schema.parse(data) as Partial<TInsert>;

    // Create a dynamic where condition using the ID field
    const whereCondition = sql`${this.table}.${sql.identifier(this.idField)} = ${id}`;

    // Update the record with type assertion for Drizzle's strict typing
    const results = await this.db
      .update(this.table)
      .set(validatedData as any)
      .where(whereCondition)
      .returning();

    if (!results || !Array.isArray(results) || results.length === 0) {
      return undefined;
    }

    return results[0] as TSelect;
  }

  /**
   * Delete a record
   * @param id - The record ID
   */
  async delete(id: DbId): Promise<boolean> {
    // Create a dynamic where condition using the ID field
    const whereCondition = sql`${this.table}.${sql.identifier(this.idField)} = ${id}`;

    // Use type assertion to handle Drizzle's strict typing
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
    // Use type assertion to handle Zod's strict typing
    return this.schema.parse(data);
  }
}
