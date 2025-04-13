import { createCanvas } from "canvas";
import fs from "fs";
import JsBarcode from "jsbarcode";
import path from "path";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

import logger, { logError } from "../../logging";

// Ensure temp directory exists
const tempDir = path.join(process.cwd(), "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
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
}

interface QRCodeOptions {
  size?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  margin?: number;
  color?: string;
  backgroundColor?: string;
}

class BarcodeService {
  // Generate a barcode image
  async generateBarcode(
    data: string,
    options: BarcodeOptions,
  ): Promise<{ filePath: string; base64: string }> {
    try {
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
      });

      // Convert to base64
      const base64 = canvas.toDataURL("image/png").split(",")[1];

      // Save to file
      const fileName = `barcode-${uuidv4()}.png`;
      const filePath = path.join(tempDir, fileName);

      const buffer = Buffer.from(base64, "base64");
      fs.writeFileSync(filePath, buffer);

      logger.info(`Generated barcode: ${fileName}`);

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
        color: {
          dark: options.color || "#000000",
          light: options.backgroundColor || "#ffffff",
        },
      });

      // Convert to base64
      const base64 = canvas.toDataURL("image/png").split(",")[1];

      // Save to file
      const fileName = `qrcode-${uuidv4()}.png`;
      const filePath = path.join(tempDir, fileName);

      const buffer = Buffer.from(base64, "base64");
      fs.writeFileSync(filePath, buffer);

      logger.info(`Generated QR code: ${fileName}`);

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
      // Get all files in temp directory
      const files = fs.readdirSync(tempDir);

      // Get current time
      const now = Date.now();

      // Delete files older than 1 hour
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);

        // Check if file is older than 1 hour
        if (now - stats.mtimeMs > 60 * 60 * 1000) {
          fs.unlinkSync(filePath);
          logger.debug(`Deleted old temporary file: ${file}`);
        }
      }
    } catch (error) {
      logError("Failed to clean up temporary files", error);
    }
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
