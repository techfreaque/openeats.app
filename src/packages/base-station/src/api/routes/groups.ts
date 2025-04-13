import express from "express";
import { z } from "zod";

import { logError } from "../../logging";
import { printerGroupService } from "../../services/groups";
import type { ApiResponse } from "../../types";
import { authenticateApiKey, checkLocalNetwork } from "../middleware/auth";

const router = express.Router();

// Define strong types
type BalancingStrategy = "round-robin" | "least-busy" | "failover";

interface GroupCreate {
  name: string;
  description?: string | null;
  printers?: string[];
  balancingStrategy: BalancingStrategy;
  active?: boolean;
}

type GroupUpdate = Partial<GroupCreate>;

interface PrintersAssignment {
  printers: string[];
}

// Validation schemas with inferred types
const groupSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  printers: z.array(z.string()).optional(),
  balancingStrategy: z.enum(["round-robin", "least-busy", "failover"]),
  active: z.boolean().default(true),
});

const updateGroupSchema = groupSchema.partial();

const printersSchema = z.object({
  printers: z.array(z.string()),
});

// Type inference from schemas
type GroupSchemaType = z.infer<typeof groupSchema>;
type UpdateGroupSchemaType = z.infer<typeof updateGroupSchema>;
type PrintersSchemaType = z.infer<typeof printersSchema>;

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

// Get all printer groups
router.get("/", checkLocalNetwork, authenticateApiKey, async (req, res) => {
  try {
    const groups = await printerGroupService.getGroups();
    res.json({
      success: true,
      data: groups,
    });
  } catch (error) {
    logError("Failed to get printer groups", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Create a new printer group
router.post(
  "/",
  checkLocalNetwork,
  authenticateApiKey,
  validateRequest(groupSchema),
  async (req, res) => {
    try {
      const id = await printerGroupService.createGroup(req.body);
      res.status(201).json({
        success: true,
        data: { id },
      });
    } catch (error) {
      logError("Failed to create printer group", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

// Get a specific printer group
router.get("/:id", checkLocalNetwork, authenticateApiKey, async (req, res) => {
  try {
    const group = await printerGroupService.getGroup(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: "Printer group not found",
      });
    }

    res.json({
      success: true,
      data: group,
    });
  } catch (error) {
    logError(`Failed to get printer group ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Update a printer group
router.put(
  "/:id",
  checkLocalNetwork,
  authenticateApiKey,
  validateRequest(updateGroupSchema),
  async (req, res) => {
    try {
      await printerGroupService.updateGroup(req.params.id, req.body);
      res.json({
        success: true,
      });
    } catch (error) {
      logError(`Failed to update printer group ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

// Delete a printer group
router.delete(
  "/:id",
  checkLocalNetwork,
  authenticateApiKey,
  async (req, res) => {
    try {
      await printerGroupService.deleteGroup(req.params.id);
      res.json({
        success: true,
      });
    } catch (error) {
      logError(`Failed to delete printer group ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

// Assign printers to a group
router.post(
  "/:id/printers",
  checkLocalNetwork,
  authenticateApiKey,
  validateRequest(printersSchema),
  async (req, res) => {
    try {
      await printerGroupService.assignPrinters(
        req.params.id,
        req.body.printers,
      );
      res.json({
        success: true,
      });
    } catch (error) {
      logError(`Failed to assign printers to group ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

// Get group status
router.get(
  "/:id/status",
  checkLocalNetwork,
  authenticateApiKey,
  async (req, res) => {
    try {
      const status = await printerGroupService.getGroupStatus(req.params.id);
      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      logError(`Failed to get printer group status ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

export default router;
