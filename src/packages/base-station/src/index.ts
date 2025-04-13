import { startServer } from "./api";
import { config, loadConfig } from "./config";
import { initializeGpio } from "./gpio";
import logger, {
  logError,
  logSystemShutdown,
  logSystemStartup,
  logWebSocketConnection,
} from "./logging";
import { playSound } from "./notifications";
import { printFile } from "./printing";
import type { PrintJob } from "./printing/print-service";
import { PrintService } from "./printing/print-service";
import type { PrintOptions } from "./types";
import { wsClient } from "./websocket/client";

// System state
let isShuttingDown = false;
let healthCheckInterval: NodeJS.Timeout;

// Boot sequence
async function boot() {
  try {
    // Load and validate configuration
    await loadConfig();

    // Initialize services
    const services = initializeServices();

    // Handle WebSocket events
    setupWebSocketHandlers(services);

    // Start the REST API server
    await startServer();

    // Connect to the WebSocket server
    await connectWebSocket();

    // Setup process handlers
    setupProcessHandlers(services);

    // Start health checks
    startHealthChecks(services);

    // Log system startup and play sound
    await startupNotification();

    return services;
  } catch (error) {
    logError("Failed to boot system", error);
    process.exit(1);
  }
}

/**
 * Initialize all required services
 */
function initializeServices() {
  // Initialize GPIO monitoring (if enabled and on Raspberry Pi)
  const gpioService = initializeGpio(config.gpio);

  // Initialize PrintService
  const printService = new PrintService(config);

  // Add print service event listeners for logging
  printService.on("job-created", (job: PrintJob) => {
    logger.debug(`Print job created: ${job.id}`);
  });

  printService.on("job-completed", (job: PrintJob) => {
    logger.info(`Print job completed: ${job.id}`);
  });

  printService.on("job-failed", (job: PrintJob) => {
    logger.error(`Print job failed: ${job.id}, error: ${job.error}`);
  });

  return {
    gpio: gpioService,
    print: printService,
  };
}

/**
 * Set up all WebSocket event handlers
 */
function setupWebSocketHandlers(services) {
  wsClient.on(
    "print",
    async (data: {
      fileContent: string;
      fileName: string;
      printer?: string;
      options?: PrintOptions;
    }) => {
      logger.info(
        `Received print job: ${data.fileName}${data.printer ? ` to printer ${data.printer}` : ""}`,
      );

      try {
        // First add to our print queue
        const jobId = await services.print.print(data.fileContent);

        // Then use the original print function (to be replaced later with our queue system)
        const result = await printFile(data.fileContent, data.fileName, {
          printer: data.printer,
          ...data.options,
        });

        if (result.success) {
          logger.info(
            `Print job submitted successfully${result.jobId ? `, job ID: ${result.jobId}` : ""}`,
          );

          // Update websocket clients with job status
          wsClient.sendJobStatus({
            id: jobId,
            status: "submitted",
            details: {
              printer: data.printer,
              fileName: data.fileName,
              queuePosition: 1,
            },
          });
        } else {
          logger.error(`Print job failed: ${result.error}`);

          // Update websocket clients with error
          wsClient.sendJobStatus({
            id: jobId,
            status: "error",
            error: result.error,
          });
        }
      } catch (error) {
        logError("Error processing print job", error);

        // Notify of error through websocket if possible
        wsClient.sendError({
          type: "print_error",
          message: error.message || "Unknown print error",
          timestamp: new Date().toISOString(),
        });
      }
    },
  );

  wsClient.on("connected", () => {
    logWebSocketConnection(true, config.websocket.url);

    // Send system status after connection
    wsClient.sendStatus({
      status: "ready",
      printQueueSize: services.print.status.queueSize,
      printQueuePending: services.print.status.pendingJobs,
      gpio: config.gpio.enabled,
    });
  });

  wsClient.on("disconnected", () => {
    logWebSocketConnection(false, config.websocket.url);
  });

  wsClient.on("error", (error: Error) => {
    logError("WebSocket error", error);
  });
}

/**
 * Connect to WebSocket server
 */
async function connectWebSocket(): Promise<void> {
  try {
    await wsClient.connect();
    return Promise.resolve();
  } catch (error) {
    logger.error("Failed to connect to WebSocket server:", error);
    return await Promise.reject(error);
  }
}

/**
 * Set up all process handlers for graceful shutdown
 */
function setupProcessHandlers(services) {
  // Common cleanup function for different signals
  const gracefulShutdown = async (exitCode = 0) => {
    if (isShuttingDown) {
      return;
    } // Prevent multiple shutdown calls
    isShuttingDown = true;

    logSystemShutdown();

    // Stop health checks
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
    }

    // Cleanup in sequence to ensure proper shutdown
    try {
      // Close WebSocket connection
      await wsClient.close();

      // Cleanup services
      services.gpio.cleanup();
      services.print.cleanup();

      logger.info("All resources cleaned up successfully");
    } catch (error) {
      logger.error("Error during shutdown:", error);
    } finally {
      process.exit(exitCode);
    }
  };

  // Handle process termination
  process.on("SIGINT", () => gracefulShutdown(0));
  process.on("SIGTERM", () => gracefulShutdown(0));

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    logError("Uncaught exception", error);
    gracefulShutdown(1);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason) => {
    logError("Unhandled promise rejection", reason);
    // Don't exit for unhandled promises
  });
}

/**
 * Start periodic health checks
 */
function startHealthChecks(services) {
  healthCheckInterval = setInterval(() => {
    try {
      const printStatus = services.print.status;
      const isWebsocketConnected = wsClient.isConnected();

      // Log health status periodically
      logger.debug(
        "Health check: " +
          `WebSocket=${isWebsocketConnected ? "connected" : "disconnected"}, ` +
          `Print queue=${printStatus.queueSize} (${printStatus.pendingJobs} pending)`,
      );

      // TODO: Implement recovery actions for unhealthy components
    } catch (error) {
      logger.error("Health check error:", error);
    }
  }, 60000); // Every minute
}

/**
 * Play startup sound and log system startup
 */
async function startupNotification() {
  // Log system startup
  logSystemStartup();

  // Play startup sound
  try {
    await playSound("newOrder");
  } catch (error) {
    logger.warn("Failed to play startup sound - sound file may be missing");
  }
}

// Start the application
boot().catch((error) => {
  logger.error("Failed to start application:", error);
  process.exit(1);
});
