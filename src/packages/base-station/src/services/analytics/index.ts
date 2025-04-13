import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import { db } from "../../db";
import logger, { logError } from "../../logging";

interface AnalyticsSummary {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageDuration?: number;
  topPrinters: { name: string; count: number }[];
  topCategories: { name: string; count: number }[];
  errorRate: number;
}

interface TimeframeOptions {
  timeframe: "day" | "week" | "month" | "year" | "custom";
  startDate?: string;
  endDate?: string;
  printers?: string[];
  categories?: string[];
}

class AnalyticsService {
  // Add a print job to analytics
  async addPrintJob(
    jobId: string,
    printer: string,
    category: string | null,
    status: string,
    createdAt: string,
    completedAt: string | null,
    duration: number | null,
    pageCount: number | null,
    error: string | null,
  ): Promise<void> {
    try {
      const database = await db;

      await database.run(
        `INSERT INTO print_analytics (
          id, job_id, printer, category, status, created_at, completed_at, duration, page_count, error
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          jobId,
          printer,
          category,
          status,
          createdAt,
          completedAt,
          duration,
          pageCount,
          error,
        ],
      );

      logger.debug(`Added print job ${jobId} to analytics`);
    } catch (error) {
      logError("Failed to add print job to analytics", error);
    }
  }

  // Get analytics summary
  async getSummary(options?: TimeframeOptions): Promise<AnalyticsSummary> {
    try {
      const database = await db;

      // Build date filter
      const { dateFilter, params } = this.buildDateFilter(options);

      // Build printer filter
      const printerFilter = options?.printers?.length
        ? `AND printer IN (${options.printers.map(() => "?").join(",")})`
        : "";

      if (options?.printers?.length) {
        params.push(...options.printers);
      }

      // Build category filter
      const categoryFilter = options?.categories?.length
        ? `AND category IN (${options.categories.map(() => "?").join(",")})`
        : "";

      if (options?.categories?.length) {
        params.push(...options.categories);
      }

      // Get total jobs
      const totalJobs = await database.get(
        `SELECT COUNT(*) as count
         FROM print_analytics
         WHERE 1=1 ${dateFilter} ${printerFilter} ${categoryFilter}`,
        params,
      );

      // Get completed jobs
      const completedJobs = await database.get(
        `SELECT COUNT(*) as count
         FROM print_analytics
         WHERE status = 'completed' ${dateFilter} ${printerFilter} ${categoryFilter}`,
        params,
      );

      // Get failed jobs
      const failedJobs = await database.get(
        `SELECT COUNT(*) as count
         FROM print_analytics
         WHERE status = 'failed' ${dateFilter} ${printerFilter} ${categoryFilter}`,
        params,
      );

      // Get average duration
      const averageDuration = await database.get(
        `SELECT AVG(duration) as average
         FROM print_analytics
         WHERE duration IS NOT NULL ${dateFilter} ${printerFilter} ${categoryFilter}`,
        params,
      );

      // Get top printers
      const topPrinters = await database.all(
        `SELECT printer as name, COUNT(*) as count
         FROM print_analytics
         WHERE printer IS NOT NULL ${dateFilter} ${printerFilter} ${categoryFilter}
         GROUP BY printer
         ORDER BY count DESC
         LIMIT 5`,
        params,
      );

      // Get top categories
      const topCategories = await database.all(
        `SELECT category as name, COUNT(*) as count
         FROM print_analytics
         WHERE category IS NOT NULL ${dateFilter} ${printerFilter} ${categoryFilter}
         GROUP BY category
         ORDER BY count DESC
         LIMIT 5`,
        params,
      );

      // Calculate error rate
      const errorRate =
        totalJobs.count > 0 ? (failedJobs.count / totalJobs.count) * 100 : 0;

      return {
        totalJobs: totalJobs.count,
        completedJobs: completedJobs.count,
        failedJobs: failedJobs.count,
        averageDuration: averageDuration.average,
        topPrinters,
        topCategories,
        errorRate,
      };
    } catch (error) {
      logError("Failed to get analytics summary", error);
      throw error;
    }
  }

  // Get print job statistics
  async getJobStatistics(options?: TimeframeOptions): Promise<any> {
    try {
      const database = await db;

      // Build date filter
      const { dateFilter, params } = this.buildDateFilter(options);

      // Build printer filter
      const printerFilter = options?.printers?.length
        ? `AND printer IN (${options.printers.map(() => "?").join(",")})`
        : "";

      if (options?.printers?.length) {
        params.push(...options.printers);
      }

      // Build category filter
      const categoryFilter = options?.categories?.length
        ? `AND category IN (${options.categories.map(() => "?").join(",")})`
        : "";

      if (options?.categories?.length) {
        params.push(...options.categories);
      }

      // Get jobs by status
      const jobsByStatus = await database.all(
        `SELECT status, COUNT(*) as count
         FROM print_analytics
         WHERE 1=1 ${dateFilter} ${printerFilter} ${categoryFilter}
         GROUP BY status
         ORDER BY count DESC`,
        params,
      );

      // Get jobs by hour of day
      const jobsByHour = await database.all(
        `SELECT strftime('%H', created_at) as hour, COUNT(*) as count
         FROM print_analytics
         WHERE 1=1 ${dateFilter} ${printerFilter} ${categoryFilter}
         GROUP BY hour
         ORDER BY hour`,
        params,
      );

      // Get jobs by day of week
      const jobsByDayOfWeek = await database.all(
        `SELECT strftime('%w', created_at) as day, COUNT(*) as count
         FROM print_analytics
         WHERE 1=1 ${dateFilter} ${printerFilter} ${categoryFilter}
         GROUP BY day
         ORDER BY day`,
        params,
      );

      // Get jobs by printer
      const jobsByPrinter = await database.all(
        `SELECT printer, COUNT(*) as count
         FROM print_analytics
         WHERE printer IS NOT NULL ${dateFilter} ${printerFilter} ${categoryFilter}
         GROUP BY printer
         ORDER BY count DESC`,
        params,
      );

      return {
        jobsByStatus,
        jobsByHour,
        jobsByDayOfWeek,
        jobsByPrinter,
      };
    } catch (error) {
      logError("Failed to get job statistics", error);
      throw error;
    }
  }

  // Get printer statistics
  async getPrinterStatistics(options?: TimeframeOptions): Promise<any> {
    try {
      const database = await db;

      // Build date filter
      const { dateFilter, params } = this.buildDateFilter(options);

      // Build printer filter
      const printerFilter = options?.printers?.length
        ? `AND printer IN (${options.printers.map(() => "?").join(",")})`
        : "";

      if (options?.printers?.length) {
        params.push(...options.printers);
      }

      // Build category filter
      const categoryFilter = options?.categories?.length
        ? `AND category IN (${options.categories.map(() => "?").join(",")})`
        : "";

      if (options?.categories?.length) {
        params.push(...options.categories);
      }

      // Get printer usage
      const printerUsage = await database.all(
        `SELECT printer, COUNT(*) as total_jobs,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_jobs,
          AVG(duration) as average_duration
         FROM print_analytics
         WHERE printer IS NOT NULL ${dateFilter} ${printerFilter} ${categoryFilter}
         GROUP BY printer
         ORDER BY total_jobs DESC`,
        params,
      );

      // Get printer error rates
      const printerErrorRates = printerUsage.map((printer) => ({
        printer: printer.printer,
        errorRate:
          printer.total_jobs > 0
            ? (printer.failed_jobs / printer.total_jobs) * 100
            : 0,
      }));

      // Get printer usage by hour
      const printerUsageByHour = await database.all(
        `SELECT printer, strftime('%H', created_at) as hour, COUNT(*) as count
         FROM print_analytics
         WHERE printer IS NOT NULL ${dateFilter} ${printerFilter} ${categoryFilter}
         GROUP BY printer, hour
         ORDER BY printer, hour`,
        params,
      );

      return {
        printerUsage,
        printerErrorRates,
        printerUsageByHour,
      };
    } catch (error) {
      logError("Failed to get printer statistics", error);
      throw error;
    }
  }

  // Get error statistics
  async getErrorStatistics(options?: TimeframeOptions): Promise<any> {
    try {
      const database = await db;

      // Build date filter
      const { dateFilter, params } = this.buildDateFilter(options);

      // Build printer filter
      const printerFilter = options?.printers?.length
        ? `AND printer IN (${options.printers.map(() => "?").join(",")})`
        : "";

      if (options?.printers?.length) {
        params.push(...options.printers);
      }

      // Build category filter
      const categoryFilter = options?.categories?.length
        ? `AND category IN (${options.categories.map(() => "?").join(",")})`
        : "";

      if (options?.categories?.length) {
        params.push(...options.categories);
      }

      // Get common errors
      const commonErrors = await database.all(
        `SELECT error, COUNT(*) as count
         FROM print_analytics
         WHERE status = 'failed' AND error IS NOT NULL ${dateFilter} ${printerFilter} ${categoryFilter}
         GROUP BY error
         ORDER BY count DESC
         LIMIT 10`,
        params,
      );

      // Get errors by printer
      const errorsByPrinter = await database.all(
        `SELECT printer, COUNT(*) as count
         FROM print_analytics
         WHERE status = 'failed' AND printer IS NOT NULL ${dateFilter} ${printerFilter} ${categoryFilter}
         GROUP BY printer
         ORDER BY count DESC`,
        params,
      );

      // Get errors by hour
      const errorsByHour = await database.all(
        `SELECT strftime('%H', created_at) as hour, COUNT(*) as count
         FROM print_analytics
         WHERE status = 'failed' ${dateFilter} ${printerFilter} ${categoryFilter}
         GROUP BY hour
         ORDER BY hour`,
        params,
      );

      return {
        commonErrors,
        errorsByPrinter,
        errorsByHour,
      };
    } catch (error) {
      logError("Failed to get error statistics", error);
      throw error;
    }
  }

  // Export analytics data
  async exportData(options?: TimeframeOptions): Promise<string> {
    try {
      const database = await db;

      // Build date filter
      const { dateFilter, params } = this.buildDateFilter(options);

      // Build printer filter
      const printerFilter = options?.printers?.length
        ? `AND printer IN (${options.printers.map(() => "?").join(",")})`
        : "";

      if (options?.printers?.length) {
        params.push(...options.printers);
      }

      // Build category filter
      const categoryFilter = options?.categories?.length
        ? `AND category IN (${options.categories.map(() => "?").join(",")})`
        : "";

      if (options?.categories?.length) {
        params.push(...options.categories);
      }

      // Get analytics data
      const data = await database.all(
        `SELECT id, job_id, printer, category, status, created_at, completed_at, duration, page_count, error
         FROM print_analytics
         WHERE 1=1 ${dateFilter} ${printerFilter} ${categoryFilter}
         ORDER BY created_at DESC`,
        params,
      );

      // Create CSV file
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `analytics-export-${timestamp}.csv`;
      const filePath = path.join(process.cwd(), "temp", fileName);

      // Ensure temp directory exists
      const tempDir = path.join(process.cwd(), "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Write CSV
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: "id", title: "ID" },
          { id: "job_id", title: "Job ID" },
          { id: "printer", title: "Printer" },
          { id: "category", title: "Category" },
          { id: "status", title: "Status" },
          { id: "created_at", title: "Created At" },
          { id: "completed_at", title: "Completed At" },
          { id: "duration", title: "Duration (ms)" },
          { id: "page_count", title: "Page Count" },
          { id: "error", title: "Error" },
        ],
      });

      await csvWriter.writeRecords(data);

      logger.info(`Exported analytics data to ${fileName}`);

      return fileName;
    } catch (error) {
      logError("Failed to export analytics data", error);
      throw error;
    }
  }

  // Helper to build date filter
  private buildDateFilter(options?: TimeframeOptions): {
    dateFilter: string;
    params: any[];
  } {
    const params: any[] = [];
    let dateFilter = "";

    if (options) {
      const now = new Date();
      let startDate: Date;
      let endDate = new Date();

      switch (options.timeframe) {
        case "day":
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case "custom":
          if (options.startDate) {
            startDate = new Date(options.startDate);
          } else {
            startDate = new Date(0); // Unix epoch
          }

          if (options.endDate) {
            endDate = new Date(options.endDate);
          }
          break;
        default:
          startDate = new Date(0); // Unix epoch
      }

      dateFilter = "AND created_at BETWEEN ? AND ?";
      params.push(startDate.toISOString(), endDate.toISOString());
    }

    return { dateFilter, params };
  }
}

// Export a singleton instance
export const analyticsService = new AnalyticsService();
