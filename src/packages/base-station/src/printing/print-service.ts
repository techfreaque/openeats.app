import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

import type { BaseStationConfig } from "../config/config-types";
import { BlinkPattern, LedNotificationService } from "../gpio/led-notification";
import logger from "../logging";
import { withRetry } from "../utils/retry";

// Define print job status
export enum PrintJobStatus {
  QUEUED = "queued",
  PRINTING = "printing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

// Define print job priority
export enum PrintJobPriority {
  LOW = 0,
  NORMAL = 50,
  HIGH = 100,
  URGENT = 200,
}

// Define print error codes
export enum PrintErrorCode {
  TIMEOUT = "TIMEOUT",
  CONNECTION_FAILED = "CONNECTION_FAILED",
  PRINTER_ERROR = "PRINTER_ERROR",
  OUT_OF_PAPER = "OUT_OF_PAPER",
  UNKNOWN = "UNKNOWN",
}

// Define print job interface
export interface PrintJob {
  id: string;
  content: string;
  status: PrintJobStatus;
  priority: PrintJobPriority;
  retries: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  error?: string;
  errorCode?: PrintErrorCode;
  metadata?: Record<string, any>;
}

// Define print error
export class PrintError extends Error {
  constructor(
    message: string,
    readonly code: PrintErrorCode = PrintErrorCode.UNKNOWN,
  ) {
    super(message);
    this.name = "PrintError";
  }
}

export interface IPrintService {
  print(content: string, options?: PrintJobOptions): Promise<string>; // Returns job ID
  cancelJob(jobId: string): Promise<boolean>;
  getJobStatus(jobId: string): PrintJob | null;
  getAllJobs(): PrintJob[];
  getPendingJobs(): PrintJob[];
  getCompletedJobs(): PrintJob[];
  clearCompletedJobs(): void;
  cleanup(): void;
}

export interface IPrinterNotificationService {
  startBlinking(pattern?: BlinkPattern, timeoutMs?: number): void;
  stopBlinking(): void;
  onAcknowledged(callback: () => void): void;
  cleanup(): void;
  isActive(): boolean;
}

export interface PrintJobOptions {
  priority?: PrintJobPriority;
  maxRetries?: number;
  metadata?: Record<string, any>;
}

interface PrintServiceEvents {
  "job-created": PrintJob;
  "job-started": PrintJob;
  "job-completed": PrintJob;
  "job-failed": PrintJob;
  "job-cancelled": PrintJob;
  "notification-acknowledged": void;
  "queue-empty": void;
  "error": Error;
}

export class PrintService implements IPrintService {
  private ledNotification: IPrinterNotificationService;
  private lastPrintTimestamp = 0;
  private isPrinting = false;
  private printQueue: Map<string, PrintJob> = new Map();
  private archiveQueue: Map<string, PrintJob> = new Map(); // For completed/failed jobs
  private processingQueue = false;
  private queueTimer: NodeJS.Timeout | null = null;
  private events = new EventEmitter();
  private jobCounters = {
    created: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  };
  private maxArchivedJobs = 100; // Maximum number of jobs to keep in archive

  constructor(
    private config: BaseStationConfig,
    notificationService?: IPrinterNotificationService,
  ) {
    try {
      this.ledNotification =
        notificationService ||
        new LedNotificationService(
          config.gpio.ledPin,
          config.gpio.buttonPin,
          config.gpio.blinkRate,
          config.gpio.blinkTimeout,
        );

      this.ledNotification.onAcknowledged(() => {
        this.handlePrintAcknowledged();
      });

      // Set max listeners
      this.events.setMaxListeners(20);

      // Process the queue periodically
      this.queueTimer = setInterval(() => this.processQueue(), 1000);
    } catch (error) {
      logger.error("Failed to initialize LED notification service:", error);
      throw new Error("Print service initialization failed");
    }
  }

  async print(content: string, options: PrintJobOptions = {}): Promise<string> {
    if (!content) {
      logger.warn("Empty content provided for printing");
      throw new PrintError(
        "Cannot print empty content",
        PrintErrorCode.UNKNOWN,
      );
    }

    // Create a new print job
    const jobId = uuidv4();
    const job: PrintJob = {
      id: jobId,
      content,
      status: PrintJobStatus.QUEUED,
      priority: options.priority ?? PrintJobPriority.NORMAL,
      retries: 0,
      maxRetries: options.maxRetries ?? this.config.printing.retryCount,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: options.metadata || {},
    };

    this.printQueue.set(jobId, job);
    this.jobCounters.created++;
    this.events.emit("job-created", { ...job });

    logger.info(
      `Print job created with ID: ${jobId}, priority: ${job.priority}`,
    );

    // Process the queue immediately if not already processing
    if (!this.processingQueue) {
      this.processQueue();
    }

    return jobId;
  }

  cancelJob(jobId: string): Promise<boolean> {
    if (this.printQueue.has(jobId)) {
      const job = this.printQueue.get(jobId);

      // Only cancel if it's not already completed
      if (job.status !== PrintJobStatus.COMPLETED) {
        job.status = PrintJobStatus.CANCELLED;
        job.error = "Job cancelled by user";
        job.updatedAt = new Date();
        job.completedAt = new Date();

        // Move to archive
        this.archiveJob(job);

        this.jobCounters.cancelled++;
        this.events.emit("job-cancelled", { ...job });
        logger.info(`Print job ${jobId} cancelled`);
        return Promise.resolve(true);
      }
    }

    return Promise.resolve(false);
  }

  getJobStatus(jobId: string): PrintJob | null {
    // Check active queue first
    const activeJob = this.printQueue.get(jobId);
    if (activeJob) {
      return { ...activeJob };
    }

    // Then check archive
    const archivedJob = this.archiveQueue.get(jobId);
    if (archivedJob) {
      return { ...archivedJob };
    }

    return null;
  }

  getAllJobs(): PrintJob[] {
    // Combine active and archived jobs
    const allJobs = [
      ...Array.from(this.printQueue.values()),
      ...Array.from(this.archiveQueue.values()),
    ];

    // Sort by creation time (newest first)
    return allJobs
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((job) => ({ ...job }));
  }

  getPendingJobs(): PrintJob[] {
    return Array.from(this.printQueue.values())
      .filter(
        (job) =>
          job.status === PrintJobStatus.QUEUED ||
          job.status === PrintJobStatus.PRINTING,
      )
      .sort((a, b) => {
        // Sort by priority first (higher first)
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        // Then by creation time (oldest first)
        return a.createdAt.getTime() - b.createdAt.getTime();
      })
      .map((job) => ({ ...job }));
  }

  getCompletedJobs(): PrintJob[] {
    return Array.from(this.archiveQueue.values())
      .filter((job) => job.status === PrintJobStatus.COMPLETED)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
      .map((job) => ({ ...job }));
  }

  clearCompletedJobs(): void {
    // Remove completed jobs from archive
    const jobsToRemove: string[] = [];
    this.archiveQueue.forEach((job, id) => {
      if (job.status === PrintJobStatus.COMPLETED) {
        jobsToRemove.push(id);
      }
    });

    jobsToRemove.forEach((id) => this.archiveQueue.delete(id));
    logger.info(`Cleared ${jobsToRemove.length} completed jobs from archive`);
  }

  /**
   * Archive a job and maintain archive size
   */
  private archiveJob(job: PrintJob): void {
    // Move from active queue to archive
    this.printQueue.delete(job.id);
    this.archiveQueue.set(job.id, job);

    // If archive is too large, remove oldest completed jobs
    if (this.archiveQueue.size > this.maxArchivedJobs) {
      const oldestCompleted = Array.from(this.archiveQueue.values())
        .filter(
          (j) =>
            j.status === PrintJobStatus.COMPLETED ||
            j.status === PrintJobStatus.CANCELLED,
        )
        .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())
        .slice(0, this.archiveQueue.size - this.maxArchivedJobs);

      oldestCompleted.forEach((j) => this.archiveQueue.delete(j.id));
      logger.debug(`Removed ${oldestCompleted.length} old jobs from archive`);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.isPrinting) {
      return; // Already processing
    }

    this.processingQueue = true;

    try {
      // Sort jobs by priority and creation time
      const pendingJobs = this.getPendingJobs().filter(
        (job) => job.status === PrintJobStatus.QUEUED,
      );

      if (pendingJobs.length === 0) {
        this.processingQueue = false;
        return;
      }

      // Get the highest priority job
      const nextJob = pendingJobs[0];

      // Process this job
      await this.processPrintJob(nextJob);
    } catch (error) {
      logger.error("Error processing print queue:", error);
    } finally {
      this.processingQueue = false;
    }
  }

  private async processPrintJob(job: PrintJob): Promise<void> {
    try {
      this.isPrinting = true;
      this.lastPrintTimestamp = Date.now();

      // Update job status
      job.status = PrintJobStatus.PRINTING;
      job.updatedAt = new Date();
      this.printQueue.set(job.id, job);
      this.events.emit("job-started", { ...job });

      // Select blinking pattern based on job priority
      let pattern = BlinkPattern.NORMAL;
      if (job.priority >= PrintJobPriority.URGENT) {
        pattern = BlinkPattern.FAST;
      } else if (job.priority >= PrintJobPriority.HIGH) {
        pattern = BlinkPattern.DOUBLE;
      } else if (job.priority <= PrintJobPriority.LOW) {
        pattern = BlinkPattern.SLOW;
      }

      // Start blinking LED for notification with appropriate pattern
      if (!this.ledNotification.isActive()) {
        this.ledNotification.startBlinking(pattern);
      }

      if (this.config.printing.enabled) {
        // Only send to printer if printing is enabled
        try {
          logger.info(`Processing print job ${job.id}`);

          // Use retry utility for more robust printing
          await withRetry(() => this.sendToPrinter(job.content), {
            maxRetries: job.maxRetries,
            initialDelayMs: 2000,
            backoffFactor: 1.5,
            retryableErrors: [
              PrintErrorCode.CONNECTION_FAILED,
              PrintErrorCode.TIMEOUT,
              /temporarily unavailable/i,
            ],
            onRetry: (error, attempt, delay) => {
              job.retries = attempt;
              job.error = `Print attempt failed: ${error.message}. Retry ${attempt}/${job.maxRetries}`;
              job.updatedAt = new Date();
              this.printQueue.set(job.id, job);

              logger.warn(
                `Print job ${job.id} failed, retrying (${attempt}/${job.maxRetries}) in ${delay}ms: ${error.message}`,
              );
            },
          });

          // Update job status to completed
          job.status = PrintJobStatus.COMPLETED;
          job.updatedAt = new Date();
          job.completedAt = new Date();
          job.error = undefined; // Clear any error from retries

          // Move job to archive queue
          this.archiveJob(job);

          this.jobCounters.completed++;
          this.events.emit("job-completed", { ...job });

          logger.info(
            `Print job ${job.id} completed successfully after ${job.retries} retries`,
          );
        } catch (error) {
          // Max retries reached or non-retryable error, mark as failed
          job.status = PrintJobStatus.FAILED;
          job.updatedAt = new Date();
          job.completedAt = new Date();
          job.error = `Print failed after ${job.retries} retries: ${error.message || error}`;
          job.errorCode =
            error instanceof PrintError ? error.code : PrintErrorCode.UNKNOWN;

          // Move job to archive queue
          this.archiveJob(job);

          this.jobCounters.failed++;
          this.events.emit("job-failed", { ...job });

          logger.error(
            `Print job ${job.id} failed after ${job.retries} retries:`,
            error,
          );
        }
      } else {
        logger.info("Printing disabled. LED notification only.");

        // Even with printing disabled, we mark the job as completed
        job.status = PrintJobStatus.COMPLETED;
        job.updatedAt = new Date();
        job.completedAt = new Date();

        // Move job to archive queue
        this.archiveJob(job);

        this.jobCounters.completed++;
        this.events.emit("job-completed", { ...job });
      }

      // Check if queue is now empty
      if (this.getPendingJobs().length === 0) {
        this.events.emit("queue-empty");
      }
    } catch (error) {
      logger.error(`Unexpected error processing job ${job.id}:`, error);

      // Update job status to failed
      job.status = PrintJobStatus.FAILED;
      job.error = `Unexpected error: ${error.message || error}`;
      job.errorCode = PrintErrorCode.UNKNOWN;
      job.updatedAt = new Date();
      job.completedAt = new Date();

      // Move job to archive queue
      this.archiveJob(job);

      this.jobCounters.failed++;
      this.events.emit("job-failed", { ...job });
      this.events.emit(
        "error",
        error instanceof Error ? error : new Error(String(error)),
      );
    } finally {
      this.isPrinting = false;
    }
  }

  /**
   * Register an event listener
   * @param event Event name
   * @param listener Callback function
   */
  on<E extends keyof PrintServiceEvents>(
    event: E,
    listener: (arg: PrintServiceEvents[E]) => void,
  ): void {
    this.events.on(event, listener);
  }

  /**
   * Register a one-time event listener
   * @param event Event name
   * @param listener Callback function
   */
  once<E extends keyof PrintServiceEvents>(
    event: E,
    listener: (arg: PrintServiceEvents[E]) => void,
  ): void {
    this.events.once(event, listener);
  }

  /**
   * Remove an event listener
   * @param event Event name
   * @param listener Callback function
   */
  off<E extends keyof PrintServiceEvents>(
    event: E,
    listener: (arg: PrintServiceEvents[E]) => void,
  ): void {
    this.events.off(event, listener);
  }

  private async sendToPrinter(content: string): Promise<void> {
    // Existing printing logic
    logger.debug("Sending content to printer");

    // Simulate printing process for now
    const printDelay = 1000; // 1 second
    const timeoutMs = this.config.printing.timeout || 30000; // Default 30 seconds

    // Use a promise with timeout
    return await new Promise((resolve, reject) => {
      // Set timeout for printing
      const timeoutId = setTimeout(() => {
        reject(
          new PrintError("Print operation timed out", PrintErrorCode.TIMEOUT),
        );
      }, timeoutMs);

      // Simulate printing process
      setTimeout(() => {
        clearTimeout(timeoutId);

        // Random success/failure for demonstration
        const random = Math.random();
        if (random > 0.2) {
          // 80% success rate
          resolve();
        } else if (random > 0.1) {
          // 10% printer error
          reject(
            new PrintError(
              "Simulated print failure",
              PrintErrorCode.PRINTER_ERROR,
            ),
          );
        } else {
          // 10% out of paper
          reject(
            new PrintError("Printer out of paper", PrintErrorCode.OUT_OF_PAPER),
          );
        }
      }, printDelay);
    });
  }

  private handlePrintAcknowledged(): void {
    // Handle what happens when the button is pressed
    logger.info("Print notification acknowledged");

    const acknowledgeDelay = Date.now() - this.lastPrintTimestamp;
    logger.debug(`Acknowledgment delay: ${acknowledgeDelay}ms`);

    this.events.emit("notification-acknowledged");
  }

  cleanup(): void {
    try {
      // Cancel timers to prevent late callbacks
      if (this.queueTimer) {
        clearInterval(this.queueTimer);
        this.queueTimer = null;
      }

      // Clean up LED notification
      this.ledNotification.cleanup();

      // Remove all event listeners
      this.events.removeAllListeners();

      logger.debug("Print service resources cleaned up");
    } catch (error) {
      logger.error("Error during print service cleanup:", error);
    }
  }

  get status(): {
    isPrinting: boolean;
    lastPrintTime: number;
    queueSize: number;
    pendingJobs: number;
    completedJobs: number;
    failedJobs: number;
    statistics: typeof this.jobCounters;
  } {
    const pendingCount = this.getPendingJobs().length;
    const completedCount = Array.from(this.archiveQueue.values()).filter(
      (job) => job.status === PrintJobStatus.COMPLETED,
    ).length;
    const failedCount = Array.from(this.archiveQueue.values()).filter(
      (job) => job.status === PrintJobStatus.FAILED,
    ).length;

    return {
      isPrinting: this.isPrinting,
      lastPrintTime: this.lastPrintTimestamp,
      queueSize: this.printQueue.size + this.archiveQueue.size,
      pendingJobs: pendingCount,
      completedJobs: completedCount,
      failedJobs: failedCount,
      statistics: { ...this.jobCounters },
    };
  }
}
