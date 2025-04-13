import fs from "fs";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

import { barcodeService } from "../../../src/services/barcodes";

// Mock the fs module
jest.mock("fs", () => {
  return {
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    unlinkSync: jest.fn(),
    readdirSync: jest.fn().mockReturnValue(["test.png"]),
    statSync: jest.fn().mockReturnValue({
      mtimeMs: Date.now() - 2 * 60 * 60 * 1000, // 2 hours old
    }),
  };
});

// Mock the canvas module
jest.mock("canvas", () => {
  const mockCanvas = {
    toDataURL: jest.fn().mockReturnValue("data:image/png;base64,test"),
  };

  return {
    createCanvas: jest.fn().mockReturnValue(mockCanvas),
    loadImage: jest.fn().mockResolvedValue({}),
  };
});

// Mock the JsBarcode module
jest.mock("jsbarcode", () => {
  return jest.fn();
});

// Mock the QRCode module
jest.mock("qrcode", () => {
  return {
    toCanvas: jest.fn().mockResolvedValue(undefined),
  };
});

describe("Barcode Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      (JsBarcode as jest.Mock).mockImplementationOnce(() => {
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
      (QRCode.toCanvas as jest.Mock).mockRejectedValueOnce(
        new Error("Test error"),
      );

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
