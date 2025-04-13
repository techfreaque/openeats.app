import "server-only";

import type { Server as HttpServer } from "http";
import { env, initializeSocketServer } from "next-vibe/server";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { envClient } from "@/config/env-client";

/**
 * Initialize the WebSocket server
 * This function should be called during app startup
 * @param httpServer - HTTP server instance
 * @returns true if initialization was successful, false otherwise
 */
export function initializeWebSocketServer(httpServer: HttpServer): boolean {
  try {
    const dev = env.NODE_ENV !== "production";
    const corsOrigin = dev ? "*" : envClient.NEXT_PUBLIC_BACKEND_URL;

    // Initialize WebSocket server
    initializeSocketServer(httpServer, "/api/ws", corsOrigin);

    debugLogger("WebSocket server initialized successfully");
    return true;
  } catch (error) {
    errorLogger("Failed to initialize WebSocket server:", error);
    return false;
  }
}
