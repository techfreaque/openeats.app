import "server-only";

import type { Server as HttpServer } from "http";

import type { ApiConfig } from "../../../client/config";
import { configureApi } from "../../../client/config";
import { setGlobalErrorHandler } from "../../../shared/utils/error-handler";
import { debugLogger, errorLogger } from "../../../shared/utils/logger";
import { initializeSocketServer } from "../../websocket/server";
import type { DataProvider } from "../data/data-provider";
import { setDataProvider } from "../data/data-provider";
import { DrizzleDataProvider } from "../data/drizzle-provider";

/**
 * WebSocket configuration options
 */
export interface WebSocketOptions {
  /**
   * Whether to enable WebSocket support
   * @default false
   */
  enabled?: boolean;

  /**
   * WebSocket server path
   * @default "/api/ws"
   */
  path?: string;

  /**
   * CORS origin
   * @default "*"
   */
  corsOrigin?: string | string[];
}

/**
 * API Library initialization options
 */
export interface ApiLibraryOptions {
  /**
   * Data provider implementation
   * @default DrizzleDataProvider
   */
  dataProvider?: DataProvider;

  /**
   * Drizzle client instance
   * Not currently used, but kept for future extensibility
   */
  drizzleClient?: unknown;

  /**
   * API configuration options
   * Used to configure the client-side API behavior
   */
  apiConfig?: Partial<ApiConfig>;

  /**
   * Global error handler
   * Used to handle uncaught errors in the API
   */
  errorHandler?: (error: Error, context?: string) => void;

  /**
   * HTTP server instance
   * Required for WebSocket support
   */
  httpServer?: HttpServer;

  /**
   * WebSocket configuration options
   * Used to enable and configure WebSocket support
   */
  webSocket?: WebSocketOptions;
}

/**
 * Initialize the API library
 * This should be called at the start of your application
 *
 * @param options - Configuration options for the API library
 * @returns void
 *
 * @example
 * ```typescript
 * import { createServer } from 'http';
 * import { initApiLibrary } from 'next-vibe/server';
 * import { db } from '@/app/api/db';
 * import { DrizzleDataProvider } from 'next-vibe/server/endpoints/data';
 *
 * const server = createServer();
 *
 * initApiLibrary({
 *   dataProvider: new DrizzleDataProvider(),
 *   httpServer: server,
 *   webSocket: {
 *     enabled: true,
 *     path: '/api/ws',
 *     corsOrigin: '*',
 *   },
 * });
 * ```
 */
let initialized = false;
export function initApiLibrary(options: ApiLibraryOptions = {}): void {
  if (initialized) {
    return;
  }
  initialized = true;
  debugLogger("Initializing API library settings");

  try {
    // Set up global error handler if provided
    if (options.errorHandler) {
      setGlobalErrorHandler(options.errorHandler);
    }

    // Set up data provider based on options
    if (options.dataProvider) {
      setDataProvider(options.dataProvider);
    } else {
      // Default to Drizzle with auto-created client
      setDataProvider(new DrizzleDataProvider());
    }

    // Configure API
    if (options.apiConfig) {
      configureApi(options.apiConfig);
    }

    // Initialize WebSocket server if enabled
    if (options.webSocket?.enabled && options.httpServer) {
      initializeSocketServer(
        options.httpServer,
        options.webSocket.path,
        options.webSocket.corsOrigin,
      );
    }
  } catch (error) {
    // Log error and rethrow
    errorLogger("Error initializing API library:", error);
    throw error;
  }
}
