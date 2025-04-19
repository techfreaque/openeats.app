import { beforeEach, describe, expect, it, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";

// Mock UUID to get consistent values in tests
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("a7a2db8e-0d74-4d63-9549-6a30c93e9bea")
}));

// Create mock websocket client
const wsClientMock = {
  emit: vi.fn()
};

// Create printer service mock
const printerServiceMock = {
  print: vi.fn().mockResolvedValue({ success: true })
};

// Mock the printer service
vi.mock("../../printing", () => {
  return {
    printerService: printerServiceMock
  };
});

// Mock dependencies that may cause timeouts
vi.mock("../../websocket/client", () => {
  return {
    wsClient: wsClientMock
  };
});

// Mock analytics dependencies to avoid timeouts
vi.mock("../../services/analytics", () => {
  return {
    analyticsService: {
      trackPrintJob: vi.fn().mockResolvedValue(undefined),
    },
  };
});

// Mock database to reduce test time
vi.mock("../../db", async () => {
  // Create in-memory database for faster tests
  const database = {
    get: vi.fn(),
    all: vi.fn(),
    run: vi.fn(),
    exec: vi.fn(),
  };
  
  // Default responses
  database.exec.mockResolvedValue(undefined);
  database.run.mockResolvedValue({ lastID: 1 });
  database.get.mockResolvedValue(null);
  database.all.mockResolvedValue([]);
  
  return {
    db: Promise.resolve(database)
  };
});

// Mock date for consistent test timestamps
vi.mock("../../utils/date", () => ({
  getCurrentISOString: vi.fn().mockReturnValue("2025-04-15T15:30:26.257Z")
}));

// Mock the logger
vi.mock("../../logging", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  logError: vi.fn(),
  logPrintJob: vi.fn()
}));

// Import the modules after mocks
import { db } from "../../db";
import { printQueueService } from "./index";

// Use actual sleep instead of mock for better test timing
async function sleep(ms: number): Promise<void> {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Print Queue Service", () => {
  let mockDb;

  beforeEach(async () => {
    // Get mock database
    mockDb = await db;
    
    // Reset mock responses
    mockDb.exec.mockResolvedValue(undefined);
    mockDb.run.mockResolvedValue({ lastID: 1 });
    mockDb.get.mockResolvedValue(null);
    mockDb.all.mockResolvedValue([]);
    
    // Reset other mocks
    vi.clearAllMocks();
    
    // Reset uuid mock to ensure each test gets a fresh uuid
    vi.mocked(uuidv4).mockReturnValue("a7a2db8e-0d74-4d63-9549-6a30c93e9bea");
  });

  describe("addJob", () => {
    it("should add a job to the queue", async () => {
      const fileContent = "test content";
      const fileName = "test.txt";
      const options = { copies: 2 };
      
      // Mock response for getJob
      const mockJob = {
        id: "123",
        file_name: fileName,
        status: "pending",
        options: JSON.stringify(options),
      };
      mockDb.get.mockResolvedValueOnce(mockJob);

      const jobId = await printQueueService.addJob(
        fileContent,
        fileName,
        options,
      );

      expect(jobId).toBeDefined();
      expect(mockDb.run).toHaveBeenCalled();
    });
  });

  describe("getJobs", () => {
    it("should return all jobs in the queue", async () => {
      // Mock jobs in database
      mockDb.all.mockResolvedValueOnce([
        { id: "1", file_name: "file1.txt", status: "pending", options: "{}" },
        { id: "2", file_name: "file2.txt", status: "pending", options: "{}" },
      ]);

      const jobs = await printQueueService.getJobs();

      expect(jobs).toHaveLength(2);
      expect(jobs[0].fileName).toBe("file1.txt");
      expect(jobs[1].fileName).toBe("file2.txt");
    });
  });

  describe("getJob", () => {
    it("should return a specific job", async () => {
      // Mock job in database
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        file_name: "file.txt",
        status: "pending",
        options: "{}",
      });

      const job = await printQueueService.getJob("123");

      expect(job).toBeDefined();
      expect(job?.id).toBe("123");
      expect(job?.fileName).toBe("file.txt");
    });

    it("should return null for non-existent job", async () => {
      // Already mocked to return null by default
      const job = await printQueueService.getJob("non-existent-id");

      expect(job).toBeNull();
    });
  });

  describe("updateJobStatus", () => {
    it("should update job status", async () => {
      // Mock job before update
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        file_name: "file.txt",
        status: "pending",
        options: "{}",
      });
      
      // Mock job after update
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        file_name: "file.txt",
        status: "printing",
        options: "{}",
      });

      await printQueueService.updateJobStatus("123", "printing");

      const job = await printQueueService.getJob("123");
      expect(job?.status).toBe("printing");
      expect(mockDb.run).toHaveBeenCalled();
    });
  });

  describe("pauseJob", () => {
    it("should pause a pending job", async () => {
      // Mock job existence for the check
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        status: "pending",
      });
      
      // Mock job after update
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        file_name: "file.txt",
        status: "paused",
        options: "{}",
      });

      await printQueueService.pauseJob("123");

      const job = await printQueueService.getJob("123");
      expect(job?.status).toBe("paused");
      expect(mockDb.run).toHaveBeenCalled();
    });

    it("should throw error for non-existent job", async () => {
      // Mock DB to return null for non-existent job
      mockDb.get.mockResolvedValueOnce(null);

      await expect(
        printQueueService.pauseJob("non-existent-id"),
      ).rejects.toThrow("Job non-existent-id not found");
    });
  });

  describe("resumeJob", () => {
    it("should resume a paused job", async () => {
      // Mock job existence for the check
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        status: "paused",
      });
      
      // Mock job after update
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        file_name: "file.txt",
        status: "pending",
        options: "{}",
      });

      await printQueueService.resumeJob("123");

      const job = await printQueueService.getJob("123");
      expect(job?.status).toBe("pending");
      expect(mockDb.run).toHaveBeenCalled();
    });

    it("should throw error for non-existent job", async () => {
      // Mock DB to return null for non-existent job
      mockDb.get.mockResolvedValueOnce(null);

      await expect(
        printQueueService.resumeJob("non-existent-id"),
      ).rejects.toThrow("Job non-existent-id not found");
    });
  });

  describe("cancelJob", () => {
    it("should cancel and remove a job", async () => {
      // Mock job existence for the check
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        status: "pending",
      });
      
      // Mock job after deletion - should return null
      mockDb.get.mockResolvedValueOnce(null);

      await printQueueService.cancelJob("123");

      const job = await printQueueService.getJob("123");
      expect(job).toBeNull();
      expect(mockDb.run).toHaveBeenCalled();
    });

    it("should throw error for non-existent job", async () => {
      // Mock DB to return null for non-existent job
      mockDb.get.mockResolvedValueOnce(null);

      await expect(
        printQueueService.cancelJob("non-existent-id"),
      ).rejects.toThrow("Job non-existent-id not found");
    });
  });

  describe("updateJobPriority", () => {
    it("should update job priority", async () => {
      // Mock job existence for the check
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        status: "pending",
      });

      await printQueueService.updateJobPriority("123", 5);

      expect(mockDb.run).toHaveBeenCalled();
    });
  });

  describe("pauseAllJobs", () => {
    it("should pause all pending and printing jobs", async () => {
      // Mock jobs in the database
      mockDb.all.mockResolvedValueOnce([
        { id: "1", status: "pending" },
        { id: "2", status: "printing" },
      ]);
      
      // Mock response after update
      mockDb.all.mockResolvedValueOnce([
        { id: "1", status: "paused", file_name: "file1.txt", options: "{}" },
        { id: "2", status: "paused", file_name: "file2.txt", options: "{}" },
      ]);

      await printQueueService.pauseAllJobs();

      const jobs = await printQueueService.getJobs();
      expect(jobs.every((job) => job.status === "paused")).toBe(true);
      expect(mockDb.run).toHaveBeenCalled();
    });
  });

  describe("resumeAllJobs", () => {
    it("should resume all paused jobs", async () => {
      // Mock paused jobs in the database
      mockDb.all.mockResolvedValueOnce([
        { id: "1", status: "paused" },
        { id: "2", status: "paused" },
      ]);
      
      // Mock response after update
      mockDb.all.mockResolvedValueOnce([
        { id: "1", status: "pending", file_name: "file1.txt", options: "{}" },
        { id: "2", status: "pending", file_name: "file2.txt", options: "{}" },
      ]);

      await printQueueService.resumeAllJobs();

      const jobs = await printQueueService.getJobs();
      expect(jobs.every((job) => job.status === "pending")).toBe(true);
      expect(mockDb.run).toHaveBeenCalled();
    });
  });

  describe("processQueue", () => {
    it("should process the next job in the queue", async () => {
      // Mock a pending job in the database
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        file_name: "file.txt",
        file_content: "content",
        status: "pending",
        options: "{}",
      });
      
      // Mock job after status update
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        file_name: "file.txt",
        file_content: "content",
        status: "printing",
        options: "{}",
      });
      
      // Mock job after completion
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        file_name: "file.txt",
        file_content: "content",
        status: "completed",
        options: "{}",
      });

      // Call processQueue directly
      await (printQueueService ).processQueue();

      // Check if the printing service was called
      expect(printerService.print).toHaveBeenCalled();
      expect(mockDb.run).toHaveBeenCalled();
    });

    it("should mark job as failed after maximum retries", async () => {
      // Mock printer service to fail
      vi.mocked(printerService.print).mockResolvedValueOnce({
        success: false,
        error: "Persistent printer error",
      });
      
      // Mock a job with maximum retries reached
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        file_name: "file.txt",
        file_content: "content",
        status: "pending",
        retries: 2, // Max retries already reached
        options: '{"maxRetries":2}', // Max retries set to 2
      });
      
      // Mock job after update to failed
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        file_name: "file.txt",
        file_content: "content",
        status: "failed",
        error: "Persistent printer error",
        retries: 2,
        options: '{"maxRetries":2}',
      });
      
      // Process the queue
      await (printQueueService ).processQueue();
      
      // Check if the job was marked as failed
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE print_jobs SET status = ?"),
        expect.arrayContaining(["failed"])
      );
    });

    it("should handle unexpected errors during printing", async () => {
      // Mock printer service to throw an exception
      vi.mocked(printerService.print).mockRejectedValueOnce(
        new Error("Unexpected printer error")
      );
      
      // Mock a pending job
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        file_name: "file.txt",
        file_content: "content",
        status: "pending",
        options: "{}",
      });
      
      // Mock job after update to failed
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        file_name: "file.txt",
        file_content: "content",
        status: "failed",
        error: "Unexpected printer error",
        options: "{}",
      });
      
      // Process the queue
      await (printQueueService ).processQueue();
      
      // Check if job was marked as failed with correct error
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE print_jobs SET status = ?, error = ?"),
        expect.arrayContaining(["failed", "Unexpected printer error"])
      );
    });
  });

  describe("job priority and queue ordering", () => {
    it("should process high priority jobs before low priority ones", async () => {
      // Mock the DB to return jobs ordered by priority
      mockDb.all.mockResolvedValueOnce([
        {
          id: "high",
          file_name: "high.txt",
          file_content: "high priority content",
          status: "pending",
          priority: 5,
          options: '{"priority":5}',
        },
        {
          id: "low",
          file_name: "low.txt",
          file_content: "low priority content",
          status: "pending",
          priority: 1,
          options: '{"priority":1}',
        },
      ]);
      
      // Mock job retrieval for high priority job
      mockDb.get.mockResolvedValueOnce({
        id: "high",
        file_name: "high.txt",
        file_content: "high priority content",
        status: "pending",
        priority: 5,
        options: '{"priority":5}',
      });
      
      // Process the queue
      await (printQueueService ).processQueue();
      
      // Verify high priority job was processed first
      expect(printerService.print).toHaveBeenCalledWith(
        "high priority content",
        "high.txt",
        expect.objectContaining({ priority: 5 })
      );
    });
  });

  describe("analytics tracking", () => {
    it("should add completed job to analytics", async () => {
      // Mock job for analytics
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        file_name: "file.txt",
        file_content: "content",
        status: "completed",
        options: "{}",
      });
      
      // Call addToAnalytics directly
      await (printQueueService ).addToAnalytics("123", "completed");
      
      // Verify analytics was added
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO print_analytics"),
        expect.any(Array)
      );
    });

    it("should handle non-existent job when adding to analytics", async () => {
      // Mock job as null (non-existent)
      mockDb.get.mockResolvedValueOnce(null);
      
      // Call addToAnalytics with non-existent job ID
      await (printQueueService ).addToAnalytics("non-existent-id", "completed");
      
      // Should not throw and just return
      expect(mockDb.run).not.toHaveBeenCalled();
    });
  });

  describe("websocket events", () => {
    it("should emit queue-updated event", async () => {
      // Mock the WS client with a local reference
      const wsClientMock = (printQueueService ).wsClient;
      
      // Call emitQueueUpdated
      (printQueueService ).emitQueueUpdated();
      
      // Verify event was emitted
      expect(wsClientMock.emit).toHaveBeenCalledWith("queue-updated");
    });

    it("should emit job-status-changed event with job details", async () => {
      // Mock the WS client with a local reference
      const wsClientMock = (printQueueService ).wsClient;
      
      // Call emitJobStatusChanged
      const jobId = "test-job-id";
      const status = "printing";
      (printQueueService ).emitJobStatusChanged(jobId, status);
      
      // Verify event was emitted with correct details
      expect(wsClientMock.emit).toHaveBeenCalledWith(
        "job-status-changed", 
        { jobId, status }
      );
    });
  });

  describe("printer selection", () => {
    it("should use the specified printer for a job", async () => {
      const printerName = "Test Printer";
      
      // Mock a job with a specific printer
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        file_name: "file.txt",
        file_content: "content",
        status: "pending",
        options: `{"printer":"${printerName}"}`,
      });
      
      // Process the queue
      await (printQueueService ).processQueue();
      
      // Verify the correct printer was used
      expect(printerService.print).toHaveBeenCalledWith(
        "content",
        "file.txt",
        expect.objectContaining({ printer: printerName })
      );
    });

    it("should fall back to default printer when none specified", async () => {
      // Mock a job without printer specification
      mockDb.get.mockResolvedValueOnce({
        id: "123",
        file_name: "file.txt",
        file_content: "content",
        status: "pending",
        options: "{}",
      });
      
      // Process the queue
      await (printQueueService ).processQueue();
      
      // Verify printer was called without a specific printer
      expect(printerService.print).toHaveBeenCalledWith(
        "content",
        "file.txt",
        expect.objectContaining({ printer: null })
      );
    });
  });
});
