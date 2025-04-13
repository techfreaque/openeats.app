import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "../../db";
import { analyticsService } from "./index";

// Mock the fs module properly for Vitest
vi.mock("fs", () => {
  const mockFs = {
    existsSync: vi.fn().mockImplementation((path) => {
      // Return false for temp directory to ensure mkdirSync is called
      if (path.includes("temp")) {
        return false;
      }
      return true;
    }),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn().mockReturnValue("test content"),
    unlinkSync: vi.fn(),
  };

  // Make sure the default export works
  mockFs.default = mockFs;

  return mockFs;
});

// Mock the csv-writer module
vi.mock("csv-writer", () => {
  return {
    createObjectCsvWriter: vi.fn().mockReturnValue({
      writeRecords: vi.fn().mockResolvedValue(undefined),
    }),
  };
});

describe("Analytics Service", () => {
  beforeEach(async () => {
    // Clear the database before each test
    const database = await db;
    await database.exec("DELETE FROM print_analytics");

    // Reset mocks
    vi.clearAllMocks();
  });

  describe("addPrintJob", () => {
    it("should add a print job to analytics", async () => {
      const jobId = "test-job-id";
      const printer = "Test Printer";
      const category = "Test Category";
      const status = "completed";
      const createdAt = new Date().toISOString();
      const completedAt = new Date().toISOString();
      const duration = 1000;
      const pageCount = 2;
      const error = null;

      await analyticsService.addPrintJob(
        jobId,
        printer,
        category,
        status,
        createdAt,
        completedAt,
        duration,
        pageCount,
        error,
      );

      // Check if job was added to the database
      const database = await db;
      const job = await database.get(
        "SELECT * FROM print_analytics WHERE job_id = ?",
        [jobId],
      );

      expect(job).toBeDefined();
      expect(job.job_id).toBe(jobId);
      expect(job.printer).toBe(printer);
      expect(job.category).toBe(category);
      expect(job.status).toBe(status);
      expect(job.created_at).toBe(createdAt);
      expect(job.completed_at).toBe(completedAt);
      expect(job.duration).toBe(duration);
      expect(job.page_count).toBe(pageCount);
      expect(job.error).toBe(error);
    });
  });

  describe("getSummary", () => {
    it("should return analytics summary", async () => {
      // Add some print jobs
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      await analyticsService.addPrintJob(
        "job1",
        "Printer1",
        "Category1",
        "completed",
        now.toISOString(),
        now.toISOString(),
        1000,
        2,
        null,
      );

      await analyticsService.addPrintJob(
        "job2",
        "Printer1",
        "Category1",
        "failed",
        now.toISOString(),
        now.toISOString(),
        null,
        null,
        "Test error",
      );

      await analyticsService.addPrintJob(
        "job3",
        "Printer2",
        "Category2",
        "completed",
        yesterday.toISOString(),
        yesterday.toISOString(),
        2000,
        3,
        null,
      );

      const summary = await analyticsService.getSummary();

      expect(summary).toBeDefined();
      expect(summary.totalJobs).toBe(3);
      expect(summary.completedJobs).toBe(2);
      expect(summary.failedJobs).toBe(1);
      expect(summary.errorRate).toBe(33.33333333333333);
      expect(summary.topPrinters).toHaveLength(2);
      expect(summary.topCategories).toHaveLength(2);
    });

    it("should filter by timeframe", async () => {
      // Add some print jobs
      const now = new Date();
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);

      await analyticsService.addPrintJob(
        "job1",
        "Printer1",
        "Category1",
        "completed",
        now.toISOString(),
        now.toISOString(),
        1000,
        2,
        null,
      );

      await analyticsService.addPrintJob(
        "job2",
        "Printer2",
        "Category2",
        "completed",
        lastWeek.toISOString(),
        lastWeek.toISOString(),
        2000,
        3,
        null,
      );

      const summary = await analyticsService.getSummary({
        timeframe: "day",
      });

      expect(summary).toBeDefined();
      expect(summary.totalJobs).toBe(1);
    });

    it("should filter by printer", async () => {
      // Add some print jobs
      const now = new Date();

      await analyticsService.addPrintJob(
        "job1",
        "Printer1",
        "Category1",
        "completed",
        now.toISOString(),
        now.toISOString(),
        1000,
        2,
        null,
      );

      await analyticsService.addPrintJob(
        "job2",
        "Printer2",
        "Category2",
        "completed",
        now.toISOString(),
        now.toISOString(),
        2000,
        3,
        null,
      );

      const summary = await analyticsService.getSummary({
        timeframe: "month",
        printers: ["Printer1"],
      });

      expect(summary).toBeDefined();
      expect(summary.totalJobs).toBe(1);
    });

    it("should filter by category", async () => {
      // Add some print jobs
      const now = new Date();

      await analyticsService.addPrintJob(
        "job1",
        "Printer1",
        "Category1",
        "completed",
        now.toISOString(),
        now.toISOString(),
        1000,
        2,
        null,
      );

      await analyticsService.addPrintJob(
        "job2",
        "Printer2",
        "Category2",
        "completed",
        now.toISOString(),
        now.toISOString(),
        2000,
        3,
        null,
      );

      const summary = await analyticsService.getSummary({
        timeframe: "month",
        categories: ["Category2"],
      });

      expect(summary).toBeDefined();
      expect(summary.totalJobs).toBe(1);
    });
  });

  describe("getJobStatistics", () => {
    it("should return job statistics", async () => {
      // Add some print jobs
      const now = new Date();

      await analyticsService.addPrintJob(
        "job1",
        "Printer1",
        "Category1",
        "completed",
        now.toISOString(),
        now.toISOString(),
        1000,
        2,
        null,
      );

      await analyticsService.addPrintJob(
        "job2",
        "Printer1",
        "Category1",
        "failed",
        now.toISOString(),
        now.toISOString(),
        null,
        null,
        "Test error",
      );

      const statistics = await analyticsService.getJobStatistics();

      expect(statistics).toBeDefined();
      expect(statistics.jobsByStatus).toBeDefined();
      expect(statistics.jobsByHour).toBeDefined();
      expect(statistics.jobsByDayOfWeek).toBeDefined();
      expect(statistics.jobsByPrinter).toBeDefined();
    });
  });

  describe("getPrinterStatistics", () => {
    it("should return printer statistics", async () => {
      // Add some print jobs
      const now = new Date();

      await analyticsService.addPrintJob(
        "job1",
        "Printer1",
        "Category1",
        "completed",
        now.toISOString(),
        now.toISOString(),
        1000,
        2,
        null,
      );

      await analyticsService.addPrintJob(
        "job2",
        "Printer1",
        "Category1",
        "failed",
        now.toISOString(),
        now.toISOString(),
        null,
        null,
        "Test error",
      );

      const statistics = await analyticsService.getPrinterStatistics();

      expect(statistics).toBeDefined();
      expect(statistics.printerUsage).toBeDefined();
      expect(statistics.printerErrorRates).toBeDefined();
      expect(statistics.printerUsageByHour).toBeDefined();
    });
  });

  describe("getErrorStatistics", () => {
    it("should return error statistics", async () => {
      // Add some print jobs
      const now = new Date();

      await analyticsService.addPrintJob(
        "job1",
        "Printer1",
        "Category1",
        "failed",
        now.toISOString(),
        now.toISOString(),
        null,
        null,
        "Error 1",
      );

      await analyticsService.addPrintJob(
        "job2",
        "Printer2",
        "Category2",
        "failed",
        now.toISOString(),
        now.toISOString(),
        null,
        null,
        "Error 2",
      );

      const statistics = await analyticsService.getErrorStatistics();

      expect(statistics).toBeDefined();
      expect(statistics.commonErrors).toBeDefined();
      expect(statistics.errorsByPrinter).toBeDefined();
      expect(statistics.errorsByHour).toBeDefined();
    });
  });

  describe("exportData", () => {
    it("should export analytics data as CSV", async () => {
      // Add some print jobs
      const now = new Date();

      await analyticsService.addPrintJob(
        "job1",
        "Printer1",
        "Category1",
        "completed",
        now.toISOString(),
        now.toISOString(),
        1000,
        2,
        null,
      );

      await analyticsService.addPrintJob(
        "job2",
        "Printer2",
        "Category2",
        "failed",
        now.toISOString(),
        now.toISOString(),
        null,
        null,
        "Test error",
      );

      const fileName = await analyticsService.exportData();

      expect(fileName).toBeDefined();

      // Check if directory was created
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.mkdirSync).toHaveBeenCalled();

      // Check if CSV writer was created
      expect(createObjectCsvWriter).toHaveBeenCalled();

      // Check if records were written
      const csvWriter = createObjectCsvWriter.mock.results[0].value;
      expect(csvWriter.writeRecords).toHaveBeenCalled();
    });
  });
});
