import "server-only";

import { initApiLibrary } from "next-vibe/server/endpoints/core/init-api-library";

export function initializeApi(): void {
  // Initialize API library without HTTP server
  // WebSocket handling will be done by the WebSocket route
  initApiLibrary({
    apiConfig: {
      defaultStaleTime: 30000,
      defaultCacheTime: 300000,
    },
  });
}
