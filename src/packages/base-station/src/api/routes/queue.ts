import express from "express";
import { z } from "zod";

import { logError } from "../../logging";
import { printQueueService } from "../../services/queue";
import type { ApiResponse } from "../../types";
import { authenticateApiKey, checkLocalNetwork } from "../middleware/auth";

const router = express.Router();

// Define types for request bodies and params
interface PriorityRequestBody {
  priority: number;
}

interface JobIdParam {
  id: string;
}

// Validation schemas with inferred types
const prioritySchema = z.object({
  priority: z.number().int().min(1).max(10),
});
// Use type inference from zod schema
type PrioritySchemaType = z.infer<typeof prioritySchema>;

// Validate request middleware
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
      });
      return;
    }

    // Type-safe assignment
    req.body = result.data as z.infer<T>;
    next();
  };
}

// Get all print jobs
router.get(
  "/",
  checkLocalNetwork,
  authenticateApiKey,
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const jobs = await printQueueService.getJobs();
      res.json({
        success: true,
        data: jobs,
      } as ApiResponse);
    } catch (error) {
      logError("Failed to get print jobs", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  },
);

// Get a specific print job
router.get(
  "/:id",
  checkLocalNetwork,
  authenticateApiKey,
  async (
    req: express.Request<{ id: string }>,
    res: express.Response,
  ): Promise<void> => {
    try {
      const job = await printQueueService.getJob(req.params.id);

      if (!job) {
        res.status(404).json({
          success: false,
          error: "Print job not found",
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: job,
      } as ApiResponse);
    } catch (error) {
      logError(`Failed to get print job ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  },
);

// Pause a print job
router.post(
  "/:id/pause",
  checkLocalNetwork,
  authenticateApiKey,
  async (
    req: express.Request<{ id: string }>,
    res: express.Response,
  ): Promise<void> => {
    try {
      await printQueueService.pauseJob(req.params.id);
      res.json({
        success: true,
      } as ApiResponse);
    } catch (error) {
      logError(`Failed to pause print job ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  },
);

// Resume a print job
router.post(
  "/:id/resume",
  checkLocalNetwork,
  authenticateApiKey,
  async (
    req: express.Request<{ id: string }>,
    res: express.Response,
  ): Promise<void> => {
    try {
      await printQueueService.resumeJob(req.params.id);
      res.json({
        success: true,
      } as ApiResponse);
    } catch (error) {
      logError(`Failed to resume print job ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  },
);

// Cancel a print job
router.delete(
  "/:id",
  checkLocalNetwork,
  authenticateApiKey,
  async (
    req: express.Request<{ id: string }>,
    res: express.Response,
  ): Promise<void> => {
    try {
      await printQueueService.cancelJob(req.params.id);
      res.json({
        success: true,
      } as ApiResponse);
    } catch (error) {
      logError(`Failed to cancel print job ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  },
);

// Update print job priority
router.put(
  "/:id/priority",
  checkLocalNetwork,
  authenticateApiKey,
  validateRequest(prioritySchema),
  async (
    req: express.Request<{ id: string }, {}, PriorityRequestBody>,
    res: express.Response,
  ): Promise<void> => {
    try {
      await printQueueService.updateJobPriority(
        req.params.id,
        req.body.priority,
      );
      res.json({
        success: true,
      } as ApiResponse);
    } catch (error) {
      logError(`Failed to update print job ${req.params.id} priority`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  },
);

// Pause all print jobs
router.post(
  "/pause-all",
  checkLocalNetwork,
  authenticateApiKey,
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      await printQueueService.pauseAllJobs();
      res.json({
        success: true,
      } as ApiResponse);
    } catch (error) {
      logError("Failed to pause all print jobs", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  },
);

// Resume all print jobs
router.post(
  "/resume-all",
  checkLocalNetwork,
  authenticateApiKey,
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      await printQueueService.resumeAllJobs();
      res.json({
        success: true,
      } as ApiResponse);
    } catch (error) {
      logError("Failed to resume all print jobs", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as ApiResponse);
    }
  },
);

export default router;
