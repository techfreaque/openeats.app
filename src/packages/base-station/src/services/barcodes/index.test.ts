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

// Mock the JsBarcode module
vi.mock("jsbarcode", () => {
  return {
    default: vi.fn(),
  };
});

// Mock the QRCode module
vi.mock("qrcode", () => {
  const mockQRCode = {
    toCanvas: vi.fn().mockResolvedValue(undefined),
  };
  mockQRCode.default = mockQRCode;
  return mockQRCode;
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
});
