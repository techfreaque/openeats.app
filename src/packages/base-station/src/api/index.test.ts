import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { config } from "../config";
import logger from "../logging";
import { printQueueService } from "../services/queue";
import { printerCategoryService } from "../services/categories";
import { printerGroupService } from "../services/groups";
import { barcodeService } from "../services/barcodes";
import { startServer } from "./index";

// Mock express
vi.mock("express", () => {
  const app = {
    use: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    listen: vi.fn((port, host, callback) => {
      if (callback) callback();
      return { close: vi.fn() };
    })
  };
  
  const mockExpress = vi.fn(() => app);
  mockExpress.json = vi.fn(() => "json-middleware");
  mockExpress.Router = vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }));
  
  return {
    default: mockExpress,
    json: mockExpress.json,
    Router: mockExpress.Router
  };
});

// Mock config
vi.mock("../config", () => ({
  config: {
    server: {
      port: 3000,
      host: "localhost"
    },
    security: {
      apiKey: "test-api-key"
    }
  },
  loadConfig: vi.fn().mockReturnValue({
    server: { port: 3000 }
  }),
  updateConfig: vi.fn().mockReturnValue({})
}));

// Mock logger
vi.mock("../logging", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  },
  logApiRequest: vi.fn()
}));

// Mock services
vi.mock("../services/queue", () => ({
  printQueueService: {
    getJobs: vi.fn().mockResolvedValue([]),
    getJob: vi.fn().mockResolvedValue(null),
    addJob: vi.fn().mockResolvedValue("job-123"),
    pauseJob: vi.fn(),
    resumeJob: vi.fn(),
    cancelJob: vi.fn(),
    updateJobPriority: vi.fn(),
    pauseAllJobs: vi.fn(),
    resumeAllJobs: vi.fn()
  }
}));

vi.mock("../services/categories", () => ({
  printerCategoryService: {
    getCategories: vi.fn().mockResolvedValue([]),
    getCategory: vi.fn().mockResolvedValue(null),
    createCategory: vi.fn().mockResolvedValue("cat-123"),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    assignPrinters: vi.fn()
  }
}));

vi.mock("../services/groups", () => ({
  printerGroupService: {
    getGroups: vi.fn().mockResolvedValue([]),
    getGroup: vi.fn().mockResolvedValue(null),
    createGroup: vi.fn().mockResolvedValue("group-123"),
    updateGroup: vi.fn(),
    deleteGroup: vi.fn(),
    assignPrinters: vi.fn(),
    getGroupStatus: vi.fn().mockResolvedValue({})
  }
}));

vi.mock("../services/barcodes", () => ({
  barcodeService: {
    generateBarcode: vi.fn().mockResolvedValue({ base64: "data" }),
    generateQRCode: vi.fn().mockResolvedValue({ base64: "data" })
  }
}));

vi.mock("../printing", () => ({
  getPrinters: vi.fn().mockResolvedValue([])
}));

// Mock middleware
vi.mock("./middleware", () => ({
  checkLocalNetwork: (req, res, next) => next(),
  authenticateApiKey: (req, res, next) => next()
}));

describe("API Server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("startServer", () => {
    it("should start the server and listen on the configured port", () => {
      startServer();
      
      const app = express.default();
      expect(app.listen).toHaveBeenCalledWith(3000, "localhost", expect.any(Function));
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("3000"));
    });

    it("should register middleware", () => {
      startServer();
      
      const app = express.default();
      expect(app.use).toHaveBeenCalledWith("json-middleware");
      expect(app.use).toHaveBeenCalledTimes(expect.any(Number));
    });

    it("should register routes", () => {
      startServer();
      
      const app = express.default();
      
      // Management API endpoints
      expect(app.get).toHaveBeenCalledWith("/management/status", expect.any(Function), expect.any(Function));
      expect(app.get).toHaveBeenCalledWith("/management/config", expect.any(Function), expect.any(Function));
      expect(app.put).toHaveBeenCalledWith("/management/config", expect.any(Function), expect.any(Function));
      
      // Queue routes, categories, etc should be registered via app.use
      expect(app.use).toHaveBeenCalledWith("/management/queue", expect.any(Object));
      expect(app.use).toHaveBeenCalledWith("/management/categories", expect.any(Object));
      expect(app.use).toHaveBeenCalledWith("/management/groups", expect.any(Object));
      expect(app.use).toHaveBeenCalledWith("/api/barcodes", expect.any(Object));
    });
  });

  // Testing specific endpoint handlers would be easier with supertest,
  // but would require extracting the route handlers to make them more testable
});
