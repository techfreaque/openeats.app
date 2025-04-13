import express from "express";
import fs from "fs";
import path from "path";
import { z } from "zod";

import { logError } from "../../logging";
import { analyticsService } from "../../services/analytics";
import type { ApiResponse } from "../../types";
import { authenticateApiKey, checkLocalNetwork } from "../middleware/auth";

const router = express.Router();

// Define strong types for analytics query parameters
type Timeframe = "day" | "week" | "month" | "year" | "custom";

interface TimeframeQuery {
  timeframe: Timeframe;
  startDate?: string;
  endDate?: string;
  printers?: string[];
  categories?: string[];
}

// Validation schemas with type inference
const timeframeSchema = z
  .object({
    timeframe: z
      .enum(["day", "week", "month", "year", "custom"])
      .default("month"),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    printers: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
  })
  .refine(
    (data): boolean => {
      return data.timeframe !== "custom" || data.startDate !== undefined;
    },
    {
      message: "startDate is required for custom timeframe",
      path: ["startDate"],
    },
  );

// Type inference from schema
type TimeframeSchemaType = z.infer<typeof timeframeSchema>;

// Type-safe validation middleware
function validateRequest<T extends z.ZodType>(schema: T) {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error.errors.map((e) => e.message).join(", "),
      } as ApiResponse);
      return;
    }

    req.query = result.data as z.infer<T>;
    next();
  };
}

// Type-safe array parameter parsing
function parseArrayParams(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  // Parse printers parameter
  if (req.query.printers && typeof req.query.printers === "string") {
    req.query.printers = req.query.printers.split(",");
  }

  // Parse categories parameter
  if (req.query.categories && typeof req.query.categories === "string") {
    req.query.categories = req.query.categories.split(",");
  }

  next();
}

// Get analytics summary
router.get(
  "/summary",
  checkLocalNetwork,
  authenticateApiKey,
  parseArrayParams,
  validateRequest(timeframeSchema),
  async (req, res) => {
    try {
      const summary = await analyticsService.getSummary(req.query);
      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      logError("Failed to get analytics summary", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  },
);

// Get print job statistics
router.get(
  "/jobs",
  checkLocalNetwork,
  authenticateApiKey,
  parseArrayParams,
  validateRequest(timeframeSchema),
  async (req, res) => {
    try {
      const statistics = await analyticsService.getJobStatistics(req.query);
      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      logError("Failed to get job statistics", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  },
);

// Get printer statistics
router.get(
  "/printers",
  checkLocalNetwork,
  authenticateApiKey,
  parseArrayParams,
  validateRequest(timeframeSchema),
  async (req, res) => {
    try {
      const statistics = await analyticsService.getPrinterStatistics(req.query);
      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      logError("Failed to get printer statistics", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  },
);

// Get error statistics
router.get(
  "/errors",
  checkLocalNetwork,
  authenticateApiKey,
  parseArrayParams,
  validateRequest(timeframeSchema),
  async (req, res) => {
    try {
      const statistics = await analyticsService.getErrorStatistics(req.query);
      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      logError("Failed to get error statistics", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  },
);

// Export analytics data
router.get(
  "/export",
  checkLocalNetwork,
  authenticateApiKey,
  parseArrayParams,
  validateRequest(timeframeSchema),
  async (req, res) => {
    try {
      const fileName = await analyticsService.exportData(req.query);
      res.json({
        success: true,
        data: {
          url: `/api/analytics/files/${fileName}`,
          fileName,
        },
      });
    } catch (error) {
      logError("Failed to export analytics data", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  },
);

// Serve exported files
router.get(
  "/files/:filename",
  checkLocalNetwork,
  authenticateApiKey,
  (req, res) => {
    try {
      const filePath = path.join(process.cwd(), "temp", req.params.filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: "File not found",
        } as ApiResponse);
      }

      // Send file
      res.download(filePath);
    } catch (error) {
      logError(`Failed to serve file: ${req.params.filename}`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  },
);

export default router;
