import "winston-daily-rotate-file";

import fs from "fs";
import path from "path";
import type { Logger } from "winston";
import { createLogger, format, transports } from "winston";

import { config } from "../config";

// Create logs directory if it doesn't exist
const logsDir = path.dirname(config.logging.file);
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (error) {
    errorLogger("Failed to create logs directory:", error);
  }
}

// Create Winston logger
const logger: Logger = createLogger({
  level: config.logging.level,
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: "print-server" },
  transports: [
    // Console transport
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
      ),
    }),
    // File transport with rotation
    new transports.DailyRotateFile({
      filename: config.logging.file,
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: `${config.logging.maxSize}`,
      maxFiles: config.logging.maxFiles,
      format: format.combine(
        format.printf(
          (info) =>
            `${info.timestamp} ${info.level}: ${info.message}${
              info.stack ? `\n${info.stack}` : ""
            }`,
        ),
      ),
    }),
  ],
});

// Export logger
export default logger;

// Helper functions
export function logPrintJob(
  fileName: string,
  printer: string | undefined,
  success: boolean,
  jobId?: string,
  error?: string,
): void {
  const printerInfo = printer ? ` to printer ${printer}` : "";

  if (success) {
    logger.info(
      `Print job successful: ${fileName}${printerInfo}${
        jobId ? `, job ID: ${jobId}` : ""
      }`,
    );
  } else {
    logger.error(
      `Print job failed: ${fileName}${printerInfo}, error: ${error}`,
    );
  }
}

export function logWebSocketConnection(connected: boolean, url: string): void {
  if (connected) {
    logger.info(`Connected to WebSocket server: ${url}`);
  } else {
    logger.warn(`Disconnected from WebSocket server: ${url}`);
  }
}

export function logApiRequest(
  method: string,
  path: string,
  ip: string,
  statusCode: number,
): void {
  logger.info(`API ${method} ${path} from ${ip} - ${statusCode}`);
}

export function logError(message: string, error: unknown): void {
  if (error instanceof Error) {
    logger.error(`${message}: ${error.message}`, { stack: error.stack });
  } else {
    logger.error(`${message}: ${String(error)}`);
  }
}

export function logSystemStartup(): void {
  logger.info("Print server started");
  logger.info(`Platform: ${process.platform}`);
  logger.info(`Node.js version: ${process.version}`);
  logger.info(`WebSocket server: ${config.websocket.url}`);
  logger.info(
    `Management API: http://${config.server.host}:${config.server.port}`,
  );
}

export function logSystemShutdown(): void {
  logger.info("Print server shutting down");
}
