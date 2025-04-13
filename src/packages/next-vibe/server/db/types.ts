/**
 * Database types
 * This file provides common types for database operations
 */
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgTable } from "drizzle-orm/pg-core";
import type { z } from "zod";

/**
 * Database ID type
 * Can be a string (UUID) or number
 */
export type DbId = string;

/**
 * Database client type
 * Represents the Drizzle database client
 */
export type DbClient = NodePgDatabase<Record<string, never>>;

/**
 * Table type
 * Represents a Drizzle table schema
 */
export type Table = PgTable;

/**
 * Table column type
 * Represents a column in a Drizzle table
 */
export type TableColumn<T> = T extends { _: { columns: infer U } }
  ? keyof U
  : never;

/**
 * Table model type
 * Represents the shape of a database table row
 */
export type TableModel<T> = T extends { _: { model: infer U } } ? U : never;

/**
 * Insert model type
 * Represents the shape of data to insert into a database table
 */
export type InsertModel<T> = T extends { _: { insertModel: infer U } }
  ? U
  : never;

/**
 * Zod inference type
 * Helper type for inferring the type from a Zod schema
 */
export type ZodInfer<T extends z.ZodType> = z.infer<T>;
