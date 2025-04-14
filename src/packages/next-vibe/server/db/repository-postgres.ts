/**
 * Repository implementation for the API
 * This file re-exports the repository pattern from next-vibe
 */

import type { PgTable } from "drizzle-orm/pg-core";
import type { ZodType, ZodTypeDef } from "zod";

import { db } from "./index";
import { BaseRepositoryImpl } from "./repository";

/**
 * API-specific repository implementation
 * Extends the base repository implementation from next-vibe
 * and provides the database client
 */
export abstract class ApiRepositoryImpl<
  T extends PgTable,
  TSelect,
  TInsert,
  TSchema extends ZodType<unknown, ZodTypeDef, unknown>,
> extends BaseRepositoryImpl<T, TSelect, TInsert, TSchema> {
  constructor(table: T, schema: TSchema, idField = "id") {
    super(db, table, schema, idField);
  }
}
