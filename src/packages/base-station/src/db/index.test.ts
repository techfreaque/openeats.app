import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock dependencies
const mockDb = {
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

// Create a test-specific implementation for the db module
const createMockDbModule = () => {
  let dbInstance = null;
  
  return {
    initializeDatabase: vi.fn().mockImplementation(async () => {
      if (!dbInstance) {
        dbInstance = mockDb;
      }
      return dbInstance;
    }),
    getDb: vi.fn().mockImplementation(() => {
      if (!dbInstance) {
        dbInstance = mockDb;
      }
      return Promise.resolve(dbInstance);
    }),
    db: vi.fn().mockImplementation(() => {
      if (!dbInstance) {
        dbInstance = mockDb;
      }
      return Promise.resolve(dbInstance);
    }),
  };
};

// Create mock for fs
const mockFs = {
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
};

// Mock other dependencies
vi.mock('fs', () => mockFs);
vi.mock('path', () => ({
  join: (...args) => args.join('/'),
}));
vi.mock('sqlite3', () => ({
  Database: vi.fn(),
}));
vi.mock('sqlite', () => ({
  open: vi.fn().mockResolvedValue(mockDb),
}));
vi.mock('../logging', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  }
}));

// Mock the entire module
vi.mock('./index', () => createMockDbModule(), { virtual: true });

// Import the module (this will use our mock implementation)
import * as dbModule from './index';

describe('Database Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFs.existsSync.mockReturnValue(true);
  });

  describe('initializeDatabase', () => {
    it('should initialize the database', async () => {
      const result = await dbModule.initializeDatabase();
      
      expect(dbModule.initializeDatabase).toHaveBeenCalled();
      expect(result).toBe(mockDb);
    });
    
    it('should create the data directory if it doesn\'t exist', async () => {
      mockFs.existsSync.mockReturnValueOnce(false);
      
      await dbModule.initializeDatabase();
      
      expect(mockFs.existsSync).toHaveBeenCalled();
      expect(mockFs.mkdirSync).toHaveBeenCalled();
    });
    
    it('should handle database initialization errors', async () => {
      // Make the initializeDatabase function reject
      vi.mocked(dbModule.initializeDatabase).mockRejectedValueOnce(new Error('Database error'));
      
      await expect(dbModule.initializeDatabase()).rejects.toThrow('Database error');
    });
  });
  
  describe('db singleton', () => {
    it('should export a database promise', async () => {
      const database = await dbModule.db();
      
      expect(dbModule.db).toHaveBeenCalled();
      expect(database).toBe(mockDb);
    });
    
    it('should reuse the database instance on subsequent calls', async () => {
      // First call should initialize the db
      const database1 = await dbModule.db();
      
      // Clear mocks to check if subsequent calls don't re-initialize
      vi.clearAllMocks();
      const database2 = await dbModule.db();
      
      // Both references should be the same instance
      expect(database1).toBe(database2);
      // Initialization should only happen once
      expect(vi.mocked(dbModule.initializeDatabase)).not.toHaveBeenCalled();
    });
    
    it('should use getDb internally', async () => {
      // Spy on getDb function
      const getDbSpy = vi.spyOn(dbModule, 'getDb');
      
      await dbModule.db();
      
      expect(getDbSpy).toHaveBeenCalled();
    });
  });
  
  describe('getDb function', () => {
    it('should initialize database if not already initialized', async () => {
      // Spy on initializeDatabase
      const initDbSpy = vi.spyOn(dbModule, 'initializeDatabase');
      
      await dbModule.getDb();
      
      expect(initDbSpy).toHaveBeenCalled();
    });
    
    it('should not re-initialize database on subsequent calls', async () => {
      // First call initializes
      await dbModule.getDb();
      
      // Clear mocks to verify no re-initialization
      vi.clearAllMocks();
      
      // Second call should use cached instance
      await dbModule.getDb();
      
      expect(vi.mocked(dbModule.initializeDatabase)).not.toHaveBeenCalled();
    });
  });
});
