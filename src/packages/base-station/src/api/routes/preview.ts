import express from "express";
import path from "path";
import { z } from "zod";

import { logError } from "../../logging";
import { printPreviewService } from "../../services/preview";
import { authenticateApiKey } from "../middleware/auth";

const router = express.Router();

// Validation schemas
const previewSchema = z.object({
  content: z.string(),
  contentType: z.enum(["raw", "html", "markdown", "image"]),
  fileName: z.string(),
  options: z
    .object({
      width: z.number().int().min(50).max(2000).optional(),
      height: z.number().int().min(50).max(2000).optional(),
      format: z.enum(["png", "jpeg", "pdf"]).optional(),
      dpi: z.number().int().min(72).max(600).optional(),
      copies: z.number().int().min(1).max(100).optional(),
      duplex: z.boolean().optional(),
      orientation: z.enum(["portrait", "landscape"]).optional(),
      paperSize: z.string().optional(),
      bluetooth: z.boolean().optional(),
      category: z.string().optional(),
      group: z.string().optional(),
      priority: z.number().int().min(1).max(10).optional(),
      maxRetries: z.number().int().min(0).max(10).optional(),
      retryDelay: z.number().int().min(0).max(60000).optional(),
      labelOptions: z.record(z.unknown()).optional(),
      imageOptions: z.record(z.unknown()).optional(),
    })
    .optional(),
});

// Validate request middleware
function validateRequest(schema: z.ZodSchema) {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error.errors.map((e) => e.message).join(", "),
      });
    }

    next();
  };
}

// Generate a preview
router.post(
  "/",
  authenticateApiKey,
  validateRequest(previewSchema),
  async (req, res) => {
    try {
      const { content, contentType, fileName, options } = req.body;

      const result = await printPreviewService.generatePreview(
        content,
        contentType,
        fileName,
        options,
      );

      res.json({
        success: true,
        data: {
          url: `/api/preview/files/${path.basename(result.filePath)}`,
          base64: result.base64,
        },
      });
    } catch (error) {
      logError("Failed to generate preview", error);
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
    if (!require("fs").existsSync(filePath)) {
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
