import fs from "fs";
import path from "path";
import { createLogger, format, transports } from "winston";
import { beforeEach, describe, expect, it, vi } from "vitest";

import logger, { logApiRequest, logError, logPrintJob, logSystemShutdown, logSystemStartup, logWebSocketConnection } from "./index";
import { config } from "../config";

// Mock winston
vi.mock("winston", () => ({
  createLogger: vi.fn().mockReturnValue({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }),
  format: {
    combine: vi.fn().mockReturnValue({}),
    timestamp: vi.fn().mockReturnValue({}),
    errors: vi.fn().mockReturnValue({}),
    splat: vi.fn().mockReturnValue({}),
    json: vi.fn().mockReturnValue({}),
    printf: vi.fn().mockReturnValue({}),
    colorize: vi.fn().mockReturnValue({})
  },
  transports: {
    Console: vi.fn(),
    File: vi.fn()
  }
}));

// Mock DailyRotateFile
vi.mock("winston-daily-rotate-file", () => ({}));

// Mock fs
vi.mock("fs", () => ({
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn()
}));

// Mock config
vi.mock("../config", () => ({
  config: {
    logging: {
      level: "info",
      file: "logs/print-server.log",
      maxSize: 10485760,
      maxFiles: 10
    }
  }
}));

describe("Logging Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create logger with correct configuration", () => {
    // The logger is created on module import, so we just verify it was called correctly
    expect(createLogger).toHaveBeenCalled();
    expect(transports.Console).toHaveBeenCalled();
    expect(transports.File).not.toHaveBeenCalled(); // Since we're using DailyRotateFile
  });

  it("should create logs directory if it doesn't exist", () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(false);
    
    // Re-import the module to trigger directory creation
    jest.isolateModules(() => {
      require("./index");
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    });
  });

  describe("Log helper functions", () => {
    it("should log errors", () => {
      const error = new Error("Test error");
      logError("Test error message", error);
      
      expect(logger.error).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith("Test error message", { error });
    });

    it("should log API requests", () => {
      logApiRequest("GET", "/test", "127.0.0.1", 200);
      
      expect(logger.info).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("GET /test"));
    });

    it("should log print jobs", () => {
      logPrintJob("job-123", "Test Printer", "success");
      
      expect(logger.info).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("job-123"));
    });

    it("should log system startup", () => {
      logSystemStartup();
      
      expect(logger.info).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("System starting"));
    });

    it("should log system shutdown", () => {
      logSystemShutdown();
      
      expect(logger.info).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("System shutting down"));
    });

    it("should log WebSocket connections", () => {
      logWebSocketConnection("connected");
      
      expect(logger.info).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("WebSocket connected"));
      
      logWebSocketConnection("disconnected");
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("WebSocket disconnected"));
    });
  });
});
