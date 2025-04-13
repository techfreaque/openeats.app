import "server-only";

import { initApiLibrary } from "next-vibe/server/endpoints/core/init-api-library";
import { debugLogger } from "next-vibe/shared/utils/logger";

let initialized = false;

export function initializeApi(): void {
  if (initialized) {
    return;
  }

  debugLogger("Initializing API library settings");

  // Initialize API library without HTTP server
  // WebSocket handling will be done by the WebSocket route
  initApiLibrary({
    apiConfig: {
      defaultStaleTime: 30000,
      defaultCacheTime: 300000,
    },
  });

  initialized = true;
}
