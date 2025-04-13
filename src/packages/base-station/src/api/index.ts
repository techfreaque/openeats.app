import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import ip from "ip";

import {
  config,
  loadConfig,
  resetApiKey,
  updateApiKey,
  updateConfig,
} from "../config";
import logger, { logApiRequest, logError } from "../logging";
import { getPrinterStatus } from "../printing";
import { bluetoothPrinterService } from "../printing/bluetooth";
import type {
  ApiResponse,
  AppConfig,
  BluetoothPrinterConfig,
  PrinterInfo,
  SystemStatus,
} from "../types";
import { wsClient } from "../websocket/client";
import analyticsRoutes from "./routes/analytics";
import barcodesRoutes from "./routes/barcodes";
import categoriesRoutes from "./routes/categories";
import groupsRoutes from "./routes/groups";
import previewRoutes from "./routes/preview";
import queueRoutes from "./routes/queue";

// Create Express app
const app = express();

// Define response types for better type checking
type ErrorResponse = ApiResponse<never>;
type SuccessResponse<T = unknown> = ApiResponse<T>;

// Define request body types
interface ApiKeyUpdateRequest {
  newApiKey: string;
}

interface BluetoothConfigRequest {
  enabled?: boolean;
  name?: string;
  address?: string;
  channel?: number;
  discoverable?: boolean;
  discoveryTimeout?: number;
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased limit for image uploads

// API key authentication middleware
function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (!apiKey || apiKey !== config.security.apiKey) {
    res.status(401).json({
      success: false,
      error: "Invalid API key",
    } as ErrorResponse);
    return;
  }

  next();
}

// Local network check middleware
function checkLocalNetwork(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const clientIp = req.ip ? req.ip.replace("::ffff:", "") : ""; // Handle IPv4 mapped to IPv6

  // Check if client IP is localhost
  if (clientIp === "127.0.0.1" || clientIp === "::1") {
    logger.debug(`Local access from localhost: ${clientIp}`);
    next();
    return;
  }

  // Check if client IP is in local network
  try {
    if (clientIp && ip.isPrivate(clientIp)) {
      logger.debug(`Local access from private IP: ${clientIp}`);
      next();
      return;
    }
  } catch (error) {
    logError(`Error checking IP: ${clientIp}`, error);
  }

  logger.warn(`Access denied from non-local IP: ${clientIp}`);
  res.status(403).json({
    success: false,
    error: "Access denied: management API is only available from local network",
  } as ErrorResponse);
}

// Create routes (extracted for testability)
export function createRoutes(app: express.Application): void {
  // Status endpoint
  app.get(
    "/management/status",
    checkLocalNetwork,
    authenticateApiKey,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const printers: PrinterInfo[] = await getPrinterStatus();

        const status: SystemStatus = {
          apiKey: config.security.apiKey,
          websocketUrl: config.websocket.url,
          websocketConnected: wsClient.isConnected(),
          printers,
          platform: process.platform,
          version: process.version,
        };

        const response: SuccessResponse<SystemStatus> = {
          success: true,
          data: status,
        };

        res.json(response);
      } catch (error) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
        res.status(500).json(errorResponse);
      }
    },
  );

  // Configuration endpoints
  app.get(
    "/management/config",
    checkLocalNetwork,
    authenticateApiKey,
    (req: Request, res: Response): void => {
      try {
        const currentConfig = loadConfig();

        // Remove sensitive information
        const safeConfig: AppConfig = {
          ...currentConfig,
          security: {
            ...currentConfig.security,
            apiKey: "***REDACTED***",
            defaultApiKey: "***REDACTED***",
          },
        };

        const response: SuccessResponse<AppConfig> = {
          success: true,
          data: safeConfig,
        };

        res.json(response);
      } catch (error) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };

        res.status(500).json(errorResponse);
      }
    },
  );

  app.put(
    "/management/config",
    checkLocalNetwork,
    authenticateApiKey,
    (req: Request, res: Response): void => {
      try {
        const updates = req.body as Partial<AppConfig>;

        // Prevent updating sensitive information directly
        if (updates.security?.apiKey || updates.security?.defaultApiKey) {
          throw new Error("Cannot update API keys through this endpoint");
        }

        const updatedConfig = updateConfig(updates);

        // Remove sensitive information
        const safeConfig: AppConfig = {
          ...updatedConfig,
          security: {
            ...updatedConfig.security,
            apiKey: "***REDACTED***",
            defaultApiKey: "***REDACTED***",
          },
        };

        const response: SuccessResponse<AppConfig> = {
          success: true,
          data: safeConfig,
        };

        res.json(response);
      } catch (error) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };

        res.status(500).json(errorResponse);
      }
    },
  );

  // API key management endpoints
  app.put(
    "/management/api-key",
    checkLocalNetwork,
    authenticateApiKey,
    (req: Request<{}, {}, ApiKeyUpdateRequest>, res: Response): void => {
      try {
        const { newApiKey } = req.body;

        if (
          !newApiKey ||
          typeof newApiKey !== "string" ||
          newApiKey.length < 8
        ) {
          throw new Error(
            "Invalid API key: must be a string with at least 8 characters",
          );
        }

        updateApiKey(newApiKey);

        const response: SuccessResponse = {
          success: true,
        };

        res.json(response);
      } catch (error) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };

        res.status(500).json(errorResponse);
      }
    },
  );

  app.post(
    "/management/reset-api-key",
    checkLocalNetwork,
    authenticateApiKey,
    (req: Request, res: Response): void => {
      try {
        resetApiKey();

        const response: SuccessResponse = {
          success: true,
        };

        res.json(response);
      } catch (error) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };

        res.status(500).json(errorResponse);
      }
    },
  );

  // Bluetooth printer endpoints
  app.get(
    "/management/bluetooth/printers",
    checkLocalNetwork,
    authenticateApiKey,
    async (req: Request, res: Response): Promise<void> => {
      try {
        if (!config.printing.bluetooth.enabled) {
          const errorResponse: ErrorResponse = {
            success: false,
            error: "Bluetooth printing is disabled in configuration",
          };

          res.status(400).json(errorResponse);
          return;
        }

        const available = await bluetoothPrinterService.isAvailable();
        if (!available) {
          const errorResponse: ErrorResponse = {
            success: false,
            error: "Bluetooth is not available on this system",
          };

          res.status(400).json(errorResponse);
          return;
        }

        const printers = await bluetoothPrinterService.discoverPrinters();

        const response: SuccessResponse<
          Array<{ name: string; address: string }>
        > = {
          success: true,
          data: printers,
        };

        res.json(response);
      } catch (error) {
        logError("Failed to discover Bluetooth printers", error);

        const errorResponse: ErrorResponse = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };

        res.status(500).json(errorResponse);
      }
    },
  );

  app.put(
    "/management/bluetooth/config",
    checkLocalNetwork,
    authenticateApiKey,
    (req: Request<{}, {}, BluetoothConfigRequest>, res: Response): void => {
      try {
        const {
          enabled,
          name,
          address,
          channel,
          discoverable,
          discoveryTimeout,
        } = req.body;

        // Update Bluetooth configuration
        updateConfig({
          printing: {
            bluetooth: {
              enabled:
                enabled !== undefined
                  ? enabled
                  : config.printing.bluetooth.enabled,
              name: name || config.printing.bluetooth.name,
              address: address || config.printing.bluetooth.address,
              channel:
                channel !== undefined
                  ? channel
                  : config.printing.bluetooth.channel,
              discoverable:
                discoverable !== undefined
                  ? discoverable
                  : config.printing.bluetooth.discoverable,
              discoveryTimeout:
                discoveryTimeout !== undefined
                  ? discoveryTimeout
                  : config.printing.bluetooth.discoveryTimeout,
            },
          },
        });

        const response: SuccessResponse<BluetoothPrinterConfig> = {
          success: true,
          data: config.printing.bluetooth,
        };

        res.json(response);
      } catch (error) {
        logError("Failed to update Bluetooth configuration", error);

        const errorResponse: ErrorResponse = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };

        res.status(500).json(errorResponse);
      }
    },
  );

  // Register routes
  app.use("/management/queue", queueRoutes);
  app.use("/management/categories", categoriesRoutes);
  app.use("/api/barcodes", barcodesRoutes);
  app.use("/management/groups", groupsRoutes);
  app.use("/api/preview", previewRoutes);
  app.use("/management/analytics", analyticsRoutes);
}

// Add routes to the app
createRoutes(app);

// Start the server
export function startServer(): void {
  const { port, host } = config.server;

  // Add logging middleware
  app.use((req: Request, res: Response, next: NextFunction): void => {
    // Create a response listener to log after the response is sent
    res.on("finish", () => {
      logApiRequest(req.method, req.path, req.ip || "unknown", res.statusCode);
    });
    next();
  });

  app.listen(port, host, () => {
    logger.info(`Management API server listening on ${host}:${port}`);
  });
}

export default app;
