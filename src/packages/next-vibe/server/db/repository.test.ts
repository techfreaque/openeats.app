/**
 * Tests for the repository pattern
 */

import type { PgDatabase } from "drizzle-orm/pg-core";
import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { BaseRepositoryImpl } from "./repository";

// Mock table definition
const mockTable = pgTable("mock_table", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

// Mock schema
const mockSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
});

// Mock types
interface MockSelect {
  id: number;
  name: string;
}

interface MockInsert {
  name: string;
}

// Mock DB client
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([{ id: 1, name: "Test" }]),
};

// Mock repository implementation
class MockRepository extends BaseRepositoryImpl<
  typeof mockTable,
  MockSelect,
  MockInsert,
  typeof mockSchema
> {
  constructor() {
    super({
      db: mockDb as unknown as PgDatabase<Record<string, never>>,
      table: mockTable,
      schema: mockSchema,
      idField: "id",
    });
  }
}

describe("BaseRepositoryImpl", () => {
  it("should create a repository instance", () => {
    const repository = new MockRepository();
    expect(repository).toBeInstanceOf(BaseRepositoryImpl);
  });

  it("should find all records", async () => {
    const repository = new MockRepository();
    const result = await repository.findAll();
    expect(mockDb.select).toHaveBeenCalled();
    expect(mockDb.from).toHaveBeenCalledWith(mockTable);
    expect(result).toEqual([{ id: 1, name: "Test" }]);
  });

  it("should find a record by ID", async () => {
    const repository = new MockRepository();
    const result = await repository.findById(1);
    expect(mockDb.select).toHaveBeenCalled();
    expect(mockDb.from).toHaveBeenCalledWith(mockTable);
    expect(mockDb.where).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, name: "Test" });
  });

  it("should create a record", async () => {
    const repository = new MockRepository();
    const result = await repository.create({ name: "Test" });
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalled();
    expect(mockDb.returning).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, name: "Test" });
  });

  it("should update a record", async () => {
    const repository = new MockRepository();
    const result = await repository.update(1, { name: "Updated" });
    expect(mockDb.update).toHaveBeenCalled();
    expect(mockDb.set).toHaveBeenCalled();
    expect(mockDb.where).toHaveBeenCalled();
    expect(mockDb.returning).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, name: "Test" });
  });

  it("should delete a record", async () => {
    const repository = new MockRepository();
    const result = await repository.delete(1);
    expect(mockDb.delete).toHaveBeenCalled();
    expect(mockDb.where).toHaveBeenCalled();
    expect(mockDb.returning).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("should validate data", () => {
    const repository = new MockRepository();
    const result = repository.validate({ name: "Test" });
    expect(result).toEqual({ name: "Test" });
  });
});
