import { v4 as uuidv4 } from "uuid";

import { db } from "../../db";
import logger, { logError } from "../../logging";
import { playSound } from "../../notifications";
import { printerService } from "../../printing";
import type { PrintJob, PrintOptions } from "../../types";
import { wsClient } from "../../websocket/client";

class PrintQueueService {
  private processingQueue = false;

  // Add a job to the queue
  async addJob(
    fileContent: string,
    fileName: string,
    options?: PrintOptions,
  ): Promise<string> {
    try {
      const database = await db;

      const jobId = uuidv4();
      const now = new Date().toISOString();

      await database.run(
        `INSERT INTO print_jobs (
          id, status, created_at, updated_at, file_name, printer, priority, options, content
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          jobId,
          "pending",
          now,
          now,
          fileName,
          options?.printer || null,
          options?.priority || 1,
          JSON.stringify(options || {}),
          fileContent,
        ],
      );

      logger.info(`Added print job ${jobId} to queue: ${fileName}`);

      // Play new order sound
      await playSound("newOrder").catch((err) =>
        logger.error(`Failed to play new order sound: ${err}`),
      );

      // Emit WebSocket event
      this.emitQueueUpdated();

      // Start processing queue if not already processing
      if (!this.processingQueue) {
        this.processQueue();
      }

      return jobId;
    } catch (error) {
      logError("Failed to add job to queue", error);
      throw error;
    }
  }

  // Get all jobs in the queue
  async getJobs(): Promise<PrintJob[]> {
    try {
      const database = await db;

      const rows = await database.all(
        `SELECT id, status, created_at, updated_at, file_name, printer, priority, retries, error, options
         FROM print_jobs
         ORDER BY 
           CASE status
             WHEN 'printing' THEN 1
             WHEN 'pending' THEN 2
             WHEN 'paused' THEN 3
             WHEN 'completed' THEN 4
             WHEN 'failed' THEN 5
             ELSE 6
           END,
           priority DESC,
           created_at ASC`,
      );

      return rows.map((row) => ({
        id: row.id,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        fileName: row.file_name,
        printer: row.printer,
        priority: row.priority,
        retries: row.retries,
        error: row.error,
        options: JSON.parse(row.options || "{}"),
      }));
    } catch (error) {
      logError("Failed to get jobs from queue", error);
      throw error;
    }
  }

  // Get a specific job
  async getJob(jobId: string): Promise<PrintJob | null> {
    try {
      const database = await db;

      const row = await database.get(
        `SELECT id, status, created_at, updated_at, file_name, printer, priority, retries, error, options
         FROM print_jobs
         WHERE id = ?`,
        [jobId],
      );

      if (!row) {
        return null;
      }

      return {
        id: row.id,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        fileName: row.file_name,
        printer: row.printer,
        priority: row.priority,
        retries: row.retries,
        error: row.error,
        options: JSON.parse(row.options || "{}"),
      };
    } catch (error) {
      logError(`Failed to get job ${jobId}`, error);
      throw error;
    }
  }

  // Update job status
  async updateJobStatus(
    jobId: string,
    status: "pending" | "printing" | "paused" | "completed" | "failed",
    error?: string,
  ): Promise<void> {
    try {
      const database = await db;
      const now = new Date().toISOString();

      await database.run(
        `UPDATE print_jobs
         SET status = ?, updated_at = ?, error = ?
         WHERE id = ?`,
        [status, now, error || null, jobId],
      );

      logger.info(`Updated job ${jobId} status to ${status}`);

      // Play sound for completed or failed jobs
      if (status === "completed") {
        await playSound("printSuccess").catch((err) =>
          logger.error(`Failed to play print success sound: ${err}`),
        );
      } else if (status === "failed") {
        await playSound("printError").catch((err) =>
          logger.error(`Failed to play print error sound: ${err}`),
        );
      }

      // Emit WebSocket events
      this.emitJobStatusChanged(jobId, status);
      this.emitQueueUpdated();

      // If a job was paused or completed, process the next job
      if (
        status === "paused" ||
        status === "completed" ||
        status === "failed"
      ) {
        this.processQueue();
      }
    } catch (error) {
      logError(`Failed to update job ${jobId} status`, error);
      throw error;
    }
  }

  // Pause a job
  async pauseJob(jobId: string): Promise<void> {
    try {
      const database = await db;
      
      // First check if the job exists
      const job = await database.get("SELECT * FROM print_jobs WHERE id = ?", [jobId]);
      
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }
      
      // Only pause pending or printing jobs
      if (job.status === "pending" || job.status === "printing") {
        logger.info(`Pausing job ${jobId}, current status: ${job.status}`);
        
        await database.run(
          "UPDATE print_jobs SET status = ?, updated_at = ? WHERE id = ?",
          ["paused", new Date().toISOString(), jobId]
        );
        
        // Verify update was successful
        const updated = await database.get("SELECT status FROM print_jobs WHERE id = ?", [jobId]);
        logger.debug(`After update, job ${jobId} status: ${updated?.status}`);
        
        // Emit WebSocket events
        this.emitJobStatusChanged(jobId, "paused");
        this.emitQueueUpdated();
      }
    } catch (error) {
      logError(`Failed to pause job ${jobId}`, error);
      throw error;
    }
  }

  // Resume a job
  async resumeJob(jobId: string): Promise<void> {
    try {
      const database = await db;
      
      // First check if the job exists
      const job = await database.get("SELECT * FROM print_jobs WHERE id = ?", [jobId]);
      
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }
      
      // Only resume paused jobs
      if (job.status === "paused") {
        logger.info(`Resuming job ${jobId}, current status: ${job.status}`);
        
        await database.run(
          "UPDATE print_jobs SET status = ?, updated_at = ? WHERE id = ?",
          ["pending", new Date().toISOString(), jobId]
        );
        
        // Verify update was successful
        const updated = await database.get("SELECT status FROM print_jobs WHERE id = ?", [jobId]);
        logger.debug(`After update, job ${jobId} status: ${updated?.status}`);
        
        // Emit events and maybe process queue
        this.emitJobStatusChanged(jobId, "pending");
        this.emitQueueUpdated();
        this.processQueue();
      }
    } catch (error) {
      logError(`Failed to resume job ${jobId}`, error);
      throw error;
    }
  }

  // Cancel a job
  async cancelJob(jobId: string): Promise<void> {
    try {
      const database = await db;

      // Check if the job exists
      const job = await this.getJob(jobId);

      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      // Delete the job
      await database.run("DELETE FROM print_jobs WHERE id = ?", [jobId]);

      logger.info(`Cancelled and removed job ${jobId}`);

      // Emit WebSocket event
      this.emitQueueUpdated();
    } catch (error) {
      logError(`Failed to cancel job ${jobId}`, error);
      throw error;
    }
  }

  // Update job priority
  async updateJobPriority(jobId: string, priority: number): Promise<void> {
    try {
      const database = await db;
      const now = new Date().toISOString();

      await database.run(
        `UPDATE print_jobs
         SET priority = ?, updated_at = ?
         WHERE id = ?`,
        [priority, now, jobId],
      );

      logger.info(`Updated job ${jobId} priority to ${priority}`);

      // Emit WebSocket event
      this.emitQueueUpdated();
    } catch (error) {
      logError(`Failed to update job ${jobId} priority`, error);
      throw error;
    }
  }

  // Pause all jobs
  async pauseAllJobs(): Promise<void> {
    try {
      const database = await db;
      const now = new Date().toISOString();

      // Get count of affected rows
      const result = await database.run(
        `UPDATE print_jobs
         SET status = 'paused', updated_at = ?
         WHERE status IN ('pending', 'printing')`,
        [now]
      );

      logger.info(`Paused ${result.changes || 0} jobs`);

      // Emit WebSocket event
      this.emitQueueUpdated();
    } catch (error) {
      logError("Failed to pause all jobs", error);
      throw error;
    }
  }

  // Resume all jobs
  async resumeAllJobs(): Promise<void> {
    try {
      const database = await db;
      const now = new Date().toISOString();

      // Get count of affected rows
      const result = await database.run(
        `UPDATE print_jobs
         SET status = 'pending', updated_at = ?
         WHERE status = 'paused'`,
        [now]
      );

      logger.info(`Resumed ${result.changes || 0} jobs`);

      // Emit WebSocket event
      this.emitQueueUpdated();

      // Process the queue
      this.processQueue();
    } catch (error) {
      logError("Failed to resume all jobs", error);
      throw error;
    }
  }

  // Process the print queue
  private async processQueue(): Promise<void> {
    // If already processing, return
    if (this.processingQueue) {
      return;
    }

    this.processingQueue = true;

    try {
      const database = await db;

      // Get the next pending job with highest priority
      const nextJob = await database.get(
        `SELECT id, file_name, printer, options, content, retries
         FROM print_jobs
         WHERE status = 'pending'
         ORDER BY priority DESC, created_at ASC
         LIMIT 1`,
      );

      if (!nextJob) {
        this.processingQueue = false;
        return;
      }

      // Update job status to printing
      await this.updateJobStatus(nextJob.id, "printing");

      // Parse options
      const options = JSON.parse(nextJob.options || "{}");

      // Print the job
      try {
        const result = await printerService.print(
          nextJob.content,
          nextJob.file_name,
          {
            ...options,
            printer: nextJob.printer || options.printer,
          },
        );

        if (result.success) {
          // Update job status to completed
          await this.updateJobStatus(nextJob.id, "completed");

          // Add to analytics
          await this.addToAnalytics(nextJob.id, "completed");
        } else {
          // Check if we should retry
          const maxRetries = options.maxRetries || 3;

          if (nextJob.retries < maxRetries) {
            // Increment retry count
            await database.run(
              `UPDATE print_jobs
               SET retries = retries + 1, updated_at = ?
               WHERE id = ?`,
              [new Date().toISOString(), nextJob.id],
            );

            // Set status back to pending
            await this.updateJobStatus(nextJob.id, "pending");

            logger.info(
              `Job ${nextJob.id} failed, retrying (${nextJob.retries + 1}/${maxRetries})`,
            );
          } else {
            // Max retries reached, mark as failed
            await this.updateJobStatus(nextJob.id, "failed", result.error);

            // Add to analytics
            await this.addToAnalytics(nextJob.id, "failed", result.error);
          }
        }
      } catch (error) {
        // Handle unexpected errors
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await this.updateJobStatus(nextJob.id, "failed", errorMessage);

        // Add to analytics
        await this.addToAnalytics(nextJob.id, "failed", errorMessage);
      }

      // Process the next job
      this.processingQueue = false;
      this.processQueue();
    } catch (error) {
      logError("Error processing print queue", error);
      this.processingQueue = false;
    }
  }

  // Add job to analytics
  private async addToAnalytics(
    jobId: string,
    status: string,
    error?: string,
  ): Promise<void> {
    try {
      const database = await db;
      const job = await this.getJob(jobId);

      if (!job) {
        return;
      }

      const now = new Date().toISOString();

      await database.run(
        `INSERT INTO print_analytics (
          id, job_id, printer, status, created_at, completed_at, error
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          jobId,
          job.printer,
          status,
          job.createdAt,
          now,
          error || null,
        ],
      );
    } catch (error) {
      logError("Failed to add job to analytics", error);
    }
  }

  // Emit queue updated event
  private emitQueueUpdated(): void {
    wsClient.emit("queue-updated");
  }

  // Emit job status changed event
  private emitJobStatusChanged(jobId: string, status: string): void {
    wsClient.emit("job-status-changed", { jobId, status });
  }
}

// Export a singleton instance
export const printQueueService = new PrintQueueService();
