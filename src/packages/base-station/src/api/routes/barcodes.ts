import express from "express";
import fs from "fs";
import path from "path";
import { z } from "zod";

import { logError } from "../../logging";
import { barcodeService } from "../../services/barcodes";
import type { ApiResponse } from "../../types";
import { authenticateApiKey } from "../middleware/auth";

const router = express.Router();

// Define strong types for barcode parameters
type BarcodeType =
  | "code128"
  | "ean13"
  | "upc"
  | "code39"
  | "itf"
  | "datamatrix";
type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

interface BarcodeOptions {
  type: BarcodeType;
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
  errorCorrectionLevel?: ErrorCorrectionLevel;
  margin?: number;
  color?: string;
  backgroundColor?: string;
}

interface BarcodeGenerationResult {
  url: string;
  base64: string;
}

// Hex color validation regex
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

// Validation schemas with proper typing
const barcodeSchema = z.object({
  data: z.string().min(1),
  type: z.enum(["code128", "ean13", "upc", "code39", "itf", "datamatrix"]),
  width: z.number().int().min(50).max(1000).optional(),
  height: z.number().int().min(50).max(1000).optional(),
  includeText: z.boolean().optional(),
  fontSize: z.number().int().min(8).max(72).optional(),
  margin: z.number().int().min(0).max(50).optional(),
  background: z.string().regex(hexColorRegex).optional(),
  lineColor: z.string().regex(hexColorRegex).optional(),
});

const qrcodeSchema = z.object({
  data: z.string().min(1),
  size: z.number().int().min(50).max(1000).optional(),
  errorCorrectionLevel: z.enum(["L", "M", "Q", "H"]).optional(),
  margin: z.number().int().min(0).max(50).optional(),
  color: z.string().regex(hexColorRegex).optional(),
  backgroundColor: z.string().regex(hexColorRegex).optional(),
});

// Type inference from schemas
type BarcodeSchemaType = z.infer<typeof barcodeSchema>;
type QRCodeSchemaType = z.infer<typeof qrcodeSchema>;

// Type-safe validation middleware
function validateRequest<T extends z.ZodType>(schema: T) {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error.errors.map((e) => e.message).join(", "),
      } as ApiResponse);
      return;
    }

    req.body = result.data as z.infer<T>;
    next();
  };
}

// Generate a barcode
router.post(
  "/barcode",
  authenticateApiKey,
  validateRequest(barcodeSchema),
  async (req, res) => {
    try {
      const { data, ...options } = req.body;

      const result = await barcodeService.generateBarcode(data, options);

      res.json({
        success: true,
        data: {
          url: `/api/barcodes/files/${path.basename(result.filePath)}`,
          base64: result.base64,
        },
      });
    } catch (error) {
      logError("Failed to generate barcode", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

// Generate a QR code
router.post(
  "/qrcode",
  authenticateApiKey,
  validateRequest(qrcodeSchema),
  async (req, res) => {
    try {
      const { data, ...options } = req.body;

      const result = await barcodeService.generateQRCode(data, options);

      res.json({
        success: true,
        data: {
          url: `/api/barcodes/files/${path.basename(result.filePath)}`,
          base64: result.base64,
        },
      });
    } catch (error) {
      logError("Failed to generate QR code", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

// Serve generated files
router.get("/files/:filename", (req, res) => {
  try {
    const filePath = path.join(process.cwd(), "temp", req.params.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    logError(`Failed to serve file: ${req.params.filename}`, error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
