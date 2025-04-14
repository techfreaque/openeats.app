import { createCanvas } from "canvas";
import fs from "fs";
import JsBarcode from "jsbarcode";
import path from "path";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

import logger, { logError } from "../../logging";

// Ensure temp directory exists
const tempDir = path.join(process.cwd(), "temp");
try {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
} catch (error) {
  logger.error(`Failed to create temp directory: ${error.message}`);
}

interface BarcodeOptions {
  type: "code128" | "ean13" | "upc" | "code39" | "itf" | "datamatrix";
  width?: number;
  height?: number;
  includeText?: boolean;
  fontSize?: number;
  margin?: number;
  background?: string;
  lineColor?: string;
  textMargin?: number;
  textPosition?: "top" | "bottom";
}

interface QRCodeOptions {
  size?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  margin?: number;
  color?: {
    dark: string;
    light: string;
  } | string;
  backgroundColor?: string;
}

class BarcodeService {
  // Generate a barcode image
  async generateBarcode(
    data: string,
    options: BarcodeOptions,
  ): Promise<{ filePath: string; base64: string }> {
    try {
      // Input validation
      if (!data) {
        throw new Error("Data is required");
      }

      // Validate barcode type
      const validTypes = ["code128", "ean13", "upc", "code39", "itf", "datamatrix"];
      if (!validTypes.includes(options.type)) {
        throw new Error("Unsupported barcode type");
      }

      // Specific validation for barcode types
      if (options.type === "ean13" && (data.length !== 12 && data.length !== 13)) {
        throw new Error("Invalid data length for EAN13 barcode");
      }

      // Create directory if it doesn't exist
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Check if we have a cached version
      const cachedFilePath = this.getCachedFilePath(data, options);
      if (fs.existsSync(cachedFilePath)) {
        logger.info(`Using cached barcode: ${path.basename(cachedFilePath)}`);
        // Read the file to get actual base64 content
        const buffer = fs.readFileSync(cachedFilePath);
        const base64 = buffer.toString('base64');
        return {
          filePath: cachedFilePath,
          base64,
        };
      }

      // Create canvas
      const canvas = createCanvas(options.width || 300, options.height || 100);

      // Generate barcode
      JsBarcode(canvas, data, {
        format: options.type,
        width: 2,
        height: options.height || 100,
        displayValue: options.includeText !== false,
        fontSize: options.fontSize || 20,
        margin: options.margin || 10,
        background: options.background || "#ffffff",
        lineColor: options.lineColor || "#000000",
        textMargin: options.textMargin || 2,
        textPosition: options.textPosition || "bottom",
      });

      // Convert to base64
      const base64 = canvas.toDataURL("image/png").split(",")[1];

      // Save to file using the hash-based filename
      const filePath = cachedFilePath;
      const buffer = Buffer.from(base64, "base64");
      fs.writeFileSync(filePath, buffer);

      logger.info(`Generated barcode: ${path.basename(filePath)}`);

      return {
        filePath,
        base64,
      };
    } catch (error) {
      logError("Failed to generate barcode", error);
      throw error;
    }
  }

  // Generate a QR code image
  async generateQRCode(
    data: string,
    options: QRCodeOptions,
  ): Promise<{ filePath: string; base64: string }> {
    try {
      // Input validation
      if (!data) {
        throw new Error("Data is required");
      }

      // Validate error correction level
      const validErrorLevels = ["L", "M", "Q", "H"];
      if (options.errorCorrectionLevel && !validErrorLevels.includes(options.errorCorrectionLevel)) {
        throw new Error("Invalid error correction level");
      }

      // Create directory if it doesn't exist
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Check if we have a cached version
      const cachedFilePath = this.getCachedFilePath(data, options, true);
      if (fs.existsSync(cachedFilePath)) {
        logger.info(`Using cached QR code: ${path.basename(cachedFilePath)}`);
        // Read the file to get actual base64 content
        const buffer = fs.readFileSync(cachedFilePath);
        const base64 = buffer.toString('base64');
        return {
          filePath: cachedFilePath,
          base64,
        };
      }

      // Create canvas
      const size = options.size || 300;
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext("2d");

      // Set background
      if (options.backgroundColor) {
        ctx.fillStyle = options.backgroundColor;
        ctx.fillRect(0, 0, size, size);
      }

      // Generate QR code
      await QRCode.toCanvas(canvas, data, {
        width: size,
        margin: options.margin || 4,
        errorCorrectionLevel: options.errorCorrectionLevel || "M",
        color: options.color || {
          dark: "#000000",
          light: options.backgroundColor || "#ffffff",
        },
      });

      // Convert to base64
      const base64 = canvas.toDataURL("image/png").split(",")[1];

      // Save to file using the hash-based filename
      const filePath = cachedFilePath;
      const buffer = Buffer.from(base64, "base64");
      fs.writeFileSync(filePath, buffer);

      logger.info(`Generated QR code: ${path.basename(filePath)}`);

      return {
        filePath,
        base64,
      };
    } catch (error) {
      logError("Failed to generate QR code", error);
      throw error;
    }
  }

  // Clean up temporary files
  async cleanupTempFiles(): Promise<void> {
    try {
      // Check if temp directory exists
      if (!fs.existsSync(tempDir)) {
        return;
      }

      // Get all files in temp directory
      const files = fs.readdirSync(tempDir);

      // Get current time
      const now = Date.now();

      // Delete files older than 1 hour
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        try {
          const stats = fs.statSync(filePath);

          // Check if file is older than 1 hour
          if (now - stats.mtimeMs > 60 * 60 * 1000) {
            fs.unlinkSync(filePath);
            logger.debug(`Deleted old temporary file: ${file}`);
          }
        } catch (error) {
          // Quietly handle file operation errors during cleanup
          logger.debug(`Could not process file during cleanup: ${file} - ${error.message}`);
        }
      }
    } catch (error) {
      logError("Failed to clean up temporary files", error);
      // Intentionally not re-throwing the error so it doesn't break other operations
    }
  }

  // Private helper to get a cached file path based on content hash
  private getCachedFilePath(data: string, options: any, isQR = false): string {
    // Create a hash of the data and options to use as a cache key
    const optionsString = JSON.stringify(options);
    const hash = crypto
      .createHash("md5")
      .update(`${data}-${optionsString}-${isQR ? "qr" : "barcode"}`)
      .digest("hex");
    
    const prefix = isQR ? "qrcode" : "barcode";
    return path.join(tempDir, `${prefix}-${hash}.png`);
  }
}

// Export a singleton instance
export const barcodeService = new BarcodeService();

// Clean up temporary files every hour
setInterval(
  () => {
    barcodeService.cleanupTempFiles();
  },
  60 * 60 * 1000,
);
