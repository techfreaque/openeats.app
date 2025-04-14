import fs from "fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import winston from "winston";

// Define mockLogger before vi.mock calls since they are hoisted
const mockLogger = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Mock winston with mockLogger
vi.mock("winston", () => {
  return {
    default: {
      createLogger: vi.fn().mockReturnValue(mockLogger),
      format: {
        combine: vi.fn().mockReturnValue({}),
        timestamp: vi.fn().mockReturnValue({}),
        errors: vi.fn().mockReturnValue({}),
        splat: vi.fn().mockReturnValue({}),
        json: vi.fn().mockReturnValue({}),
        printf: vi.fn().mockReturnValue({}),
        colorize: vi.fn().mockReturnValue({}),
      },
      transports: {
        Console: vi.fn(),
        File: vi.fn(),
      },
    },
    createLogger: vi.fn().mockReturnValue(mockLogger),
    format: {
      combine: vi.fn().mockReturnValue({}),
      timestamp: vi.fn().mockReturnValue({}),
      errors: vi.fn().mockReturnValue({}),
      splat: vi.fn().mockReturnValue({}),
      json: vi.fn().mockReturnValue({}),
      printf: vi.fn().mockReturnValue({}),
      colorize: vi.fn().mockReturnValue({}),
    },
    transports: {
      Console: vi.fn(),
      File: vi.fn(),
    },
  };
});

// Mock DailyRotateFile
vi.mock("winston-daily-rotate-file", () => ({}));

// Mock fs
vi.mock("fs", () => {
  return {
    default: {
      existsSync: vi.fn().mockReturnValue(true),
      mkdirSync: vi.fn(),
    },
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
  };
});

// Mock config
vi.mock("../config", () => ({
  config: {
    logging: {
      level: "info",
      file: "logs/print-server.log",
      maxSize: 10485760,
      maxFiles: 10,
    },
    websocket: {
      url: "ws://test-server:8080",
    },
    server: {
      host: "localhost",
      port: 3000,
    },
  },
}));

// Import after mocks to ensure they're applied
import logger, {
  logApiRequest,
  logError,
  logPrintJob,
  logSystemShutdown,
  logSystemStartup,
  logWebSocketConnection,
} from "./index";

describe("Logging Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create logger with correct configuration", () => {
    // The logger is created on module import, so we just verify it was called correctly
    expect(winston.createLogger).toHaveBeenCalled();
    expect(winston.transports.Console).toHaveBeenCalled();
    // Using File instead of DailyRotateFile in our test since we've mocked it
    expect(winston.transports.File).not.toHaveBeenCalled();
  });

  it("should create logs directory if it doesn't exist", () => {
    // First, reset the mock to return false (directory doesn't exist)
    vi.mocked(fs.existsSync).mockReturnValueOnce(false);
    
    // Re-require the module to trigger directory creation logic
    vi.resetModules();
    require("./index");
    
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), {
      recursive: true,
    });
  });

  it("should handle directory creation failure gracefully", () => {
    // Mock directory existence check to return false
    vi.mocked(fs.existsSync).mockReturnValueOnce(false);
    // Mock directory creation to throw an error
    const mockError = new Error("Permission denied");
    vi.mocked(fs.mkdirSync).mockImplementationOnce(() => {
      throw mockError;
    });
    
    // Spy on console.error since we can't easily check the logger in this case
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    // Re-import the module to trigger directory creation failure
    vi.resetModules();
    require("./index");
    
    expect(fs.mkdirSync).toHaveBeenCalled();
    // Since we can't easily check the logger here, we verify the error was thrown
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  describe("Log helper functions", () => {
    it("should log errors with stack trace for Error objects", () => {
      const error = new Error("Test error");
      error.stack = "Error: Test error\n    at Test.test";
      logError("Test error message", error);

      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith("Test error message", {
        error,
      });
    });

    it("should log errors for non-Error objects", () => {
      const nonErrorObj = { message: "Not an error" };
      logError("Non-error object", nonErrorObj);

      expect(mockLogger.error).toHaveBeenCalled();
      // Check that it handles non-Error objects correctly
      expect(mockLogger.error).toHaveBeenCalledWith("Non-error object", {
        error: nonErrorObj,
      });
    });

    it("should log API requests with different HTTP methods", () => {
      // Test multiple HTTP methods
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
      methods.forEach(method => {
        logApiRequest(method, "/api/test", "127.0.0.1", 200);
        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.stringContaining(`API ${method} /api/test`)
        );
      });
    });

    it("should log API requests with different status codes", () => {
      // Test success status codes
      logApiRequest("GET", "/api/test", "127.0.0.1", 200);
      expect(mockLogger.info).toHaveBeenLastCalledWith(
        expect.stringContaining("- 200")
      );
      
      // Test redirect status codes
      logApiRequest("GET", "/api/test", "127.0.0.1", 301);
      expect(mockLogger.info).toHaveBeenLastCalledWith(
        expect.stringContaining("- 301")
      );
      
      // Test client error status codes
      logApiRequest("GET", "/api/test", "127.0.0.1", 404);
      expect(mockLogger.info).toHaveBeenLastCalledWith(
        expect.stringContaining("- 404")
      );
      
      // Test server error status codes
      logApiRequest("GET", "/api/test", "127.0.0.1", 500);
      expect(mockLogger.info).toHaveBeenLastCalledWith(
        expect.stringContaining("- 500")
      );
    });

    it("should log print jobs with printer information", () => {
      // Test with printer specified
      logPrintJob("test-file.pdf", "HP LaserJet", true, "job-123");
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("test-file.pdf to printer HP LaserJet")
      );
      
      // Test without printer specified
      logPrintJob("test-file.pdf", undefined, true, "job-123");
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("test-file.pdf")
      );
      expect(mockLogger.info).toHaveBeenLastCalledWith(
        expect.not.stringContaining("to printer")
      );
    });

    it("should log failed print jobs with error details", () => {
      const errorMessage = "Out of paper";
      logPrintJob("test-file.pdf", "HP LaserJet", false, undefined, errorMessage);
      
      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(`error: ${errorMessage}`)
      );
    });

    it("should log print jobs with job ID when provided", () => {
      const jobId = "job-456";
      logPrintJob("test-file.pdf", "Test Printer", true, jobId);
      
      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(`job ID: ${jobId}`)
      );
    });

    it("should log print jobs without job ID when not provided", () => {
      logPrintJob("test-file.pdf", "Test Printer", true);
      
      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.not.stringContaining("job ID")
      );
    });

    it("should log system startup", () => {
      logSystemStartup();

      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("System starting up")
      );
    });

    it("should log system shutdown", () => {
      logSystemShutdown();

      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("System shutting down")
      );
    });

    it("should log WebSocket connections", () => {
      const wsUrl = "ws://localhost:8080";
      
      // Test connected state
      logWebSocketConnection(true, wsUrl);
      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(`Connected to WebSocket server: ${wsUrl}`)
      );

      // Test disconnected state
      logWebSocketConnection(false, wsUrl);
      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(`Disconnected from WebSocket server: ${wsUrl}`)
      );
    });
  });
});
