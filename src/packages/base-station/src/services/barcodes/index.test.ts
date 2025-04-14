import fs from "fs";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { barcodeService } from "./index";

// Mock the fs module properly for Vitest
vi.mock("fs", () => {
  const mockFs = {
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn().mockReturnValue(Buffer.from("test")),
    unlinkSync: vi.fn(),
    readdirSync: vi.fn().mockReturnValue(["test.png"]),
    statSync: vi.fn().mockReturnValue({
      mtimeMs: Date.now() - 2 * 60 * 60 * 1000, // 2 hours old
    }),
  };

  // Make sure the default export works
  mockFs.default = mockFs;

  return mockFs;
});

// Mock the canvas module
vi.mock("canvas", () => {
  const mockContext = {
    fillStyle: "",
    font: "",
    fillRect: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
  };

  const mockCanvas = {
    getContext: vi.fn().mockReturnValue(mockContext),
    toDataURL: vi.fn().mockReturnValue("data:image/png;base64,test"),
    width: 300,
    height: 200,
  };

  return {
    createCanvas: vi.fn().mockReturnValue(mockCanvas),
    loadImage: vi.fn().mockResolvedValue({
      width: 100,
      height: 100,
    }),
  };
});

// Set up test spies that will actually be used in the tests
const jsBarcodeSpy = vi.fn();
const qrCodeSpy = vi.fn().mockResolvedValue(undefined);

// Mock the JsBarcode module properly
vi.mock("jsbarcode", () => {
  return {
    __esModule: true,
    default: jsBarcodeSpy
  };
});

// Mock the QRCode module properly
vi.mock("qrcode", () => {
  return {
    __esModule: true,
    default: {
      toCanvas: qrCodeSpy
    },
    toCanvas: qrCodeSpy
  };
});

// Mock the logging module
vi.mock("../../logging", () => {
  return {
    default: {
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
    },
    logError: vi.fn(),
  };
});

// Mock crypto module
vi.mock("crypto", () => {
  const mockCrypto = {
    createHash: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue("mockhash")
    })
  };
  
  // Ensure default export
  return {
    ...mockCrypto,
    default: mockCrypto
  };
});

describe("Barcode Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateBarcode", () => {
    it("should generate a barcode image", async () => {
      const data = "12345678";
      const options = {
        type: "code128" as const,
        width: 300,
        height: 100,
        includeText: true,
      };

      const result = await barcodeService.generateBarcode(data, options);

      expect(result).toBeDefined();
      expect(result.filePath).toBeDefined();
      expect(result.base64).toBe("test");

      // Check if JsBarcode was called
      expect(JsBarcode).toHaveBeenCalled();

      // Check if file was written
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      // Mock JsBarcode to throw an error
      JsBarcode.mockImplementationOnce(() => {
        throw new Error("Test error");
      });

      await expect(
        barcodeService.generateBarcode("12345", { type: "code128" }),
      ).rejects.toThrow("Test error");
    });
  });

  describe("generateQRCode", () => {
    it("should generate a QR code image", async () => {
      const data = "https://example.com";
      const options = {
        size: 300,
        errorCorrectionLevel: "M" as const,
        margin: 4,
      };

      const result = await barcodeService.generateQRCode(data, options);

      expect(result).toBeDefined();
      expect(result.filePath).toBeDefined();
      expect(result.base64).toBe("test");

      // Check if QRCode.toCanvas was called
      expect(QRCode.toCanvas).toHaveBeenCalled();

      // Check if file was written
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      // Mock QRCode.toCanvas to throw an error
      QRCode.toCanvas.mockRejectedValueOnce(new Error("Test error"));

      await expect(
        barcodeService.generateQRCode("https://example.com", {}),
      ).rejects.toThrow("Test error");
    });
  });

  describe("cleanupTempFiles", () => {
    it("should delete old temporary files", async () => {
      await barcodeService.cleanupTempFiles();

      // Check if fs.readdirSync was called
      expect(fs.readdirSync).toHaveBeenCalled();

      // Check if fs.statSync was called
      expect(fs.statSync).toHaveBeenCalled();

      // Check if fs.unlinkSync was called
      expect(fs.unlinkSync).toHaveBeenCalled();
    });
  });

  describe("directory management", () => {
    it("should create temp directory if it doesn't exist", async () => {
      // Mock fs.existsSync to return false to simulate missing directory
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);
      
      // Call a method that would check for the directory
      await barcodeService.generateBarcode("test", { type: "code128" });
      
      // Verify directory creation was attempted
      expect(fs.mkdirSync).toHaveBeenCalled();
    });
    
    it("should handle directory creation errors", async () => {
      // Mock fs.existsSync to return false
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);
      
      // Mock fs.mkdirSync to throw an error
      vi.mocked(fs.mkdirSync).mockImplementationOnce(() => {
        throw new Error("Permission denied");
      });
      
      // Attempt to generate a barcode, which should fail
      await expect(
        barcodeService.generateBarcode("test", { type: "code128" })
      ).rejects.toThrow("Permission denied");
    });
  });
  
  describe("file handling", () => {
    it("should handle file write errors", async () => {
      // Mock fs.writeFileSync to throw an error
      vi.mocked(fs.writeFileSync).mockImplementationOnce(() => {
        throw new Error("Disk full");
      });
      
      // Attempt to generate a barcode, which should fail due to write error
      await expect(
        barcodeService.generateBarcode("test", { type: "code128" })
      ).rejects.toThrow("Disk full");
    });
    
    it("should handle file delete errors during cleanup", async () => {
      // Mock to simulate a file that's old enough to be deleted
      vi.mocked(fs.readdirSync).mockReturnValueOnce(["old-file.png"]);
      vi.mocked(fs.statSync).mockReturnValueOnce({
        mtimeMs: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days old
      } as any);
      
      // Mock unlinkSync to throw an error
      vi.mocked(fs.unlinkSync).mockImplementationOnce(() => {
        throw new Error("File in use");
      });
      
      // Should not throw even if deleting fails
      await expect(barcodeService.cleanupTempFiles()).resolves.not.toThrow();
    });
  });
  
  describe("barcode options", () => {
    it("should apply different barcode types", async () => {
      // Test different barcode types (code39, ean13, etc.)
      const types = ["code39", "ean13", "upc"];
      
      for (const type of types) {
        await barcodeService.generateBarcode("12345678", { 
          type: type as any
        });
        
        // Verify JsBarcode was called with the correct format
        expect(JsBarcode).toHaveBeenCalledWith(
          expect.anything(),
          "12345678",
          expect.objectContaining({ format: type })
        );
      }
    });
    
    it("should handle custom colors", async () => {
      await barcodeService.generateBarcode("12345678", {
        type: "code128",
        lineColor: "#FF0000",
        background: "#EEEEEE"
      });
      
      // Verify colors were passed correctly
      expect(JsBarcode).toHaveBeenCalledWith(
        expect.anything(),
        "12345678",
        expect.objectContaining({ 
          lineColor: "#FF0000",
          background: "#EEEEEE"
        })
      );
    });
    
    it("should apply text options correctly", async () => {
      await barcodeService.generateBarcode("12345678", {
        type: "code128",
        includeText: true,
        fontSize: 16,
        textMargin: 5,
        textPosition: "bottom"
      });
      
      // Verify text options were passed correctly
      expect(JsBarcode).toHaveBeenCalledWith(
        expect.anything(),
        "12345678",
        expect.objectContaining({ 
          displayValue: true,
          fontSize: 16,
          textMargin: 5,
          textPosition: "bottom"
        })
      );
    });
  });
  
  describe("QR code options", () => {
    it("should apply different error correction levels", async () => {
      const levels = ["L", "M", "Q", "H"];
      
      for (const level of levels) {
        await barcodeService.generateQRCode("https://example.com", { 
          errorCorrectionLevel: level as any 
        });
        
        // Verify QRCode was called with correct error correction level
        expect(QRCode.toCanvas).toHaveBeenCalledWith(
          expect.anything(),
          "https://example.com",
          expect.objectContaining({ errorCorrectionLevel: level })
        );
      }
    });
    
    it("should handle custom margins", async () => {
      await barcodeService.generateQRCode("https://example.com", { 
        margin: 8
      });
      
      // Verify margin was passed correctly
      expect(QRCode.toCanvas).toHaveBeenCalledWith(
        expect.anything(),
        "https://example.com",
        expect.objectContaining({ margin: 8 })
      );
    });
    
    it("should handle custom colors", async () => {
      await barcodeService.generateQRCode("https://example.com", {
        color: { dark: "#000000", light: "#FFFFFF" }
      });
      
      // Verify colors were passed correctly
      expect(QRCode.toCanvas).toHaveBeenCalledWith(
        expect.anything(),
        "https://example.com",
        expect.objectContaining({ 
          color: { dark: "#000000", light: "#FFFFFF" }
        })
      );
    });
  });
  
  describe("input validation", () => {
    it("should validate barcode data length", async () => {
      // Test EAN13 which requires exactly 12 or 13 digits
      await expect(
        barcodeService.generateBarcode("123", { type: "ean13" })
      ).rejects.toThrow("Invalid data length");
      
      // Valid EAN13 should work
      await barcodeService.generateBarcode("123456789012", { type: "ean13" });
      expect(JsBarcode).toHaveBeenCalled();
    });
    
    it("should handle empty input data", async () => {
      await expect(
        barcodeService.generateBarcode("", { type: "code128" })
      ).rejects.toThrow("Data is required");
      
      await expect(
        barcodeService.generateQRCode("", {})
      ).rejects.toThrow("Data is required");
    });
    
    it("should handle invalid options", async () => {
      // Invalid barcode type
      await expect(
        barcodeService.generateBarcode("12345", { type: "invalid" as any })
      ).rejects.toThrow("Unsupported barcode type");
      
      // Invalid QR error correction level
      await expect(
        barcodeService.generateQRCode("https://example.com", { 
          errorCorrectionLevel: "X" as any 
        })
      ).rejects.toThrow("Invalid error correction level");
    });
  });
  
  describe("file caching", () => {
    it("should reuse existing barcode file if available", async () => {
      const data = "987654321";
      const options = { type: "code128" as const };
      
      // Mock cache check to return a cached file path
      const cachedFilePath = "/path/to/cached-barcode.png";
      vi.spyOn(barcodeService as any, "getCachedFilePath").mockReturnValueOnce(cachedFilePath);
      
      // Mock fs.existsSync for the specific cached file
      vi.mocked(fs.existsSync).mockImplementation((path) => {
        return path === cachedFilePath;
      });
      
      const result = await barcodeService.generateBarcode(data, options);
      
      // Should return the cached file
      expect(result.filePath).toBe(cachedFilePath);
      
      // JsBarcode should not be called (reusing cached file)
      expect(JsBarcode).not.toHaveBeenCalled();
    });
    
    it("should generate new file if cached one doesn't exist", async () => {
      const data = "987654321";
      const options = { type: "code128" as const };
      
      // Mock cache check to return a cached file path
      const cachedFilePath = "/path/to/cached-barcode.png";
      vi.spyOn(barcodeService as any, "getCachedFilePath").mockReturnValueOnce(cachedFilePath);
      
      // Mock fs.existsSync to return false for the cached file
      vi.mocked(fs.existsSync).mockReturnValueOnce(true); // For temp dir
      vi.mocked(fs.existsSync).mockReturnValueOnce(false); // For cached file
      
      await barcodeService.generateBarcode(data, options);
      
      // JsBarcode should be called (generating new file)
      expect(JsBarcode).toHaveBeenCalled();
    });
  });
});
