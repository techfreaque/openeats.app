import { beforeEach, describe, expect, it, vi } from "vitest";

import { db, initializeDatabase } from "./index";
import sqlite3 from "sqlite3";

// Mock sqlite
vi.mock("sqlite3", () => ({
  Database: vi.fn(),
  verbose: vi.fn().mockReturnValue({
    Database: vi.fn(),
  }),
}));

// Mock sqlite package
const mockDb = {
  exec: vi.fn().mockResolvedValue(undefined),
  run: vi.fn().mockResolvedValue(undefined),
  all: vi.fn().mockResolvedValue([]),
  get: vi.fn().mockResolvedValue(null),
  prepare: vi.fn(),
  close: vi.fn(),
};

// Mock sqlite open function
const open = vi.fn().mockResolvedValue(mockDb);
vi.mock("sqlite", () => ({
  open: open,
}));

// Mock fs module
vi.mock("fs", () => ({
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
}));

describe("Database Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initializeDatabase", () => {
    it("should initialize the database", async () => {
      const database = await initializeDatabase();

      expect(database).toBeDefined();
      expect(open).toHaveBeenCalled();
      expect(mockDb.exec).toHaveBeenCalledTimes(expect.any(Number));
    });

    it("should create the data directory if it doesn't exist", async () => {
      // Arrange - mock fs.existsSync to return false for this test
      const existsSyncMock = vi.fn().mockReturnValue(false);
      vi.spyOn(require("fs"), "existsSync").mockImplementation(existsSyncMock);

      // Act
      await initializeDatabase();

      // Assert
      expect(require("fs").mkdirSync).toHaveBeenCalled();
      expect(require("fs").mkdirSync).toHaveBeenCalledWith(expect.any(String), {
        recursive: true,
      });
    });

    it("should handle database initialization errors", async () => {
      // Arrange - mock open to reject with an error
      const error = new Error("Database error");
      open.mockRejectedValueOnce(error);

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
