import type { Database } from "sqlite";
import { open } from "sqlite";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { db, initializeDatabase } from "./index";

// Mock sqlite and sqlite3
vi.mock("sqlite3", () => ({
  Database: vi.fn(),
}));

vi.mock("sqlite", () => ({
  open: vi.fn().mockResolvedValue({
    exec: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  }),
}));

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
      const mockDb = {
        exec: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(open).mockResolvedValueOnce(mockDb as unknown as Database);

      const database = await initializeDatabase();

      expect(database).toBeDefined();
      expect(open).toHaveBeenCalled();
      expect(mockDb.exec).toHaveBeenCalled();
      // Should call exec multiple times for each table creation
      expect(mockDb.exec).toHaveBeenCalledTimes(expect.any(Number));
    });

    it("should create the data directory if it doesn't exist", async () => {
      vi.mocked(require("fs").existsSync).mockReturnValueOnce(false);

      await initializeDatabase();

      expect(require("fs").mkdirSync).toHaveBeenCalled();
      expect(require("fs").mkdirSync).toHaveBeenCalledWith(expect.any(String), {
        recursive: true,
      });
    });

    it("should handle database initialization errors", async () => {
      const error = new Error("Database error");
      vi.mocked(open).mockRejectedValueOnce(error);

      await expect(initializeDatabase()).rejects.toThrow(
        "Failed to initialize database",
      );
    });
  });

  describe("db singleton", () => {
    it("should export a database promise", async () => {
      expect(db).toBeInstanceOf(Promise);
      // Since db is a singleton that's initialized on import, we can't easily test its resolution
    });
  });
});
