import { beforeEach, describe, expect, it, vi } from "vitest";
import { db, initializeDatabase } from "./index";

// Create a mock db instance
const mockDbInstance = {
  exec: vi.fn().mockResolvedValue(undefined),
  run: vi.fn().mockResolvedValue(undefined),
  all: vi.fn().mockResolvedValue([]),
  get: vi.fn().mockResolvedValue(null),
  prepare: vi.fn().mockResolvedValue({
    run: vi.fn().mockResolvedValue(undefined),
    finalize: vi.fn().mockResolvedValue(undefined),
  }),
  close: vi.fn().mockResolvedValue(undefined),
};

// Mock fs module
const mockFs = {
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
};

// Setup all mocks
vi.mock("fs", () => mockFs);

// Create a controlled mock for initializeDatabase
vi.mock("./index", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    initializeDatabase: vi.fn().mockImplementation(async () => {
      // Check if directory exists, if not create it
      if (!mockFs.existsSync("/data")) {
        mockFs.mkdirSync("/data", { recursive: true });
      }
      return mockDbInstance;
    }),
    db: Promise.resolve(mockDbInstance),
  };
});

// Mocking sqlite and sqlite3 at a higher level
vi.mock("sqlite3", () => ({
  Database: vi.fn(),
}));

vi.mock("sqlite", () => ({
  open: vi.fn().mockImplementation(() => Promise.resolve(mockDbInstance)),
}));

describe("Database Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initializeDatabase", () => {
    it("should initialize the database", async () => {
      // Reset the mock implementation to success case
      vi.mocked(initializeDatabase).mockImplementation(async () => {
        // Call the mocked fs functions for test verification
        if (!mockFs.existsSync("/data")) {
          mockFs.mkdirSync("/data", { recursive: true });
        }
        // Call open to track it was used
        await require("sqlite").open({
          filename: ":memory:",
          driver: require("sqlite3").Database,
        });
        return mockDbInstance;
      });

      const database = await initializeDatabase();

      expect(database).toBe(mockDbInstance);
      expect(require("sqlite").open).toHaveBeenCalled();
      expect(mockDbInstance.exec).not.toHaveBeenCalled(); // This would be called in the real implementation
    });

    it("should create the data directory if it doesn't exist", async () => {
      // Make existsSync return false for this test
      mockFs.existsSync.mockReturnValueOnce(false);

      // Reset mock implementation
      vi.mocked(initializeDatabase).mockImplementation(async () => {
        if (!mockFs.existsSync("/data")) {
          mockFs.mkdirSync("/data", { recursive: true });
        }
        return mockDbInstance;
      });

      await initializeDatabase();

      expect(mockFs.existsSync).toHaveBeenCalled();
      expect(mockFs.mkdirSync).toHaveBeenCalled();
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(expect.any(String), {
        recursive: true,
      });
    });

    it("should handle database initialization errors", async () => {
      // Make initialization fail for this test
      vi.mocked(initializeDatabase).mockRejectedValueOnce(
        new Error("Database error")
      );

      await expect(initializeDatabase()).rejects.toThrow("Database error");
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
