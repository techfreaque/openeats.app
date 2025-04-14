import { describe, expect, it, vi, beforeEach } from "vitest";
import express from "express";
import path from "path";

// Mock dependencies before importing the modules
vi.mock("../../services/barcodes", () => ({
  barcodeService: {
    generateBarcode: vi.fn(),
    generateQRCode: vi.fn(),
  },
}));

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    writeFileSync: vi.fn(),
    statSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
  existsSync: vi.fn(),
  writeFileSync: vi.fn(),
  statSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

// Mock the logging module
vi.mock("../../logging", () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  },
  logError: vi.fn()
}));

vi.mock("../middleware/auth", () => ({
  authenticateApiKey: (req, res, next) => next(),
}));

// Import after mocks
import barcodesRouter from "./barcodes";
import { barcodeService } from "../../services/barcodes";
import fs from "fs";
import logger, { logError } from "../../logging";

describe("Barcodes API Routes", () => {
  let app;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use("/api/barcodes", barcodesRouter);
    
    // Setup mock request and response
    mockRequest = (method, url, body = {}) => {
      const req = {
        method,
        url,
        body,
        params: {},
        headers: {},
        path: url,
      };
      
      // Extract params from URL pattern like "/files/somefile.png"
      const matches = url.match(/\/files\/([^\/]+)$/);
      if (matches) {
        req.params.filename = matches[1];
      }
      
      return req;
    };
    
    mockResponse = () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        sendFile: vi.fn(),
      };
      return res;
    };
    
    // Mock barcode service responses - always return a fixed new barcode response
    // This simulates the service generating a new barcode (not returning a cached one)
    vi.mocked(barcodeService.generateBarcode).mockResolvedValue({
      filePath: path.join(process.cwd(), "temp", "barcode-123.png"),
      base64: "data:image/png;base64,abc123",
    });
    
    vi.mocked(barcodeService.generateQRCode).mockResolvedValue({
      filePath: path.join(process.cwd(), "temp", "qrcode-456.png"),
      base64: "data:image/png;base64,xyz789",
    });

    // Mock the fs.existsSync to handle both temp directory and cache files correctly
    vi.mocked(fs.existsSync).mockImplementation((filePath: string) => {
      // If checking for temp directory existence return true
      if (filePath.endsWith("temp")) return true;
      
      // Return false for all other files to ensure we don't use cache during tests
      return false;
    });
    
    // Mock writeFileSync to do nothing
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
    
    // Mock the stat method
    vi.mocked(fs.statSync).mockReturnValue({
      mtimeMs: Date.now(),
    } as fs.Stats);
  });

  describe("POST /barcode", () => {
    it("should generate a barcode with valid input", async () => {
      // Find the route handler
      const routeHandler = barcodesRouter.stack.find(
        layer => layer.route && layer.route.path === "/barcode" && layer.route.methods.post
      ).route.stack.slice(-1)[0].handle;
      
      // Create request with valid barcode data
      const req = mockRequest("POST", "/barcode", {
        data: "123456789012",
        type: "code128",
        width: 200,
        height: 100,
      });
      
      const res = mockResponse();
      
      // Call the handler directly
      await routeHandler(req, res);
      
      // Verify the service was called with correct params
      expect(barcodeService.generateBarcode).toHaveBeenCalledWith(
        "123456789012",
        {
          type: "code128",
          width: 200,
          height: 100,
        }
      );
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          url: "/api/barcodes/files/barcode-123.png",
          base64: "data:image/png;base64,abc123",
        },
      });
    });
    
    it("should handle errors during barcode generation", async () => {
      // Mock the service to throw an error
      vi.mocked(barcodeService.generateBarcode).mockRejectedValueOnce(
        new Error("Failed to generate barcode")
      );
      
      // Find the route handler
      const routeHandler = barcodesRouter.stack.find(
        layer => layer.route && layer.route.path === "/barcode" && layer.route.methods.post
      ).route.stack.slice(-1)[0].handle;
      
      // Create request
      const req = mockRequest("POST", "/barcode", {
        data: "123456789012",
        type: "code128",
      });
      
      const res = mockResponse();
      
      // Call the handler directly
      await routeHandler(req, res);
      
      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Failed to generate barcode",
      });
      expect(logError).toHaveBeenCalled();
    });
    
    it("should validate input data", async () => {
      // Find the validation middleware
      const validationMiddleware = barcodesRouter.stack.find(
        layer => layer.route && layer.route.path === "/barcode" && layer.route.methods.post
      ).route.stack[1].handle;
      
      // Create request with invalid data (missing 'type')
      const req = mockRequest("POST", "/barcode", { data: "123" });
      const res = mockResponse();
      const next = vi.fn();
      
      // Call the validation middleware
      validationMiddleware(req, res, next);
      
      // Validation should fail
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
      }));
    });
  });

  describe("POST /qrcode", () => {
    it("should generate a QR code with valid input", async () => {
      // Find the route handler
      const routeHandler = barcodesRouter.stack.find(
        layer => layer.route && layer.route.path === "/qrcode" && layer.route.methods.post
      ).route.stack.slice(-1)[0].handle;
      
      // Create request with valid QR data
      const req = mockRequest("POST", "/qrcode", {
        data: "https://example.com",
        size: 300,
        errorCorrectionLevel: "H",
      });
      
      const res = mockResponse();
      
      // Call the handler directly
      await routeHandler(req, res);
      
      // Verify the service was called with correct params
      expect(barcodeService.generateQRCode).toHaveBeenCalledWith(
        "https://example.com",
        {
          size: 300,
          errorCorrectionLevel: "H",
        }
      );
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          url: "/api/barcodes/files/qrcode-456.png",
          base64: "data:image/png;base64,xyz789",
        },
      });
    });
    
    it("should handle errors during QR code generation", async () => {
      // Mock the service to throw an error
      vi.mocked(barcodeService.generateQRCode).mockRejectedValueOnce(
        new Error("Failed to generate QR code")
      );
      
      // Find the route handler
      const routeHandler = barcodesRouter.stack.find(
        layer => layer.route && layer.route.path === "/qrcode" && layer.route.methods.post
      ).route.stack.slice(-1)[0].handle;
      
      // Create request
      const req = mockRequest("POST", "/qrcode", {
        data: "https://example.com",
      });
      
      const res = mockResponse();
      
      // Call the handler directly
      await routeHandler(req, res);
      
      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Failed to generate QR code",
      });
      expect(logError).toHaveBeenCalled();
    });
    
    it("should validate input data", async () => {
      // Find the validation middleware
      const validationMiddleware = barcodesRouter.stack.find(
        layer => layer.route && layer.route.path === "/qrcode" && layer.route.methods.post
      ).route.stack[1].handle;
      
      // Create request with invalid data (invalid errorCorrectionLevel)
      const req = mockRequest("POST", "/qrcode", { 
        data: "https://example.com", 
        errorCorrectionLevel: "Z" // Invalid value
      });
      const res = mockResponse();
      const next = vi.fn();
      
      // Call the validation middleware
      validationMiddleware(req, res, next);
      
      // Validation should fail
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
      }));
    });
  });

  describe("GET /files/:filename", () => {
    it("should serve a file that exists", () => {
      // Mock file existence
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);
      
      // Find the route handler
      const routeHandler = barcodesRouter.stack.find(
        layer => layer.route && layer.route.path === "/files/:filename" && layer.route.methods.get
      ).route.stack[0].handle;
      
      // Create request
      const req = mockRequest("GET", "/files/barcode-123.png");
      const res = mockResponse();
      
      // Call the handler
      routeHandler(req, res);
      
      // Verify response
      expect(res.sendFile).toHaveBeenCalledWith(
        expect.stringContaining("barcode-123.png")
      );
    });
    
    it("should return 404 for non-existent files", () => {
      // Mock file not existing
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);
      
      // Find the route handler
      const routeHandler = barcodesRouter.stack.find(
        layer => layer.route && layer.route.path === "/files/:filename" && layer.route.methods.get
      ).route.stack[0].handle;
      
      // Create request
      const req = mockRequest("GET", "/files/nonexistent.png");
      const res = mockResponse();
      
      // Call the handler
      routeHandler(req, res);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "File not found",
      });
    });
    
    it("should handle errors when serving files", () => {
      // Mock file existing but then throw on sendFile
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);
      
      // Find the route handler
      const routeHandler = barcodesRouter.stack.find(
        layer => layer.route && layer.route.path === "/files/:filename" && layer.route.methods.get
      ).route.stack[0].handle;
      
      // Create request
      const req = mockRequest("GET", "/files/error.png");
      const res = mockResponse();
      
      // Mock sendFile to throw
      res.sendFile.mockImplementationOnce(() => {
        throw new Error("File serving error");
      });
      
      // Call the handler
      routeHandler(req, res);
      
      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "File serving error",
      });
      expect(logError).toHaveBeenCalled();
    });
  });
});