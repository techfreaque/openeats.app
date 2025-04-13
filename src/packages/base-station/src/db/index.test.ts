import { beforeEach, describe, expect, it, vi } from "vitest";

import { db, initializeDatabase } from "./index";
import sqlite3 from "sqlite3";

// Mock sqlite3
vi.mock("sqlite3", () => ({
  Database: vi.fn(),
  verbose: vi.fn().mockReturnValue({
    Database: vi.fn(),
  }),
}));

// Mock sqlite package with proper mockDb
const mockDb = {
  exec: vi.fn().mockResolvedValue(undefined),
  run: vi.fn().mockResolvedValue(undefined),
  all: vi.fn().mockResolvedValue([]),
  get: vi.fn().mockResolvedValue(null),
  prepare: vi.fn(),
  close: vi.fn(),
};

// Mock sqlite open function with proper implementation
const open = vi.fn().mockImplementation(async () => mockDb);
vi.mock("sqlite", () => ({
  open
}));

// Mock fs module with properly spied functions
const mockFs = {
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
};
vi.mock("fs", () => mockFs);

describe("Database Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementations
    open.mockImplementation(async () => mockDb);
  });

  describe("initializeDatabase", () => {
    it("should initialize the database", async () => {
      const database = await initializeDatabase();

      expect(database).toBeDefined();
      expect(open).toHaveBeenCalled();
      expect(mockDb.exec).toHaveBeenCalled();
    });

    it("should create the data directory if it doesn't exist", async () => {
      // Arrange - mock fs.existsSync to return false for this test
      mockFs.existsSync.mockReturnValueOnce(false);

      // Act
      await initializeDatabase();

      // Assert
      expect(mockFs.mkdirSync).toHaveBeenCalled();
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(expect.any(String), {
        recursive: true,
      });
    });

    it("should handle database initialization errors", async () => {
      // Arrange - mock open to properly reject with an error
      open.mockImplementationOnce(() => Promise.reject(new Error("Database error")));

      // Act & Assert
      await expect(initializeDatabase()).rejects.toThrow(
        "Failed to initialize database"
      );
    });
  });

  describe("db singleton", () => {
    it("should export a database promise", async () => {
      expect(db).toBeInstanceOf(Promise);
      const database = await db;
      expect(database).toBeDefined();
    });
  });
});
