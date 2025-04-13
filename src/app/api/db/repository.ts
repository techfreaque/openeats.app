/**
 * Repository implementation for the API
 * This file re-exports the repository pattern from next-vibe
 */

import type { BaseRepository } from "next-vibe/server/db/repository";
import { BaseRepositoryImpl } from "next-vibe/server/db/repository";
import type {
  DbId,
  InsertModel,
  TableModel,
  ZodInfer,
} from "next-vibe/server/db/types";

import { db } from "./index";

// Re-export types
export type { DbId, InsertModel, TableModel, ZodInfer };

// Re-export interfaces
export type { BaseRepository };

/**
 * API-specific repository implementation
 * Extends the base repository implementation from next-vibe
 * and provides the database client
 */
export abstract class ApiRepositoryImpl<
  T,
  TSelect,
  TInsert,
  TSchema,
> extends BaseRepositoryImpl<T, TSelect, TInsert, TSchema> {
  constructor(
    protected override readonly table: T,
    protected override readonly schema: TSchema,
    protected override readonly idField = "id",
  ) {
    super(db, table, schema, idField);
  }
}
