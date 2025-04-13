import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock fs module functions
const fsExistsSyncMock = vi.fn().mockReturnValue(true);
const fsMkdirSyncMock = vi.fn();

vi.mock('fs', () => {
  const mockFs = {
    existsSync: fsExistsSyncMock,
    mkdirSync: fsMkdirSyncMock,
  };
  return {
    ...mockFs,
    default: mockFs
  };
});

// Create a mock database instance
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

// Mock sqlite3
vi.mock('sqlite3', () => ({
  Database: vi.fn()
}));

// Set up the sqlite mock with different behaviors
const sqliteOpenMock = vi.fn().mockResolvedValue(mockDbInstance);
vi.mock('sqlite', () => ({
  open: sqliteOpenMock
}));

// Define setup to dynamically import the module (fix for ESM)
let initializeDatabase: () => Promise<any>;
let db: Promise<any>;

// Import the module dynamically to avoid hoisting issues
beforeEach(async () => {
  // Reset modules to force a fresh import
  vi.resetModules();
  
  // Import the module dynamically
  const dbModule = await import('./index');
  
  // Assign to our variables
  initializeDatabase = dbModule.initializeDatabase;
  db = dbModule.db;
});

describe('Database Module', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Set default success behavior
    sqliteOpenMock.mockResolvedValue(mockDbInstance);
  });

  describe('initializeDatabase', () => {
    it('should initialize the database', async () => {
      // Act - call the function
      const result = await initializeDatabase();
      
      // Assert - verify it was called and returned our mock
      expect(sqliteOpenMock).toHaveBeenCalled();
      expect(result).toBe(mockDbInstance);
    });
    
    it('should create the data directory if it doesn\'t exist', async () => {
      // Arrange - make existsSync return false for this test
      fsExistsSyncMock.mockReturnValueOnce(false);
      
      // Act - call the function
      await initializeDatabase();
      
      // Assert - verify directory was checked and created
      expect(fsExistsSyncMock).toHaveBeenCalled();
      expect(fsMkdirSyncMock).toHaveBeenCalled();
    });
    
    it('should handle database initialization errors', async () => {
      // Arrange - make sqlite.open reject for this test
      sqliteOpenMock.mockRejectedValueOnce(new Error('Database error'));
      
      // Act & Assert - verify it throws the expected error
      await expect(initializeDatabase()).rejects.toThrow('Database error');
    });
  });
  
  describe('db singleton', () => {
    it('should export a database promise', async () => {
      // Act - access the exported db and await it
      const database = await db;
      
      // Assert - verify it's our mock instance
      expect(sqliteOpenMock).toHaveBeenCalled();
      expect(database).toBe(mockDbInstance);
    });
  });
});
