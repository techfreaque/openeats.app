import type { PrismaClient } from "@prisma/client";

import { setGlobalErrorHandler } from "../../../shared/utils/error-handler";
import type { ApiConfig } from "../../config";
import { configureApi } from "../../config";
import type { DataProvider } from "../data/data-provider";
import { MockDataProvider, setDataProvider } from "../data/data-provider";
import { PrismaDataProvider } from "../data/prisma-provider";

/**
 * API Library initialization options
 */
export interface ApiLibraryOptions {
  /**
   * Data provider implementation (optional if using Prisma)
   */
  dataProvider?: DataProvider;

  /**
   * Prisma client instance (optional)
   */
  prismaClient?: PrismaClient;

  /**
   * Use mock data provider with optional mock data (for testing/simple apps)
   */
  useMockProvider?: boolean;

  /**
   * Mock data for the mock provider
   */
  mockData?: Record<string, any>;

  /**
   * API configuration options (optional)
   */
  apiConfig?: Partial<ApiConfig>;

  /**
   * Global error handler (optional)
   */
  errorHandler?: (error: Error, context?: string) => void;
}

/**
 * Initialize the API library
 * This should be called at the start of your application
 */
export function initApiLibrary(options: ApiLibraryOptions = {}): void {
  // Set up global error handler if provided
  if (options.errorHandler) {
    setGlobalErrorHandler(options.errorHandler);
  }

  // Set up data provider based on options
  if (options.dataProvider) {
    setDataProvider(options.dataProvider);
  } else if (options.useMockProvider) {
    setDataProvider(new MockDataProvider(options.mockData));
  } else if (options.prismaClient) {
    // Use Prisma implementation with provided client
    setDataProvider(new PrismaDataProvider(options.prismaClient));
  } else {
    // Default to Prisma with auto-created client
    setDataProvider(new PrismaDataProvider());
  }

  // Configure API
  if (options.apiConfig) {
    configureApi(options.apiConfig);
  }
}
