/* global NodeJS */

import type { Server } from "http";
import { createServer } from "http";
import next from "next";
import { debugLogger, errorLogger } from "next-vibe/shared";
import { cwd } from "process";
import { parse } from "url";

import { env } from "@/config/env";

// Server state (singleton)
let app: ReturnType<typeof next> | undefined = undefined;
let server: Server | undefined = undefined;

/**
 * Starts the Next.js test server on a random available port if preferred port is in use
 */
export async function startServer(): Promise<void> {
  // If server is already running, just return the URL
  if (server) {
    return;
  }

  try {
    debugLogger(`Starting test server on ${env.TEST_SERVER_URL}:4000`);

    app = next({
      dev: true,
      dir: cwd(),
      quiet: false, // Enable to see more details
    });

    await app.prepare();

    const handle = app.getRequestHandler();

    return await new Promise((resolve, reject) => {
      // Try with preferred port first, but fall back to a random port if needed
      server = createServer((req, res) => {
        const parsedUrl = parse(req.url ?? "", true);
        void handle(req, res, parsedUrl);
      });

      server.once("error", (err: NodeJS.ErrnoException) => {
        errorLogger("Server startup error:", err);

        // If the port is in use, try again with a random port
        if (err.code === "EADDRINUSE") {
          debugLogger(
            `Port ${env.TEST_SERVER_URL} is in use, not starting again...`,
          );
          return;
        }

        reject(new Error(`Failed to start server: ${err.message}`));
      });
      server.listen(4000, () => {
        debugLogger(`> E2E test server started on ${env.TEST_SERVER_URL}:4000`);
        resolve();
      });
    });
  } catch (error) {
    errorLogger("Failed to start server:", error);
    throw error;
  }
}

/**
 * Stops the test server
 * This is designed to be called once from global-teardown
 */
export async function stopServer(): Promise<void> {
  return await new Promise((resolve) => {
    if (!server) {
      debugLogger("Server is not running, nothing to stop");
      resolve();
      return;
    }

    debugLogger("Attempting to close test server...");
    server.close((err) => {
      if (err) {
        errorLogger("Error closing server:", err);
        // Resolve anyway since we're shutting down
      }

      debugLogger("> E2E test server closed");
      server = undefined;
      app = undefined;

      // Add a small delay to ensure all connections are properly closed
      setTimeout(() => {
        resolve();
      }, 100);
    });
  });
}
