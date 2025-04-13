import { db } from "../../../src/db";
import { printerService } from "../../../src/printing";
import { printQueueService } from "../../../src/services/queue";

// Mock the printer service
jest.mock("../../../src/printing", () => {
  return {
    printerService: {
      print: jest.fn().mockResolvedValue({ success: true }),
    },
  };
});

describe("Print Queue Service", () => {
  beforeEach(async () => {
    // Clear the database before each test
    const database = await db;
    await database.exec("DELETE FROM print_jobs");

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("addJob", () => {
    it("should add a job to the queue", async () => {
      const fileContent = "test content";
      const fileName = "test.txt";
      const options = { copies: 2 };

      const jobId = await printQueueService.addJob(
        fileContent,
        fileName,
        options,
      );

      expect(jobId).toBeDefined();

      // Check if job was added to the database
      const database = await db;
      const job = await database.get("SELECT * FROM print_jobs WHERE id = ?", [
        jobId,
      ]);

      expect(job).toBeDefined();
      expect(job.file_name).toBe(fileName);
      expect(job.status).toBe("pending");
      expect(JSON.parse(job.options)).toEqual(options);
    });
  });

  describe("getJobs", () => {
    it("should return all jobs in the queue", async () => {
      // Add some jobs
      await printQueueService.addJob("content1", "file1.txt");
      await printQueueService.addJob("content2", "file2.txt");

      const jobs = await printQueueService.getJobs();

      expect(jobs).toHaveLength(2);
      expect(jobs[0].fileName).toBe("file1.txt");
      expect(jobs[1].fileName).toBe("file2.txt");
    });
  });

  describe("getJob", () => {
    it("should return a specific job", async () => {
      const jobId = await printQueueService.addJob("content", "file.txt");

      const job = await printQueueService.getJob(jobId);

      expect(job).toBeDefined();
      expect(job?.id).toBe(jobId);
      expect(job?.fileName).toBe("file.txt");
    });

    it("should return null for non-existent job", async () => {
      const job = await printQueueService.getJob("non-existent-id");

      expect(job).toBeNull();
    });
  });

  describe("updateJobStatus", () => {
    it("should update job status", async () => {
      const jobId = await printQueueService.addJob("content", "file.txt");

      await printQueueService.updateJobStatus(jobId, "printing");

      const job = await printQueueService.getJob(jobId);
      expect(job?.status).toBe("printing");
    });
  });

  describe("pauseJob", () => {
    it("should pause a pending job", async () => {
      const jobId = await printQueueService.addJob("content", "file.txt");

      await printQueueService.pauseJob(jobId);

      const job = await printQueueService.getJob(jobId);
      expect(job?.status).toBe("paused");
    });

    it("should throw error for non-existent job", async () => {
      await expect(
        printQueueService.pauseJob("non-existent-id"),
      ).rejects.toThrow("Job non-existent-id not found");
    });
  });

  describe("resumeJob", () => {
    it("should resume a paused job", async () => {
      const jobId = await printQueueService.addJob("content", "file.txt");
      await printQueueService.pauseJob(jobId);

      await printQueueService.resumeJob(jobId);

      const job = await printQueueService.getJob(jobId);
      expect(job?.status).toBe("pending");
    });

    it("should throw error for non-existent job", async () => {
      await expect(
        printQueueService.resumeJob("non-existent-id"),
      ).rejects.toThrow("Job non-existent-id not found");
    });
  });

  describe("cancelJob", () => {
    it("should cancel and remove a job", async () => {
      const jobId = await printQueueService.addJob("content", "file.txt");

      await printQueueService.cancelJob(jobId);

      const job = await printQueueService.getJob(jobId);
      expect(job).toBeNull();
    });

    it("should throw error for non-existent job", async () => {
      await expect(
        printQueueService.cancelJob("non-existent-id"),
      ).rejects.toThrow("Job non-existent-id not found");
    });
  });

  describe("updateJobPriority", () => {
    it("should update job priority", async () => {
      const jobId = await printQueueService.addJob("content", "file.txt");

      await printQueueService.updateJobPriority(jobId, 5);

      const database = await db;
      const job = await database.get(
        "SELECT priority FROM print_jobs WHERE id = ?",
        [jobId],
      );
      expect(job.priority).toBe(5);
    });
  });

  describe("pauseAllJobs", () => {
    it("should pause all pending and printing jobs", async () => {
      await printQueueService.addJob("content1", "file1.txt");
      await printQueueService.addJob("content2", "file2.txt");

      await printQueueService.pauseAllJobs();

      const jobs = await printQueueService.getJobs();
      expect(jobs.every((job) => job.status === "paused")).toBe(true);
    });
  });

  describe("resumeAllJobs", () => {
    it("should resume all paused jobs", async () => {
      await printQueueService.addJob("content1", "file1.txt");
      await printQueueService.addJob("content2", "file2.txt");
      await printQueueService.pauseAllJobs();

      await printQueueService.resumeAllJobs();

      const jobs = await printQueueService.getJobs();
      expect(jobs.every((job) => job.status === "pending")).toBe(true);
    });
  });

  describe("processQueue", () => {
    it("should process the next job in the queue", async () => {
      // Add a job
      const jobId = await printQueueService.addJob("content", "file.txt");

      // Wait for the job to be processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if the job was processed
      expect(printerService.print).toHaveBeenCalled();

      // Check if the job status was updated
      const job = await printQueueService.getJob(jobId);
      expect(job?.status).toBe("completed");
    });

    it("should handle print errors and retry", async () => {
      // Mock the printer service to fail
      (printerService.print as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: "Test error",
      });

      // Add a job
      const jobId = await printQueueService.addJob("content", "file.txt");

      // Wait for the job to be processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if the job was retried
      const database = await db;
      const job = await database.get(
        "SELECT retries FROM print_jobs WHERE id = ?",
        [jobId],
      );
      expect(job.retries).toBe(1);
    });
  });
});
