import express from "express";
import { z } from "zod";

import { logError } from "../../logging";
import { printerCategoryService } from "../../services/categories";
import type { ApiResponse, PrintOptions, RoutingRule } from "../../types";
import { authenticateApiKey, checkLocalNetwork } from "../middleware/auth";

const router = express.Router();

// Define strong types for category related objects
interface CategoryCreate {
  name: string;
  description?: string | null;
  printers?: string[];
  defaultOptions?: PrintOptions;
  routingRules?: RoutingRule[];
}

type CategoryUpdate = Partial<CategoryCreate>;

interface PrintersAssignment {
  printers: string[];
}

// Validation schemas with strict typing
const routingRuleSchema = z.object({
  field: z.string().min(1),
  pattern: z.string().min(1),
  matchType: z.enum(["exact", "contains", "regex"]),
});

const defaultOptionsSchema = z
  .object({
    copies: z.number().int().positive().optional(),
    duplex: z.boolean().optional(),
    orientation: z.enum(["portrait", "landscape"]).optional(),
    paperSize: z.string().optional(),
    bluetooth: z.boolean().optional(),
  })
  .catchall(z.unknown()); // For additional properties that might be added in the future

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  printers: z.array(z.string()).optional(),
  defaultOptions: defaultOptionsSchema.optional(),
  routingRules: z.array(routingRuleSchema).optional(),
});

const updateCategorySchema = categorySchema.partial();

const printersSchema = z.object({
  printers: z.array(z.string()),
});

// Type inference from schemas
type RoutingRuleSchemaType = z.infer<typeof routingRuleSchema>;
type CategorySchemaType = z.infer<typeof categorySchema>;
type UpdateCategorySchemaType = z.infer<typeof updateCategorySchema>;
type PrintersSchemaType = z.infer<typeof printersSchema>;

// Validate request middleware with generic type parameter
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

// Get all printer categories
router.get("/", checkLocalNetwork, authenticateApiKey, async (req, res) => {
  try {
    const categories = await printerCategoryService.getCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    logError("Failed to get printer categories", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Create a new printer category
router.post(
  "/",
  checkLocalNetwork,
  authenticateApiKey,
  validateRequest(categorySchema),
  async (req, res) => {
    try {
      const id = await printerCategoryService.createCategory(req.body);
      res.status(201).json({
        success: true,
        data: { id },
      });
    } catch (error) {
      logError("Failed to create printer category", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

// Get a specific printer category
router.get("/:id", checkLocalNetwork, authenticateApiKey, async (req, res) => {
  try {
    const category = await printerCategoryService.getCategory(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Printer category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    logError(`Failed to get printer category ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Update a printer category
router.put(
  "/:id",
  checkLocalNetwork,
  authenticateApiKey,
  validateRequest(updateCategorySchema),
  async (req, res) => {
    try {
      await printerCategoryService.updateCategory(req.params.id, req.body);
      res.json({
        success: true,
      });
    } catch (error) {
      logError(`Failed to update printer category ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

// Delete a printer category
router.delete(
  "/:id",
  checkLocalNetwork,
  authenticateApiKey,
  async (req, res) => {
    try {
      await printerCategoryService.deleteCategory(req.params.id);
      res.json({
        success: true,
      });
    } catch (error) {
      logError(`Failed to delete printer category ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

// Assign printers to a category
router.post(
  "/:id/printers",
  checkLocalNetwork,
  authenticateApiKey,
  validateRequest(printersSchema),
  async (req, res) => {
    try {
      await printerCategoryService.assignPrinters(
        req.params.id,
        req.body.printers,
      );
      res.json({
        success: true,
      });
    } catch (error) {
      logError(`Failed to assign printers to category ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

export default router;
